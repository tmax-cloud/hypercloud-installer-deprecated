/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import * as scp from '../../common/scp';
import AbstractInstaller from './AbstractInstaller';
import Env, { NETWORK_TYPE } from '../Env';

export default class SecretWatcherInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR = `secret-watcher-install`;

  public static readonly INSTALL_HOME = `${Env.INSTALL_ROOT}/${SecretWatcherInstaller.IMAGE_DIR}`;

  public static readonly IMAGE_HOME = `${Env.INSTALL_ROOT}/${SecretWatcherInstaller.IMAGE_DIR}`;

  public static readonly HPCD_SW_VERSION = `4.1.0.9`;

  // singleton
  private static instance: SecretWatcherInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!SecretWatcherInstaller.instance) {
      SecretWatcherInstaller.instance = new SecretWatcherInstaller();
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
    console.debug(
      '@@@@@@ Start installing secret watcher main Master... @@@@@@'
    );
    const { mainMaster } = this.env.getNodesSortedByRole();

    // Step 0. hypercloud-secret-watcher-daemonset.yaml 수정
    mainMaster.cmd = this._step0();
    await mainMaster.exeCmd(callback);

    // Step 1. hypercloud-secret-watcher-daemonset.yaml 실행
    mainMaster.cmd = this._step1();
    await mainMaster.exeCmd(callback);

    console.debug(
      '###### Finish installing secret watcher main Master... ######'
    );
  }

  private _step0() {
    let script = `
    cd ~/${SecretWatcherInstaller.INSTALL_HOME};
    tar -xzf secret-watcher.tar.gz

    sed -i 's/tmaxcloudck\\/hypercloud4-secret-watcher:latest/tmaxcloudck\\/hypercloud4-secret-watcher:'b${SecretWatcherInstaller.HPCD_SW_VERSION}'/g' secret-watcher-${SecretWatcherInstaller.HPCD_SW_VERSION}/k8s-install/hypercloud-secret-watcher-daemonset.yaml
    `;

    if (this.env.registry) {
      script += `
      sed -i 's/ tmaxcloudck/ '${this.env.registry}'\\/tmaxcloudck/g' secret-watcher-${SecretWatcherInstaller.HPCD_SW_VERSION}/k8s-install/hypercloud-secret-watcher-daemonset.yaml
      `;
    }
    return script;
  }

  private _step1() {
    return `
    cd ~/${SecretWatcherInstaller.INSTALL_HOME};
    kubectl apply -f secret-watcher-${SecretWatcherInstaller.HPCD_SW_VERSION}/k8s-install/hypercloud-secret-watcher-daemonset.yaml
    `;
  }

  private async _removeMainMaster() {
    console.debug('@@@@@@ Start remove secret watcher main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getRemoveScript();
    await mainMaster.exeCmd();
    console.debug('###### Finish remove secret watcher main Master... ######');
  }

  private _getRemoveScript(): string {
    return `
    cd ~/${SecretWatcherInstaller.INSTALL_HOME};
    kubectl delete -f secret-watcher-${SecretWatcherInstaller.HPCD_SW_VERSION}/k8s-install/hypercloud-secret-watcher-daemonset.yaml

    #rm -rf ~/${SecretWatcherInstaller.INSTALL_HOME};
    `;
  }

  private async _downloadYaml() {
    console.debug('@@@@@@ Start download yaml file from external... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = `
    mkdir -p ~/${SecretWatcherInstaller.INSTALL_HOME};
    cd ~/${SecretWatcherInstaller.INSTALL_HOME};
    wget -O secret-watcher.tar.gz https://github.com/tmax-cloud/secret-watcher/archive/v${SecretWatcherInstaller.HPCD_SW_VERSION}.tar.gz;
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
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${SecretWatcherInstaller.IMAGE_DIR}/`;
    await scp.sendFile(
      mainMaster,
      srcPath,
      `${SecretWatcherInstaller.IMAGE_HOME}/`
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
    await mainMaster.exeCmd(callback);
    console.debug(
      '###### Finish pushing the image at main master node... ######'
    );
  }

  protected _getImagePushScript(): string {
    let gitPullCommand = `
    mkdir -p ~/${SecretWatcherInstaller.IMAGE_HOME};
    export HPCD_SW_HOME=~/${SecretWatcherInstaller.IMAGE_HOME};
    export HPCD_SW_VERSION=v${SecretWatcherInstaller.HPCD_SW_VERSION};
    export REGISTRY=${this.env.registry};
    cd $HPCD_SW_HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      sudo docker load < hypercloud4-secret-watcher_b\${HPCD_SW_VERSION}.tar;

      `;
    } else {
      gitPullCommand += `
      sudo docker pull tmaxcloudck/hypercloud4-secret-watcher:b\${HPCD_SW_VERSION};
      `;
    }
    return `
      ${gitPullCommand}
      sudo docker tag tmaxcloudck/hypercloud4-secret-watcher:b\${HPCD_SW_VERSION} \${REGISTRY}/tmaxcloudck/hypercloud4-secret-watcher:b\${HPCD_SW_VERSION};

      sudo docker push \${REGISTRY}/tmaxcloudck/hypercloud4-secret-watcher:b\${HPCD_SW_VERSION};
      #rm -rf $HPCD_SW_HOME;
      `;
  }
}
