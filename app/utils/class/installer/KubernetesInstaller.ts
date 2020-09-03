/* eslint-disable array-callback-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-underscore-dangle */
import { rootPath } from 'electron-root-path';
import AbstractInstaller from './AbstractInstaller';
import Env, { NETWORK_TYPE } from '../Env';
import * as scp from '../../common/scp';
import Node from '../Node';
import * as script from '../../common/script';
import * as ssh from '../../common/ssh';
import * as git from '../../common/git';
import CONST from '../../constants/constant';
import ScriptKubernetesFactory from '../script/ScriptKubernetesFactory';

export default class KubernetesInstaller extends AbstractInstaller {
  public static readonly INSTALL_HOME=`hypercloud-install-guide/K8S_Master/installer`;

  public static readonly IMAGE_REGISTRY_INSTALL_HOME=`hypercloud-install-guide/Image_Registry/installer`;


  public static readonly IMAGE_DIR=`k8s-install`;

  public static readonly CRIO_VERSION = `1.17`;

  // singleton
  private static instance: KubernetesInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!KubernetesInstaller.instance) {
      KubernetesInstaller.instance = new KubernetesInstaller();
    }
    return this.instance;
  }

  public async install(param: { registry: string; version: string; callback: any; setProgress: Funtion; }) {
    const { registry, version, callback, setProgress } = param;

    await this._preWorkInstall({
      registry,
      version,
      callback
    })
    setProgress(40);

    await this._installMainMaster(
      registry,
      version,
      callback
    )
    setProgress(60);

    await this._installMaster(
      registry,
      version,
      callback
    )
    setProgress(80);

    await this._installWorker(
      registry,
      version,
      callback
    )
    setProgress(100);
  }

  public async remove() {
    await this._removeWorker();
    await this._removeMaster();
    await this._removeMainMaster();
  }

  private async _installMainMaster(registry: string, version: string, callback: any) {
    console.error('###### Start installing main Master... ######');
    const { mainMaster, masterArr } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getK8sMainMasterInstallScript(
      mainMaster,
      registry,
      version,
      masterArr.length > 0
    );
    await mainMaster.exeCmd(callback);
    console.error('###### Finish installing main Master... ######');
  }

  private async _installMaster(registry: string, version: string, callback: any) {
    console.error('###### Start installing Master... ######');
    const { mainMaster, masterArr } = this.env.getNodesSortedByRole();
    const masterJoinCmd = await this._getMasterJoinCmd(mainMaster);
    await Promise.all(
      masterArr.map((master, index) => {
        master.cmd = this._getK8sMasterInstallScript(
          mainMaster,
          registry,
          version,
          master,
          99-index
        );
        master.cmd += `${masterJoinCmd.trim()} --cri-socket=/var/run/crio/crio.sock;`;
        return master.exeCmd(callback);
      })
    );
    console.error('###### Finish installing Master... ######');
  }

  private async _installWorker(registry: string, version: string, callback: any) {
    console.error('###### Start installing Worker... ######');
    const { mainMaster, workerArr } = this.env.getNodesSortedByRole();
    const workerJoinCmd = await this._getWorkerJoinCmd(mainMaster);
    await Promise.all(
      workerArr.map(worker => {
        worker.cmd = this._getK8sWorkerInstallScript(
          mainMaster,
          registry,
          version,
          worker
        );
        worker.cmd += `${workerJoinCmd.trim()} --cri-socket=/var/run/crio/crio.sock;`;
        return worker.exeCmd(callback);
      })
    );
    console.error('###### Finish installing Worker... ######');
  }

  private async _removeWorker() {
    console.error('###### Start remove Worker... ######');
    const { workerArr } = this.env.getNodesSortedByRole();
    await Promise.all(
      workerArr.map((worker: Node) => {
        const kubeScript = ScriptKubernetesFactory.createScript(worker.os.type);
        worker.cmd = kubeScript.getK8sMasterRemoveScript();
        return worker.exeCmd();
      })
    );
    console.error('###### Finish remove Worker... ######');
  }

  private async _removeMaster() {
    console.error('###### Start remove Master... ######');
    const { masterArr } = this.env.getNodesSortedByRole();
    await Promise.all(
      masterArr.map((master: Node) => {
        const kubeScript = ScriptKubernetesFactory.createScript(master.os.type);
        master.cmd = kubeScript.getK8sMasterRemoveScript();
        return master.exeCmd();
      })
    );
    console.error('###### Finish remove Master... ######');
  }

  private async _removeMainMaster() {
    console.error('###### Start remove main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const kubeScript = ScriptKubernetesFactory.createScript(mainMaster.os.type);
    mainMaster.cmd = kubeScript.getK8sMasterRemoveScript();
    await mainMaster.exeCmd();
    console.error('###### Finish remove main Master... ######');
  }

  public async addWorker(registry: string, version: string, callback: any) {
    await this._preWorkAddWorker(registry, version, callback);

    console.error('###### Start adding Worker... ######');
    const { mainMaster, workerArr } = this.env.getNodesSortedByRole();
    const workerJoinCmd = await this._getWorkerJoinCmd(mainMaster);
    await Promise.all(
      workerArr.map(worker => {
        worker.cmd = this._getK8sWorkerInstallScript(
          mainMaster,
          registry,
          version,
          worker
        );
        worker.cmd += `${workerJoinCmd.trim()} --cri-socket=/var/run/crio/crio.sock;`;
        return worker.exeCmd(callback);
      })
    );
    console.error('###### Finish adding Worker... ######');
  }

  public async deleteWorker() {
    console.error('###### Start deleting Worker... ######');
    const { mainMaster, workerArr } = this.env.getNodesSortedByRole();
    let command = '';
    workerArr.map(worker => {
      command += this._getDeleteWorkerNodeScript(worker);
    });
    mainMaster.cmd = command;
    await mainMaster.exeCmd();

    workerArr.map((worker) => {
      const kubeScript = ScriptKubernetesFactory.createScript(worker.os.type);
      command = kubeScript.getK8sMasterRemoveScript();
      worker.cmd = command;
      worker.exeCmd();
    });
    console.error('###### Finish deleting Worker... ######');
  }

  private async _preWorkAddWorker(
    registry: string,
    version: string,
    callback?: any
  ) {
    console.error('###### Start pre work adding Worker... ######');
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      // internal network 경우 해주어야 할 작업들
      /**
       * 1. 패키지 파일 다운(client 로컬), 전송(각 노드), 설치 (각 노드) (현재 Kubernetes 설치 시에만 진행)
       * 2. git guide 다운(client 로컬), 전송(각 노드) (현재 Kubernetes 설치 시에만 진행)
       * 3. 해당 이미지 파일 다운(client 로컬), 전송 (main 마스터 노드)
       */
      await this._downloadPackageFile();
      await this._sendPackageFile();
      await this._installLocalPackageRepository(callback);

      await this._downloadGitFile();
      await this._sendGitFile();

      await this._downloadImageFile();
      await this._sendImageFile();

    } else if (this.env.networkType === NETWORK_TYPE.EXTERNAL) {
      // external network 경우 해주어야 할 작업들
      /**
       * 1. git guide clone (각 노드) (현재 Kubernetes 설치 시에만 진행)
       * 2. public 패키지 레포 등록 (각 노드) (필요 시)
       */
      await this._cloneGitFile(callback);
      await this._setPublicPackageRepository(callback);
    }

    if (registry) {
      // 내부 image registry 구축 경우 해주어야 할 작업들
      /**
       * 1. image registry 설치 (main 마스터 노드)
       * 2. 설치 이미지 push
       */
      await this._installImageRegistry(registry, callback);
      await this._pushImageFileToRegistry({
        registry: this.env.registry,
        callback
      });
    }
    console.error('###### Finish pre work adding Worker... ######');
  }

  private async _downloadPackageFile() {
    // TODO: download package file
    console.error('###### Start downloading the package file to client local... ######');
    console.error('###### Finish downloading the package file to client local... ######');
  }

  private async _sendPackageFile() {
    console.error('###### Start sending the package file to each node (using scp)... ######');
    const srcPath = `${rootPath}/${Env.TARGET_ARC_NAME}/`;
    const destPath = `${Env.TARGET_ARC_NAME}/`;
    console.debug(`srcPath`, srcPath);
    console.debug(`destPath`, destPath);
    await Promise.all(
      this.env.nodeList.map(node => {
        return scp.sendFile(node, srcPath, destPath);
      })
    );
    console.error('###### Finish sending the package file to each node (using scp)... ######');
  }

  private async _installLocalPackageRepository(callback: any) {
    console.error('###### Start installing the local package repository at each node... ######');
    const destPath = `${Env.TARGET_ARC_NAME}/`;
    await Promise.all(
      this.env.nodeList.map((node: Node) => {
        const kubeScript = ScriptKubernetesFactory.createScript(node.os.type);
        node.cmd = kubeScript.setPackageRepository(destPath);
        return node.exeCmd(callback);
      })
    );
    console.error('###### Finish installing the local package repository at each node... ######');
  }

  private async _downloadGitFile() {
    console.error('###### Start downloading the GIT file to client local... ######');
    const localPath = `${rootPath}/hypercloud-install-guide/`;
    console.debug(`repoPath`, CONST.GIT_REPO);
    console.debug(`localPath`, localPath);
    await git.clone(CONST.GIT_REPO, localPath);
    console.error('###### Finish downloading the GIT file to client local... ######');
  }

  private async _sendGitFile() {
    console.error('###### Start sending the GIT file to each node (using scp)... ######');
    const localPath = `${rootPath}/hypercloud-install-guide/`;
    await Promise.all(
      this.env.nodeList.map(node => {
        return scp.sendFile(node, localPath, `hypercloud-install-guide/`);
      })
    );
    console.error('###### Finish sending the GIT file to each node (using scp)... ######');
  }

  private async _setPublicPackageRepository(callback: any) {
    console.error('###### Start setting the public package repository at each node... ######');
    await Promise.all(
      this.env.nodeList.map((node: Node) => {
        const kubeScript = ScriptKubernetesFactory.createScript(node.os.type);
        node.cmd = kubeScript.setCrioRepo(KubernetesInstaller.CRIO_VERSION)
        node.cmd += kubeScript.setKubernetesRepo()
        return node.exeCmd(callback);
      })
    );
    console.error('###### Finish setting the public package repository at each node... ######');
  }

  private async _cloneGitFile(callback: any) {
    console.error('###### Start clone the GIT file at each node... ######');
    await Promise.all(
      this.env.nodeList.map((node: Node) => {
        const kubeScript = ScriptKubernetesFactory.createScript(node.os.type);
        node.cmd = kubeScript.cloneGitFile(CONST.GIT_REPO, CONST.GIT_BRANCH);
        return node.exeCmd(callback);
      })
    );
    console.error('###### Finish clone the GIT file at each node... ######');
  }

  private async _installImageRegistry(registry: string, callback: any) {
    console.error('###### Start installing the image registry at main master node... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const kubeScript = ScriptKubernetesFactory.createScript(mainMaster.os.type);
    mainMaster.cmd = kubeScript.getImageRegistrySettingScript(
      registry,
      this.env.networkType
    );
    await mainMaster.exeCmd(callback);
    console.error('###### Finish installing the image registry at main master node... ######');
  }

  private _getK8sClusterMasterJoinScript() {
    return `
    cd ~/${KubernetesInstaller.INSTALL_HOME}/yaml;
    result=\`kubeadm init phase upload-certs --upload-certs --config=./kubeadm-config.yaml\`;
    certkey=\${result#*key:};
    echo "%%%\`kubeadm token create --print-join-command --certificate-key \${certkey}\`%%%"
    `;
  }

  private _getK8sClusterWorkerJoinScript() {
    return `echo "@@@\`kubeadm token create --print-join-command\`@@@"`;
  }

  private _getDeleteWorkerNodeScript(worker: Node) {
    return `
  kubectl drain ${worker.hostName};
  kubectl delete node ${worker.hostName};
  `;
  }

  private _getK8sMainMasterInstallScript(
    mainMaster: Node,
    registry: string,
    version: string,
    isMultiMaster: boolean
  ): string {
    const kubeScript = ScriptKubernetesFactory.createScript(mainMaster.os.type);
    return `
      ${this._setHostName(mainMaster.hostName)}
      ${this._registHostName()}
      ${
        isMultiMaster
          ? kubeScript.getMasterMultiplexingScript(
              mainMaster,
              100,
              mainMaster.ip
            )
          : ''
      }
      cd ~/${KubernetesInstaller.INSTALL_HOME};
      sed -i 's|\\r$||g' k8s.config;
      . k8s.config;
      sudo sed -i "s|$imageRegistry|${registry}|g" ./k8s.config;
      sudo sed -i "s|$crioVersion|${KubernetesInstaller.CRIO_VERSION}|g" ./k8s.config;
      sudo sed -i "s|$k8sVersion|${version}|g" ./k8s.config;
      sudo sed -i "s|$apiServer|${mainMaster.ip}|g" ./k8s.config;
      cp -f ~/hypercloud-install-guide/installer/install.sh .;
      chmod 755 install.sh;
      sed -i 's|\\r$||g' install.sh;
      ./install.sh up mainMaster;
      #rm -rf ~/hypercloud-install-guide;
      ${this._makeMasterCanSchedule(mainMaster.hostName)}
      `;
  }

  private _getK8sMasterInstallScript(
    mainMaster: Node,
    registry: string,
    version: string,
    master: Node,
    priority: number
  ): string {
    const kubeScript = ScriptKubernetesFactory.createScript(master.os.type);
    return `
      ${this._setHostName(master.hostName)}
      ${this._registHostName()}
      ${kubeScript.getMasterMultiplexingScript(master, priority, mainMaster.ip)}
      cd ~/${KubernetesInstaller.INSTALL_HOME};
      sed -i 's|\\r$||g' k8s.config;
      . k8s.config;
      sudo sed -i "s|$imageRegistry|${registry}|g" ./k8s.config;
      sudo sed -i "s|$crioVersion|${KubernetesInstaller.CRIO_VERSION}|g" ./k8s.config;
      sudo sed -i "s|$k8sVersion|${version}|g" ./k8s.config;
      sudo sed -i "s|$apiServer|${mainMaster.ip}|g" ./k8s.config;
      cp -f ~/hypercloud-install-guide/installer/install.sh .;
      chmod 755 install.sh;
      sed -i 's|\\r$||g' install.sh;
      ./install.sh up master;
      #rm -rf ~/hypercloud-install-guide;
      ${this._makeMasterCanSchedule(master.hostName)}
      `;
  }

  private _getK8sWorkerInstallScript(
    mainMaster: Node,
    registry: string,
    version: string,
    worker: Node
  ): string {
    return `
      ${this._setHostName(worker.hostName)}
      ${this._registHostName()}
      cd ~/${KubernetesInstaller.INSTALL_HOME};
      sed -i 's|\\r$||g' k8s.config;
      . k8s.config;
      sudo sed -i "s|$imageRegistry|${registry}|g" ./k8s.config;
      sudo sed -i "s|$crioVersion|${KubernetesInstaller.CRIO_VERSION}|g" ./k8s.config;
      sudo sed -i "s|$k8sVersion|${version}|g" ./k8s.config;
      sudo sed -i "s|$apiServer|${mainMaster.ip}|g" ./k8s.config;
      cp -f ~/hypercloud-install-guide/installer/install.sh .;
      chmod 755 install.sh;
      sed -i 's|\\r$||g' install.sh;
      ./install.sh up worker;
      #rm -rf ~/hypercloud-install-guide;
      `;
  }

  private _makeMasterCanSchedule(hostName: string) {
    return `kubectl taint node ${hostName} node-role.kubernetes.io/master:NoSchedule-;`;
  }

  private _setHostName(hostName: string) {
    return `sudo hostnamectl set-hostname ${hostName};`;
  }

  private _registHostName() {
    return `echo \`hostname -I\` \`hostname\` >> /etc/hosts;`;
  }

  private async _getWorkerJoinCmd(mainMaster: Node) {
    mainMaster.cmd = this._getK8sClusterWorkerJoinScript();
    let workerJoinCmd = '';
    await ssh.send(mainMaster, {
      close: () => {},
      stdout: (data: string) => {
        workerJoinCmd = data.toString().split('@@@')[1];
      },
      stderr: () => {}
    });

    return workerJoinCmd;
  }

  private async _getMasterJoinCmd(mainMaster: Node) {
    mainMaster.cmd = this._getK8sClusterMasterJoinScript();
    let masterJoinCmd = '';
    await ssh.send(mainMaster, {
      close: () => {},
      stdout: (data: string) => {
        masterJoinCmd = data.toString().split('%%%')[1];
      },
      stderr: () => {}
    });

    return masterJoinCmd;
  }

  // protected abstract 구현
  protected async _preWorkInstall(param: { registry: string; version: string; callback: any; }) {
    console.error('###### Start pre-installation... ######');
    const { registry, version, callback } = param;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      // internal network 경우 해주어야 할 작업들
      /**
       * 1. 패키지 파일 다운(client 로컬), 전송(각 노드), 설치 (각 노드) (현재 Kubernetes 설치 시에만 진행)
       * 2. git guide 다운(client 로컬), 전송(각 노드) (현재 Kubernetes 설치 시에만 진행)
       * 3. 해당 이미지 파일 다운(client 로컬), 전송 (main 마스터 노드)
       */
      await this._downloadPackageFile();
      await this._sendPackageFile();
      await this._installLocalPackageRepository(callback);

      await this._downloadGitFile();
      await this._sendGitFile();

      await this._downloadImageFile();
      await this._sendImageFile();

    } else if (this.env.networkType === NETWORK_TYPE.EXTERNAL) {
      // external network 경우 해주어야 할 작업들
      /**
       * 1. git guide clone (각 노드) (현재 Kubernetes 설치 시에만 진행)
       * 2. public 패키지 레포 등록 (각 노드) (필요 시)
       */
      await this._cloneGitFile(callback);
      await this._setPublicPackageRepository(callback);
    }

    if (registry) {
      // 내부 image registry 구축 경우 해주어야 할 작업들
      /**
       * 1. image registry 설치 (main 마스터 노드)
       * 2. 설치 이미지 push
       */
      await this._installImageRegistry(registry, callback);
      await this._pushImageFileToRegistry({
        registry,
        callback
      });
    }
    console.error('###### Finish pre-installation... ######');
  }

  protected async _downloadImageFile() {
    // TODO: download kubernetes image file
    console.error('###### Start downloading the image file to client local... ######');
    console.error('###### Finish downloading the image file to client local... ######');
  }

  protected async _sendImageFile() {
    console.error('###### Start sending the image file to main master node... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const srcPath = `${rootPath}/${KubernetesInstaller.IMAGE_DIR}/`;
    await scp.sendFile(mainMaster, srcPath, `${KubernetesInstaller.IMAGE_DIR}/`);
    console.error('###### Finish sending the image file to main master node... ######');
  }

  protected async _pushImageFileToRegistry(param: { registry: any; callback: any; }) {
    console.error('###### Start pushing the image at main master node... ######');
    const { registry, callback } = param;
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getImagePushScript(registry);
    await mainMaster.exeCmd(callback);
    console.error('###### Finish pushing the image at main master node... ######');
  }

  protected _getImagePushScript(registry: string) {
    const path = `~/${KubernetesInstaller.IMAGE_DIR}`;
    let gitPullCommand = `
    mkdir -p ${path};
    cd ${path};
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      sudo docker load -i kube-apiserver.tar;
      sudo docker load -i kube-scheduler.tar;
      sudo docker load -i kube-controller-manager.tar ;
      sudo docker load -i kube-proxy.tar;
      sudo docker load -i etcd.tar;
      sudo docker load -i coredns.tar;
      sudo docker load -i pause.tar;
      `;
    } else {
      gitPullCommand += `
      sudo docker pull k8s.gcr.io/kube-proxy:v1.17.6;
      sudo docker pull k8s.gcr.io/kube-apiserver:v1.17.6;
      sudo docker pull k8s.gcr.io/kube-controller-manager:v1.17.6;
      sudo docker pull k8s.gcr.io/kube-scheduler:v1.17.6;
      sudo docker pull k8s.gcr.io/etcd:3.4.3-0;
      sudo docker pull k8s.gcr.io/coredns:1.6.5;
      sudo docker pull k8s.gcr.io/pause:3.1;
      `;
    }

    return `
      ${gitPullCommand}
      sudo docker tag k8s.gcr.io/kube-apiserver:v1.17.6 ${registry}/k8s.gcr.io/kube-apiserver:v1.17.6;
      sudo docker tag k8s.gcr.io/kube-proxy:v1.17.6 ${registry}/k8s.gcr.io/kube-proxy:v1.17.6;
      sudo docker tag k8s.gcr.io/kube-controller-manager:v1.17.6 ${registry}/k8s.gcr.io/kube-controller-manager:v1.17.6;
      sudo docker tag k8s.gcr.io/etcd:3.4.3-0 ${registry}/k8s.gcr.io/etcd:3.4.3-0;
      sudo docker tag k8s.gcr.io/coredns:1.6.5 ${registry}/k8s.gcr.io/coredns:1.6.5;
      sudo docker tag k8s.gcr.io/kube-scheduler:v1.17.6 ${registry}/k8s.gcr.io/kube-scheduler:v1.17.6;
      sudo docker tag k8s.gcr.io/pause:3.1 ${registry}/k8s.gcr.io/pause:3.1;

      sudo docker push ${registry}/k8s.gcr.io/kube-apiserver:v1.17.6;
      sudo docker push ${registry}/k8s.gcr.io/kube-proxy:v1.17.6;
      sudo docker push ${registry}/k8s.gcr.io/kube-controller-manager:v1.17.6;
      sudo docker push ${registry}/k8s.gcr.io/etcd:3.4.3-0;
      sudo docker push ${registry}/k8s.gcr.io/coredns:1.6.5;
      sudo docker push ${registry}/k8s.gcr.io/kube-scheduler:v1.17.6;
      sudo docker push ${registry}/k8s.gcr.io/pause:3.1;
      #rm -rf ${path};
      `;
  }
}
