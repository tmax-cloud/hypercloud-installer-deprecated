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
import { NETWORK_TYPE } from '../Env';
import Node from '../Node';
import ScriptMatalLbFactory from '../script/ScriptMatalLbFactory';

export default class MetalLbInstaller extends AbstractInstaller {
  public static readonly INSTALL_HOME = `hypercloud-install-guide/MetalLB`;

  public static readonly IMAGE_DIR = `metallb-install`;

  public static readonly METALLB_VERSION=`0.8.2`;

  // singleton
  private static instance: MetalLbInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!MetalLbInstaller.instance) {
      MetalLbInstaller.instance = new MetalLbInstaller();
    }
    return this.instance;
  }

  public async install(param: { data: Array<string>; callback: any; setProgress: Function; }) {
    const { data, callback, setProgress } = param;

    setProgress(10);
    await this._preWorkInstall({
      callback
    });
    setProgress(60);
    await this._installMainMaster(data, callback);
    setProgress(100);
  }

  public async remove() {
    await this._removeMainMaster();
  }

  private async _installMainMaster(data: Array<string>, callback: any) {
    console.error('###### Start installing main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getInstallScript(data);
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

  private _getInstallScript(data: Array<string>): string {
    return `
      cd ~/${MetalLbInstaller.INSTALL_HOME};
      sed -i 's/v0.8.2/'v${MetalLbInstaller.METALLB_VERSION}'/g' metallb_v${MetalLbInstaller.METALLB_VERSION}.yaml;
      ${this._setMetalLbArea(data)}
      kubectl apply -f metallb_v${MetalLbInstaller.METALLB_VERSION}.yaml;
      kubectl apply -f metallb_cidr.yaml;
      `;
  }

  private _getRemoveScript(): string {
    return `
    cd ~/${MetalLbInstaller.INSTALL_HOME};
    kubectl delete -f metallb_v${MetalLbInstaller.METALLB_VERSION}.yaml;
    kubectl delete -f metallb_cidr.yaml;
    `;
  }

  private _setMetalLbArea(data: Array<string>): string {
    let ipRangeText = '';
    for (let i = 0; i < data.length; i += 1) {
      ipRangeText = ipRangeText.concat(`          - ${data[i]}\\n`);
    }
    console.error('ipRangeText', ipRangeText);
    return `
    # interfaceName=\`ls /sys/class/net | grep ens\`;
    # inet=\`ip -f inet addr show \${interfaceName} | awk '/inet /{ print $2}'\`;
    # network=\`ipcalc -n \${inet} | cut -d"=" -f2\`;
    # prefix=\`ipcalc -p \${inet} | cut -d"=" -f2\`;
    # networkArea=\${network}/\${prefix};
    sed -i 's|          - 172.22.8.160-172.22.8.180|${ipRangeText}|g' metallb_cidr.yaml;
    sed -i 's|\\r$||g' metallb_cidr.yaml;
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
    // TODO: download kubernetes image file
    console.error('###### Start downloading the image file to client local... ######');
    console.error('###### Finish downloading the image file to client local... ######');
  }

  protected async _sendImageFile() {
    console.error('###### Start sending the image file to main master node... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const srcPath = `${rootPath}/${MetalLbInstaller.IMAGE_DIR}/`;
    await scp.sendFile(mainMaster, srcPath, `${MetalLbInstaller.IMAGE_DIR}/`);
    console.error('###### Finish sending the image file to main master node... ######');
  }

  protected async _registryWork(param: { callback: any; }) {
    console.error('###### Start pushing the image at main master node... ######');
    const { callback } = param;
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getImagePushScript();
    mainMaster.cmd += this._getImagePathEditScript();
    await mainMaster.exeCmd(callback);
    console.error('###### Finish pushing the image at main master node... ######');
  }

  protected _getImagePushScript(): string {
    let gitPullCommand = `
    mkdir -p ~/${MetalLbInstaller.IMAGE_DIR};
    export METALLB_HOME=~/${MetalLbInstaller.IMAGE_DIR};
    export METALLB_VERSION=v${MetalLbInstaller.METALLB_VERSION};
    export REGISTRY=${this.env.registry};
    cd $METALLB_HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      sudo docker load < metallb-controller_\${METALLB_VERSION}.tar
      sudo docker load < metallb-speaker_\${METALLB_VERSION}.tar
      `;
    } else {
      gitPullCommand += `
      sudo docker pull metallb/controller:\${METALLB_VERSION}
      sudo docker pull metallb/speaker:\${METALLB_VERSION}
      # curl https://raw.githubusercontent.com/tmax-cloud/hypercloud-install-guide/master/MetalLB/metallb_v${MetalLbInstaller.METALLB_VERSION}.yaml > metallb.yaml;
      # curl https://raw.githubusercontent.com/tmax-cloud/hypercloud-install-guide/master/MetalLB/metallb_cidr.yaml > metallb_cidr.yaml;
      `;
    }
    return `
      ${gitPullCommand}
      sudo docker tag metallb/controller:\${METALLB_VERSION} \${REGISTRY}/metallb/controller:\${METALLB_VERSION}
      sudo docker tag metallb/speaker:\${METALLB_VERSION} \${REGISTRY}/metallb/speaker:\${METALLB_VERSION}

      sudo docker push \${REGISTRY}/metallb/controller:\${METALLB_VERSION}
      sudo docker push \${REGISTRY}/metallb/speaker:\${METALLB_VERSION}
      #rm -rf $METALLB_HOME;
      `;
  }

  private _getImagePathEditScript(): string {
    // git guide에 내용 보기 쉽게 변경해놓음 (공백 유지해야함)
    return `
    cd ~/${MetalLbInstaller.INSTALL_HOME};
    sed -i 's| metallb/speaker| '${this.env.registry}'/metallb/speaker|g' metallb_v${MetalLbInstaller.METALLB_VERSION}.yaml;
    sed -i 's| metallb/controller| '${this.env.registry}'/metallb/controller|g' metallb_v${MetalLbInstaller.METALLB_VERSION}.yaml;
    `;
  }
}
