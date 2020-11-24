/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import * as scp from '../../common/scp';
import AbstractInstaller from './AbstractInstaller';
import Env, { NETWORK_TYPE } from '../Env';

export default class TektonTriggerInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR = `tekton-trigger-install`;

  public static readonly INSTALL_HOME = `${Env.INSTALL_ROOT}/${TektonTriggerInstaller.IMAGE_DIR}`;

  public static readonly IMAGE_HOME = `${Env.INSTALL_ROOT}/${TektonTriggerInstaller.IMAGE_DIR}`;

  // TODO: version 처리 안됨
  public static readonly VERSION = `0.4.0`;

  // singleton
  private static instance: TektonTriggerInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!TektonTriggerInstaller.instance) {
      TektonTriggerInstaller.instance = new TektonTriggerInstaller();
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
    console.debug('@@@@@@ Start installing trigger main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();

    // Step 1. Trigger 설치
    mainMaster.cmd = this._step1();
    await mainMaster.exeCmd(callback);

    console.debug('###### Finish installing trigger main Master... ######');
  }

  private _step1() {
    if (this.env.registry) {
      return `
      cd ~/${TektonTriggerInstaller.INSTALL_HOME};
      kubectl apply -f updated.yaml;
      `;
    }
    return `
    cd ~/${TektonTriggerInstaller.INSTALL_HOME};
    kubectl apply -f https://storage.googleapis.com/tekton-releases/triggers/previous/v0.4.0/release.yaml;
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
    if (this.env.registry) {
      return `
      cd ~/${TektonTriggerInstaller.INSTALL_HOME};
      kubectl delete -f updated.yaml;
      `;
    }
    return `
    cd ~/${TektonTriggerInstaller.INSTALL_HOME};
    kubectl delete -f https://storage.googleapis.com/tekton-releases/triggers/previous/v0.4.0/release.yaml;
    `;
  }

  private async _downloadYaml() {
    console.debug('@@@@@@ Start download yaml file from external... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = `
    mkdir -p ~/${TektonTriggerInstaller.INSTALL_HOME};
    cd ~/${TektonTriggerInstaller.INSTALL_HOME};
    wget https://storage.googleapis.com/tekton-releases/triggers/previous/v0.4.0/release.yaml -O tekton-triggers-v0.4.0.yaml;
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
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${TektonTriggerInstaller.IMAGE_DIR}/`;
    await scp.sendFile(
      mainMaster,
      srcPath,
      `${TektonTriggerInstaller.IMAGE_HOME}/`
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
    mkdir -p ~/${TektonTriggerInstaller.IMAGE_HOME};
    export HOME=~/${TektonTriggerInstaller.IMAGE_HOME};
    export VERSION=v${TektonTriggerInstaller.VERSION};
    export REGISTRY=${this.env.registry};
    cd $HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      docker load < tekton-triggers-controller-v0.4.0.tar;
      docker load < tekton-triggers-eventlistenersink-v0.4.0.tar;
      docker load < tekton-triggers-webhook-v0.4.0.tar;
      `;
    } else {
      gitPullCommand += `
      docker pull gcr.io/tekton-releases/github.com/tektoncd/triggers/cmd/controller@sha256:bf3517ddccace756e39cee0f0012bbe879c6b28d962a1c904a415e7c60ce5bc2;
      docker pull gcr.io/tekton-releases/github.com/tektoncd/triggers/cmd/eventlistenersink@sha256:76c208ec1d73d9733dcaf850240e1b3990e5977709a03c2bd98ad5b20fab9867;
      docker pull gcr.io/tekton-releases/github.com/tektoncd/triggers/cmd/webhook@sha256:d7f1526a9294e671c500f0071b61e050262fb27fb633b54d764a556969855764;

      docker tag gcr.io/tekton-releases/github.com/tektoncd/triggers/cmd/controller@sha256:bf3517ddccace756e39cee0f0012bbe879c6b28d962a1c904a415e7c60ce5bc2 triggers-controller:v0.4.0
      docker tag gcr.io/tekton-releases/github.com/tektoncd/triggers/cmd/eventlistenersink@sha256:76c208ec1d73d9733dcaf850240e1b3990e5977709a03c2bd98ad5b20fab9867 triggers-eventlistenersink:v0.4.0
      docker tag gcr.io/tekton-releases/github.com/tektoncd/triggers/cmd/webhook@sha256:d7f1526a9294e671c500f0071b61e050262fb27fb633b54d764a556969855764 triggers-webhook:v0.4.0

      #docker save triggers-controller:v0.4.0 > tekton-triggers-controller-v0.4.0.tar
      #docker save triggers-eventlistenersink:v0.4.0 > tekton-triggers-eventlistenersink-v0.4.0.tar
      #docker save triggers-webhook:v0.4.0 > tekton-triggers-webhook-v0.4.0.tar
      `;
    }
    return `
      ${gitPullCommand}
      docker tag triggers-controller:v0.4.0 $REGISTRY/triggers-controller:v0.4.0;
      docker tag triggers-eventlistenersink:v0.4.0 $REGISTRY/triggers-eventlistenersink:v0.4.0;
      docker tag triggers-webhook:v0.4.0 $REGISTRY/triggers-webhook:v0.4.0;

      docker push $REGISTRY/triggers-controller:v0.4.0;
      docker push $REGISTRY/triggers-eventlistenersink:v0.4.0;
      docker push $REGISTRY/triggers-webhook:v0.4.0;
      #rm -rf $HOME;
      `;
  }

  private _getImagePathEditScript(): string {
    // git guide에 내용 보기 쉽게 변경해놓음 (공백 유지해야함)
    return `
    cd ~/${TektonTriggerInstaller.INSTALL_HOME};
    export REGISTRY=${this.env.registry};
    cp tekton-triggers-v0.4.0.yaml updated.yaml;
    sed -i -E "s/gcr.io\\/tekton-releases\\/.*\\/([^@]*)@[^\\n\\"]*/$REGISTRY\\/triggers-\\1:v0.4.0/g" updated.yaml;
    `;
  }
}
