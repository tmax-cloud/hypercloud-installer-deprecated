/* eslint-disable array-callback-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-underscore-dangle */
import { rootPath } from 'electron-root-path';
import YAML from 'yaml';
import * as scp from '../../common/scp';
import AbstractInstaller from './AbstractInstaller';
import CONST from '../../constants/constant';
import Env, { NETWORK_TYPE } from '../Env';
import ScriptPrometheusFactory from '../script/ScriptPrometheusFactory';

export default class ConsoleInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR=`console-install`;

  public static readonly INSTALL_HOME=`${Env.INSTALL_ROOT}/hypercloud-install-guide/Console`;

  public static readonly IMAGE_HOME=`${Env.INSTALL_ROOT}/${ConsoleInstaller.IMAGE_DIR}`;

  public static readonly CONSOLE_VERSION=`1.1.34.7`;

  // singleton
  private static instance: ConsoleInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!ConsoleInstaller.instance) {
      ConsoleInstaller.instance = new ConsoleInstaller();
    }
    return this.instance;
  }

  public async install(param: { callback: any; setProgress: Function; }) {
    const { callback, setProgress } = param;

    setProgress(10);
    await this._preWorkInstall({
      callback
    });
    setProgress(60);
    await this._installMainMaster(callback);
    // setProgress(100);
  }

  public async remove() {
    await this._removeMainMaster();
  }

  private async _installMainMaster(callback: any) {
    console.error('###### Start installing main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getInstallScript();
    await mainMaster.exeCmd(callback);

    console.error('###### Finish installing main Master... ######');
  }

  private async _removeMainMaster() {
    console.error('###### Start remove main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getRemoveScript();
    await mainMaster.exeCmd();
    console.error('###### Finish remove main Master... ######');
  }

  private _getInstallScript(): string {
    let setRegistry = '';
    // git guide에 내용 보기 쉽게 변경해놓음 (공백 유지해야함)
    if (this.env.registry) {
      setRegistry = `
      cd ~/${ConsoleInstaller.INSTALL_HOME};
      sed -i "s| tmaxcloudck/hypercloud-console| ${this.env.registry}/tmaxcloudck/hypercloud-console|g" alertmanager-alertmanager.yaml;
      `;
    }
    return `
      ${setRegistry}

      cd ~/${ConsoleInstaller.INSTALL_HOME};
      sed -i 's/@@NAME_NS@@/console-system/g' 1.initialization.yaml;
      kubectl create -f 1.initialization.yaml;

      # 인증서가 없는경우 ,있는 경우로 나뉨
      # 현재는 인증서가 없는 경우만 고려
      mkdir -p tls;
      cd tls;
      openssl genrsa -out tls.key 2048;
      openssl req -new -key tls.key -out tls.csr;
      openssl x509 -req -days 3650 -in tls.csr -signkey tls.key -out tls.crt;
      cd ~/${ConsoleInstaller.INSTALL_HOME};
      kubectl create secret tls console-https-secret --cert=./tls/tls.crt --key=./tls/tls.key -n console-system;
      sed -i 's/@@NAME_NS@@/console-system/g' 2.svc-lb.yaml;
      kubectl create -f 2.svc-lb.yaml;

      sed -i 's/@@NAME_NS@@/console-system/g' 3.deployment-pod.yaml;
      sed -i 's/@@HC4@@/console-system/g' 3.deployment-pod.yaml;
      sed -i 's/@@PROM@@/console-system/g' 3.deployment-pod.yaml;
      sed -i 's/@@GRAFANA@@/console-system/g' 3.deployment-pod.yaml;
      sed -i 's/@@KIALI@@/console-system/g' 3.deployment-pod.yaml;
      sed -i 's/@@JAEGER@@/console-system/g' 3.deployment-pod.yaml;
      sed -i 's/@@HDC_FLAG@@/console-system/g' 3.deployment-pod.yaml;
      sed -i 's/@@PORTAL@@/console-system/g' 3.deployment-pod.yaml;
      sed -i 's/@@VER@@/console-system/g' 3.deployment-pod.yaml;
      kubectl create -f 3.deployment-pod.yaml;
      `;
  }

  private _getRemoveScript(): string {
    return `
    `;
  }

  // protected abstract 구현
  protected async _preWorkInstall(param: { callback: any; }) {
    console.error('###### Start pre-installation... ######');
    const { callback } = param;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      // internal network 경우 해주어야 할 작업들
      await this._downloadImageFile();
      await this._sendImageFile();
    } else if (this.env.networkType === NETWORK_TYPE.EXTERNAL) {
      // external network 경우 해주어야 할 작업들
    }

    if (this.env.registry) {
      // 내부 image registry 구축 경우 해주어야 할 작업들
      await this._registryWork({
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
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${ConsoleInstaller.IMAGE_DIR}/`;
    await scp.sendFile(mainMaster, srcPath, `${ConsoleInstaller.IMAGE_HOME}/`);
    console.error('###### Finish sending the image file to main master node... ######');
  }

  protected async _registryWork(param: { callback: any; }) {
    console.error('###### Start pushing the image at main master node... ######');
    const { callback } = param;
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getImagePushScript();
    await mainMaster.exeCmd(callback);
    console.error('###### Finish pushing the image at main master node... ######');
  }

  protected _getImagePushScript(): string {
    let gitPullCommand = `
    mkdir -p ~/${ConsoleInstaller.IMAGE_HOME};
    export CONSOLE_HOME=~/${ConsoleInstaller.IMAGE_HOME};
    export CONSOLE_VERSION=v${ConsoleInstaller.CONSOLE_VERSION};
    export REGISTRY=${this.env.registry};
    cd $CONSOLE_HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      sudo docker load < console_\${CONSOLE_VERSION}.tar
      `;
    } else {
      gitPullCommand += `
      sudo docker pull  tmaxcloudck/hypercloud-console:\${CONSOLE_VERSION}
      `;
    }
    return `
      ${gitPullCommand}
      sudo docker tag tmaxcloudck/hypercloud-console:\${CONSOLE_VERSION} \${REGISTRY}/tmaxcloudck/hypercloud-console:\${CONSOLE_VERSION}

      sudo docker push \${REGISTRY}/tmaxcloudck/hypercloud-console:\${CONSOLE_VERSION}
      #rm -rf $CONSOLE_HOME;
      `;
  }
}
