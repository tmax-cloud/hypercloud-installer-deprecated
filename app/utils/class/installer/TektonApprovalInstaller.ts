/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import * as scp from '../../common/scp';
import AbstractInstaller from './AbstractInstaller';
import Env, { NETWORK_TYPE } from '../Env';

export default class TektonApprovalInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR = `approval-install`;

  public static readonly INSTALL_HOME = `${Env.INSTALL_ROOT}/${TektonApprovalInstaller.IMAGE_DIR}`;

  public static readonly IMAGE_HOME = `${Env.INSTALL_ROOT}/${TektonApprovalInstaller.IMAGE_DIR}`;

  // TODO: version 처리 안됨
  public static readonly VERSION = `0.0.3`;

  // singleton
  private static instance: TektonApprovalInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!TektonApprovalInstaller.instance) {
      TektonApprovalInstaller.instance = new TektonApprovalInstaller();
    }
    return this.instance;
  }

  public async install(param: { callback: any; setProgress: Function }) {
    const { callback } = param;

    await this._preWorkInstall({
      callback
    });

    await this._installMainMaster(callback);
  }

  public async remove() {
    await this._removeMainMaster();
  }

  private async _installMainMaster(callback: any) {
    console.debug('@@@@@@ Start installing approval main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();

    // Step 1. Approval 설치
    mainMaster.cmd = this._step1();
    await mainMaster.exeCmd(callback);

    console.debug('###### Finish installing approval main Master... ######');
  }

  private _step1() {
    if (this.env.registry) {
      return `
      cd ~/${TektonApprovalInstaller.INSTALL_HOME};
      kubectl apply -f crd.yaml;
      kubectl apply -f namespace.yaml;
      kubectl apply -f service_account.yaml;
      kubectl apply -f role.yaml;
      kubectl apply -f role_binding.yaml;
      kubectl apply -f service.yaml;
      kubectl apply -f updated.yaml;
      `;
    }
    return `
    cd ~/${TektonApprovalInstaller.INSTALL_HOME};
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/crds/tmax.io_approvals_crd.yaml;
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/namespace.yaml;
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/service_account.yaml;
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/role.yaml;
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/role_binding.yaml;
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/service.yaml;
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/proxy-server.yaml;
    `;
  }

  private async _removeMainMaster() {
    console.debug('@@@@@@ Start remove console main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getRemoveScript();
    await mainMaster.exeCmd();
    console.debug('###### Finish remove console main Master... ######');
  }

  private _getRemoveScript(): string {
    // 설치의 역순으로 실행
    if (this.env.registry) {
      return `
      cd ~/${TektonApprovalInstaller.INSTALL_HOME};
      kubectl delete -f updated.yaml;
      kubectl delete -f service.yaml;
      kubectl delete -f role_binding.yaml;
      kubectl delete -f role.yaml;
      kubectl delete -f service_account.yaml;
      kubectl delete -f namespace.yaml;
      kubectl delete -f crd.yaml;
      `;
    }
    return `
    cd ~/${TektonApprovalInstaller.INSTALL_HOME};
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/proxy-server.yaml;
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/service.yaml;
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/role_binding.yaml;
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/role.yaml;
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/service_account.yaml;
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/namespace.yaml;
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/crds/tmax.io_approvals_crd.yaml;
    `;
  }

  private async _downloadYaml() {
    console.debug('@@@@@@ Start download yaml file from external... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = `
    mkdir -p ~/${TektonApprovalInstaller.INSTALL_HOME};
    cd ~/${TektonApprovalInstaller.INSTALL_HOME};
    wget https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/crds/tmax.io_approvals_crd.yaml crd.yaml;
    wget https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/namespace.yaml;
    wget https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/service_account.yaml;
    wget https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/role.yaml;
    wget https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/role_binding.yaml;
    wget https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/service.yaml;
    wget https://raw.githubusercontent.com/tmax-cloud/approval-watcher/master/deploy/proxy-server.yaml;
    `;
    await mainMaster.exeCmd();
    console.debug('###### Finish download yaml file from external... ######');
  }

  // protected abstract 구현
  protected async _preWorkInstall(param?: any) {
    console.debug('@@@@@@ Start pre-installation... @@@@@@');
    const { callback } = param;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      // internal network 경우 해주어야 할 작업들
      await this._downloadImageFile();
      await this._sendImageFile();
      // TODO: downloadYamlAtLocal();
      // TODO: sendYaml();
    } else if (this.env.networkType === NETWORK_TYPE.EXTERNAL) {
      // external network 경우 해주어야 할 작업들
      await this._downloadYaml();
    }

    if (this.env.registry) {
      // 내부 image registry 구축 경우 해주어야 할 작업들
      await this._registryWork({
        callback
      });
    }
    console.debug('###### Finish pre-installation... ######');
  }

  protected async _downloadImageFile() {
    // TODO: download image file
    console.debug(
      '@@@@@@ Start downloading the image file to client local... @@@@@@'
    );
    console.debug(
      '###### Finish downloading the image file to client local... ######'
    );
  }

  protected async _sendImageFile() {
    console.debug(
      '@@@@@@ Start sending the image file to main master node... @@@@@@'
    );
    const { mainMaster } = this.env.getNodesSortedByRole();
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${TektonApprovalInstaller.IMAGE_DIR}/`;
    await scp.sendFile(
      mainMaster,
      srcPath,
      `${TektonApprovalInstaller.IMAGE_HOME}/`
    );
    console.debug(
      '###### Finish sending the image file to main master node... ######'
    );
  }

  protected async _registryWork(param: { callback: any }) {
    console.debug(
      '@@@@@@ Start pushing the image at main master node... @@@@@@'
    );
    const { callback } = param;
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getImagePushScript();
    mainMaster.cmd += this._getImagePathEditScript();
    await mainMaster.exeCmd(callback);
    console.debug(
      '###### Finish pushing the image at main master node... ######'
    );
  }

  protected _getImagePushScript(): string {
    let gitPullCommand = `
    mkdir -p ~/${TektonApprovalInstaller.IMAGE_HOME};
    export HOME=~/${TektonApprovalInstaller.IMAGE_HOME};
    export VERSION=v${TektonApprovalInstaller.VERSION};
    export REGISTRY=${this.env.registry};
    cd $HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      docker load < approval-watcher-0.0.3.tar;
      docker load < approval-step-server-0.0.3.tar;
      `;
    } else {
      gitPullCommand += `
      docker pull tmaxcloudck/approval-watcher:0.0.3;
      docker pull tmaxcloudck/approval-step-server:0.0.3;

      docker tag tmaxcloudck/approval-watcher:0.0.3 approval-watcher:0.0.3;
      docker tag tmaxcloudck/approval-step-server:0.0.3 approval-step-server:0.0.3;

      #docker save approval-watcher:0.0.3 > approval-watcher-0.0.3.tar;
      #docker save approval-step-server:0.0.3 > approval-step-server-0.0.3.tar;
      `;
    }
    return `
      ${gitPullCommand}
      docker tag approval-watcher:0.0.3 $REGISTRY/approval-watcher:0.0.3;
      docker tag approval-step-server:0.0.3 $REGISTRY/approval-step-server:0.0.3;

      docker push $REGISTRY/approval-watcher:0.0.3;
      docker push $REGISTRY/approval-step-server:0.0.3;
      #rm -rf $HOME;
      `;
  }

  private _getImagePathEditScript(): string {
    // git guide에 내용 보기 쉽게 변경해놓음 (공백 유지해야함)
    return `
    cd ~/${TektonApprovalInstaller.INSTALL_HOME};
    export REGISTRY=${this.env.registry};
    cp proxy-server.yaml updated.yaml;
    sed -i "s/tmaxcloudck\\/approval-watcher:latest/$REGISTRY\\/approval-watcher:0.0.3/g" updated.yaml
    `;
  }
}
