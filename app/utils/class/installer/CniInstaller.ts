/* eslint-disable array-callback-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-underscore-dangle */
import { rootPath } from 'electron-root-path';
import * as scp from '../../common/scp';
import AbstractInstaller from './AbstractInstaller';
import CONST from '../../constants/constant';
import { NETWORK_TYPE } from '../Env';
import ScriptCniFactory from '../script/ScriptCniFactory';
import KubernetesInstaller from './KubernetesInstaller';
import AbstractScript from '../script/AbstractScript';

export default class CniInstaller extends AbstractInstaller {
  public static readonly INSTALL_HOME=`hypercloud-install-guide/CNI`;

  public static readonly IMAGE_DIR=`cni-install`;

  public static readonly CNI_VERSION=`3.13.4`;

  public static readonly CTL_VERSION=`3.15.0`;

  // singleton
  private static instance: CniInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!CniInstaller.instance) {
      CniInstaller.instance = new CniInstaller();
    }
    return this.instance;
  }

  public async install(param: { type: string; version: string; callback: any; setProgress: Function; }) {
    const { type, version, callback, setProgress } = param;

    setProgress(10);
    await this._preWorkInstall({
      version,
      callback
    });
    setProgress(60);
    await this._installMainMaster(type, version, callback);
    setProgress(100);
  }

  public async remove(param: { type: any; version: any; }) {
    const { type, version } = param;

    await this._removeMainMaster(type, version);
  }

  private async _installMainMaster(type: string, version: string, callback: any) {
    console.error('###### Start installing main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const script = ScriptCniFactory.createScript(mainMaster.os.type)
    mainMaster.cmd = script.cloneGitFile(CONST.GIT_REPO, CONST.GIT_BRANCH);
    mainMaster.cmd += this._getInstallScript(version);
    await mainMaster.exeCmd(callback);
    console.error('###### Finish installing main Master... ######');
  }

  private async _removeMainMaster(type: string, version: string) {
    console.error('###### Start remove main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const script = ScriptCniFactory.createScript(mainMaster.os.type)
    mainMaster.cmd = script.cloneGitFile(CONST.GIT_REPO, CONST.GIT_BRANCH);
    mainMaster.cmd += this._getRemoveScript(version);
    await mainMaster.exeCmd();
    console.error('###### Finish remove main Master... ######');
  }

  private _getInstallScript(version: string): string {
    let setRegistry = '';
    // git guide에 내용 보기 쉽게 변경해놓음 (공백 유지해야함)
    if (this.env.registry) {
      setRegistry = `
      # sed -i 's/calico\\/cni/'${this.env.registry}'\\/calico\\/cni/g' calico_${CniInstaller.CNI_VERSION}.yaml;
      # sed -i 's/calico\\/pod2daemon-flexvol/'${this.env.registry}'\\/calico\\/pod2daemon-flexvol/g' calico_${CniInstaller.CNI_VERSION}.yaml;
      # sed -i 's/calico\\/node/'${this.env.registry}'\\/calico\\/node/g' calico_${CniInstaller.CNI_VERSION}.yaml;
      # sed -i 's/calico\\/kube-controllers/'${this.env.registry}'\\/calico\\/kube-controllers/g' calico_${CniInstaller.CNI_VERSION}.yaml;
      # sed -i 's/calico\\/ctl/'${this.env.registry}'\\/calico\\/ctl/g' calicoctl_${CniInstaller.CTL_VERSION}.yaml;

      sed -i 's| calico/cni| '${this.env.registry}'/calico/cni|g' calico_${CniInstaller.CNI_VERSION}.yaml;
      sed -i 's| calico/pod2daemon-flexvol| '${this.env.registry}'/calico/pod2daemon-flexvol|g' calico_${CniInstaller.CNI_VERSION}.yaml;
      sed -i 's| calico/node| '${this.env.registry}'/calico/node|g' calico_${CniInstaller.CNI_VERSION}.yaml;
      sed -i 's| calico/kube-controllers| '${this.env.registry}'/calico/kube-controllers|g' calico_${CniInstaller.CNI_VERSION}.yaml;
      sed -i 's| calico/ctl| '${this.env.registry}'/calico/ctl|g' calicoctl_${CniInstaller.CTL_VERSION}.yaml;
      `;
    }
    return `
      cd ~/${CniInstaller.INSTALL_HOME};
      sed -i 's/v3.13.4/'v${CniInstaller.CNI_VERSION}'/g' calico_${CniInstaller.CNI_VERSION}.yaml;
      . ~/${KubernetesInstaller.INSTALL_HOME}/k8s.config;
      sed -i 's|10.0.0.0/16|'$podSubnet'|g' calico_${CniInstaller.CNI_VERSION}.yaml;
      ${setRegistry}
      kubectl apply -f calico_${CniInstaller.CNI_VERSION}.yaml;
      kubectl apply -f calicoctl_${CniInstaller.CTL_VERSION}.yaml;
      `;
  }

  private _getRemoveScript(version: string): string {
    return `
    cd ~/${CniInstaller.INSTALL_HOME};
    kubectl delete -f calico_${CniInstaller.CNI_VERSION}.yaml;
    kubectl delete -f calicoctl_${CniInstaller.CTL_VERSION}.yaml;
    ${CniInstaller.deleteCniConfigScript()};
    `;
  }

  public static deleteCniConfigScript() {
    return `
      rm -rf /etc/cni/*;
    `;
  }

  // protected abstract 구현
  protected async _preWorkInstall(param: { version: string; callback: any; }) {
    console.error('###### Start pre-installation... ######');
    const { version, callback } = param;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      // internal network 경우 해주어야 할 작업들
      /**
       * 1. 패키지 파일 다운(client 로컬), 전송(각 노드), 설치 (각 노드) (현재 Kubernetes 설치 시에만 진행)
       * 2. git guide 다운(client 로컬), 전송(각 노드) (현재 Kubernetes 설치 시에만 진행)
       * 3. 해당 이미지 파일 다운(client 로컬), 전송 (main 마스터 노드)
       */
      await this._downloadImageFile();
      await this._sendImageFile();
    } else if (this.env.networkType === NETWORK_TYPE.EXTERNAL) {
      // external network 경우 해주어야 할 작업들
      /**
       * 1. git guide clone (각 노드) (현재 Kubernetes 설치 시에만 진행)
       * 2. public 패키지 레포 등록 (각 노드) (필요 시)
       */
    }

    if (this.env.registry) {
      // 내부 image registry 구축 경우 해주어야 할 작업들
      /**
       * 1. 설치 이미지 push
       */
      await this._pushImageFileToRegistry({
        callback
      });
    }
    console.error('###### Finish pre-installation... ######');
  }

  protected async _downloadImageFile() {
    // TODO: download image file
    console.error('###### Start downloading the image file to client local... ######');
    console.error('###### Finish downloading the image file to client local... ######');
  }

  protected async _sendImageFile() {
    console.error('###### Start sending the image file to main master node... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const srcPath = `${rootPath}/${CniInstaller.IMAGE_DIR}/`;
    await scp.sendFile(mainMaster, srcPath, `${CniInstaller.IMAGE_DIR}/`);
    console.error('###### Finish sending the image file to main master node... ######');
  }

  protected async _pushImageFileToRegistry(param: { callback: any; }) {
    console.error('###### Start pushing the image at main master node... ######');
    const { callback } = param;
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getImagePushScript();
    await mainMaster.exeCmd(callback);
    console.error('###### Finish pushing the image at main master node... ######');
  }

  protected _getImagePushScript(): string {
    let gitPullCommand = `
    mkdir -p ~/${CniInstaller.IMAGE_DIR};
    export CNI_HOME=~/${CniInstaller.IMAGE_DIR};
    export CNI_VERSION=v${CniInstaller.CNI_VERSION};
    export CTL_VERSION=v${CniInstaller.CTL_VERSION};
    export REGISTRY=${this.env.registry};
    cd $CNI_HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      sudo docker load < calico-node_\${CNI_VERSION}.tar;
      sudo docker load < calico-pod2daemon-flexvol_\${CNI_VERSION}.tar;
      sudo docker load < calico-cni_\${CNI_VERSION}.tar;
      sudo docker load < calico-kube-controllers_\${CNI_VERSION}.tar;
      sudo docker load < calico-ctl_\${CTL_VERSION}.tar;
      `;
    } else {
      gitPullCommand += `
      sudo docker pull calico/node:\${CNI_VERSION};
      sudo docker pull calico/pod2daemon-flexvol:\${CNI_VERSION};
      sudo docker pull calico/cni:\${CNI_VERSION};
      sudo docker pull calico/kube-controllers:\${CNI_VERSION};
      sudo docker pull calico/ctl:\${CTL_VERSION};
      # curl https://raw.githubusercontent.com/tmax-cloud/hypercloud-install-guide/master/CNI/calico_${CniInstaller.CNI_VERSION}.yaml > calico.yaml;
      # curl https://raw.githubusercontent.com/tmax-cloud/hypercloud-install-guide/master/CNI/calicoctl_${CniInstaller.CTL_VERSION}.yaml > calicoctl.yaml;
      `;
    }
    return `
      ${gitPullCommand}
      sudo docker tag calico/node:\${CNI_VERSION} \${REGISTRY}/calico/node:\${CNI_VERSION};
      sudo docker tag calico/pod2daemon-flexvol:\${CNI_VERSION} \${REGISTRY}/calico/pod2daemon-flexvol:\${CNI_VERSION};
      sudo docker tag calico/cni:\${CNI_VERSION} \${REGISTRY}/calico/cni:\${CNI_VERSION};
      sudo docker tag calico/kube-controllers:\${CNI_VERSION} \${REGISTRY}/calico/kube-controllers:\${CNI_VERSION};
      sudo docker tag calico/ctl:\${CTL_VERSION} \${REGISTRY}/calico/ctl:\${CTL_VERSION};

      sudo docker push \${REGISTRY}/calico/node:\${CNI_VERSION};
      sudo docker push \${REGISTRY}/calico/pod2daemon-flexvol:\${CNI_VERSION};
      sudo docker push \${REGISTRY}/calico/cni:\${CNI_VERSION};
      sudo docker push \${REGISTRY}/calico/kube-controllers:\${CNI_VERSION};
      sudo docker push \${REGISTRY}/calico/ctl:\${CTL_VERSION};
      #rm -rf $CNI_HOME;
      `;
  }
}
