/* eslint-disable array-callback-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-underscore-dangle */
import { rootPath } from 'electron-root-path';
import Installer from '../../interface/installer/installer';
import Env, { NETWORK_TYPE } from '../Env';
import * as scp from '../../common/scp';
import Node from '../Node';
import * as script from '../../common/script';
import * as ssh from '../../common/ssh';
import * as git from '../../common/git';
import CONST from '../../constants/constant';

export default class KubernetesInstaller extends Installer {
  // singleton
  private static instance: KubernetesInstaller;

  private constructor() {
    super();
    KubernetesInstaller.instance = this;
  }

  static get getInstance() {
    if (!KubernetesInstaller.instance) {
      KubernetesInstaller.instance = new KubernetesInstaller();
    }
    return this.instance;
  }

  public async install() {
    throw new Error("Method not implemented.");
  }

  public async remove() {
    throw new Error("Method not implemented.");
  }

  public async removeWorker() {
    console.error('###### Start remove Worker... ######');
    const { workerArr } = this.env.getNodesSortedByRole();
    await Promise.all(
      workerArr.map((worker: Node) => {
        worker.cmd = worker.os.getK8sMasterRemoveScript();
        return worker.exeCmd();
      })
    );
    console.error('###### Finish remove Worker... ######');
  }

  public async removeMaster() {
    console.error('###### Start remove Master... ######');
    const { masterArr } = this.env.getNodesSortedByRole();
    await Promise.all(
      masterArr.map((master: Node) => {
        master.cmd = master.os.getK8sMasterRemoveScript();
        return master.exeCmd();
      })
    );
    console.error('###### Finish remove Master... ######');
  }

  public async removeMainMaster() {
    console.error('###### Start remove main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = mainMaster.os.getK8sMasterRemoveScript();
    await mainMaster.exeCmd();
    console.error('###### Finish remove main Master... ######');
  }

  public async preWorkInstall(
    registry: string,
    version: string,
    callback?: any
  ) {
    console.error('###### Start pre-installation... ######');
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      // internal network 경우 해주어야 할 작업들
      /**
       * 1. 패키지 파일 다운(client 로컬), 전송(각 노드), 설치 (각 노드)
       * 2. git guide 다운(client 로컬), 전송(각 노드)
       * 3. 설치 이미지 파일 다운(client 로컬), 전송(각 노드)
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
       * 1. public 패키지 레포 등록 (각 노드)
       * 2. git guide clone (각 노드)
       */
      await this._setPublicPackageRepository(callback);
      await this._cloneGitFile(callback);
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
    console.error('###### Finish pre-installation... ######');
  }

  public async installMainMaster(registry: string, version: string, callback: any) {
    console.error('###### Start installing main Master... ######');
    const { mainMaster, masterArr } = this.env.getNodesSortedByRole();
    mainMaster.cmd = mainMaster.os.getInstallMainMasterScript(
      mainMaster,
      registry,
      version,
      masterArr.length > 0
    );
    await mainMaster.exeCmd(callback);
    console.error('###### Finish installing main Master... ######');
  }

  public async installMaster(registry: string, version: string, callback: any) {
    console.error('###### Start installing Master... ######');
    const { mainMaster, masterArr } = this.env.getNodesSortedByRole();
    const masterJoinCmd = await this.getMasterJoinCmd(mainMaster);
    await Promise.all(
      masterArr.map((master, index) => {
        master.cmd = master.os.getInstallMasterScript(
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

  public async installWorker(registry: string, version: string, callback?: any) {
    console.error('###### Start installing Worker... ######');
    const { mainMaster, workerArr } = this.env.getNodesSortedByRole();
    const workerJoinCmd = await this.getWorkerJoinCmd(mainMaster);
    await Promise.all(
      workerArr.map(worker => {
        worker.cmd = worker.os.getInstallWorkerScript(
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

  public async addWorker(registry: string, version: string, callback?: any) {
    await this._preWorkAddWorker(registry, version, callback);

    console.error('###### Start adding Worker... ######');
    const { mainMaster, workerArr } = this.env.getNodesSortedByRole();
    const workerJoinCmd = await this.getWorkerJoinCmd(mainMaster);
    await Promise.all(
      workerArr.map(worker => {
        worker.cmd = worker.os.getInstallWorkerScript(
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
      command += script.getDeleteWorkerNodeScript(worker);
    });
    mainMaster.cmd = command;
    await mainMaster.exeCmd();

    workerArr.map((worker) => {
      command = worker.os.getK8sMasterRemoveScript();
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
       * 1. 패키지 파일 다운(client 로컬), 전송(각 노드), 설치 (각 노드)
       * 2. git guide 다운(client 로컬), 전송(각 노드)
       * 3. 설치 이미지 파일 다운(client 로컬), 전송(각 노드)
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
       * 1. public 패키지 레포 등록 (각 노드)
       * 2. git guide clone (각 노드)
       */
      await this._setPublicPackageRepository(callback);
      await this._cloneGitFile(callback);
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
        node.cmd = node.os.setPackageRepository(destPath);
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

  protected async _downloadImageFile() {
    // TODO: download kubernetes image file
    console.error('###### Start downloading the image file to client local... ######');
    console.error('###### Finish downloading the image file to client local... ######');
  }

  protected async _sendImageFile() {
    console.error('###### Start sending the image file to main master node... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const srcPath = `${rootPath}/k8s-install/`;
    await scp.sendFile(mainMaster, srcPath, `k8s-install/`);
    console.error('###### Finish sending the image file to main master node... ######');
  }

  private async _setPublicPackageRepository(callback: any) {
    console.error('###### Start setting the public package repository at each node... ######');
    await Promise.all(
      this.env.nodeList.map((node: Node) => {
        node.cmd = node.os.setCrioRepo(script.CRIO_VERSION)
        node.cmd += node.os.setKubernetesRepo()
        return node.exeCmd(callback);
      })
    );
    console.error('###### Finish setting the public package repository at each node... ######');
  }

  private async _cloneGitFile(callback: any) {
    console.error('###### Start clone the GIT file at each node... ######');
    await Promise.all(
      this.env.nodeList.map((node: Node) => {
        node.cmd = node.os.cloneGitFile(CONST.GIT_REPO);
        return node.exeCmd(callback);
      })
    );
    console.error('###### Finish clone the GIT file at each node... ######');
  }

  private async _installImageRegistry(registry: string, callback: any) {
    console.error('###### Start installing the image registry at main master node... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = mainMaster.os.getImageRegistrySettingScript(
      registry,
      this.env.networkType
    );
    await mainMaster.exeCmd(callback);
    console.error('###### Finish installing the image registry at main master node... ######');
  }

  protected async _pushImageFileToRegistry(param: object) {
    console.error('###### Start pushing the image at main master node... ######');
    const { registry, callback } = param;
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = script.getKubernetesImagePushScript(
      registry,
      this.env.networkType
    );
    await mainMaster.exeCmd(callback);
    console.error('###### Finish pushing the image at main master node... ######');
  }

  private async getWorkerJoinCmd(mainMaster: Node) {
    mainMaster.cmd = script.getK8sClusterWorkerJoinScript();
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

  private async getMasterJoinCmd(mainMaster: Node) {
    mainMaster.cmd = script.getK8sClusterMasterJoinScript();
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
}
