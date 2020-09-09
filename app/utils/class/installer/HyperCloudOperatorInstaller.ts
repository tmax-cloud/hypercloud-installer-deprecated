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
import ScriptHyperCloudOperatorFactory from '../script/ScriptHyperCloudOperatorFactory';

export default class HyperCloudOperatorInstaller extends AbstractInstaller {
  public static readonly INSTALL_HOME = `hypercloud-operator-install`;

  public static readonly IMAGE_DIR = `hypercloud-operator-install`;

  public static readonly HPCD_VERSION=`4.1.1.0`;

  // singleton
  private static instance: HyperCloudOperatorInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!HyperCloudOperatorInstaller.instance) {
      HyperCloudOperatorInstaller.instance = new HyperCloudOperatorInstaller();
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
    setProgress(100);
  }

  public async remove() {
    await this._removeMainMaster();
  }

  private async _installMainMaster(callback: any) {
    console.error('###### Start installing main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const script = ScriptHyperCloudOperatorFactory.createScript(mainMaster.os.type)
    mainMaster.cmd = script.cloneGitFile(CONST.GIT_REPO, CONST.GIT_BRANCH);
    mainMaster.cmd += this._getInstallScript();
    await mainMaster.exeCmd(callback);
    console.error('###### Finish installing main Master... ######');
  }

  private async _removeMainMaster() {
    console.error('###### Start remove rook-ceph... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const script = ScriptHyperCloudOperatorFactory.createScript(mainMaster.os.type)
    mainMaster.cmd = script.cloneGitFile(CONST.GIT_REPO, CONST.GIT_BRANCH);
    mainMaster.cmd += this._getRemoveScript();
    await mainMaster.exeCmd();
    console.error('###### Finish remove rook-ceph... ######');
  }

  private _getInstallScript(): string {
    let setRegistry = '';
    if (this.env.registry) {
      setRegistry = `
      sed -i 's/mysql:5.6/'${this.env.registry}'\\/mysql:5.6/g' ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/3.mysql-create.yaml;
      sed -i 's/tmaxcloudck\\/hypercloud-operator/'${this.env.registry}'\\/tmaxcloudck\\/hypercloud-operator/g' ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/4.hypercloud4-operator.yaml;

      sed -i 's/{HPCD_VERSION}/'${HyperCloudOperatorInstaller.HPCD_VERSION}'/g' ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/4.hypercloud4-operator.yaml;
      `;
    }
    return `
      cd ~/${HyperCloudOperatorInstaller.INSTALL_HOME};
      tar -xvzf hypercloud-operator.tar.gz;
      ${setRegistry}
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/1.initialization.yaml;

      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/UserCRD.yaml;
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/UsergroupCRD.yaml;
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/TokenCRD.yaml;
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/ClientCRD.yaml;
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/UserSecurityPolicyCRD.yaml;
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Claim/NamespaceClaimCRD.yaml;
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Claim/ResourceQuotaClaimCRD.yaml;
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Claim/RoleBindingClaimCRD.yaml;
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Registry/RegistryCRD.yaml;
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Registry/ImageCRD.yaml;
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Template/TemplateCRD_v1beta1.yaml;
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Template/TemplateInstanceCRD_v1beta1.yaml;
      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Template/CatalogServiceClaimCRD_v1beta1.yaml;

      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/2.mysql-settings.yaml;

      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/3.mysql-create.yaml;

      kubectl apply -f ${HyperCloudOperatorInstaller.INSTALL_HOME}/hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/4.hypercloud4-operator.yaml;
      `;
  }

  private _getRemoveScript(): string {
    return `
    `;
  }

  // protected abstract 구현
  protected async _preWorkInstall(param?: any) {
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
    const srcPath = `${rootPath}/${HyperCloudOperatorInstaller.IMAGE_DIR}/`;
    await scp.sendFile(mainMaster, srcPath, `${HyperCloudOperatorInstaller.IMAGE_DIR}/`);
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
    mkdir -p ~/${HyperCloudOperatorInstaller.IMAGE_DIR};
    export HPCD_HOME=~/${HyperCloudOperatorInstaller.IMAGE_DIR};
    export HPCD_VERSION=v${HyperCloudOperatorInstaller.HPCD_VERSION};
    export REGISTRY=${this.env.registry};
    cd $HPCD_HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      sudo docker load < mysql_5.6.tar;
      sudo docker load < registry_2.6.2.tar;
      sudo docker load < hypercloud-operator_b\${HPCD_VERSION}.tar;
      `;
    } else {
      gitPullCommand += `
      sudo docker pull mysql:5.6;
      sudo docker pull registry:2.6.2;
      sudo docker pull tmaxcloudck/hypercloud-operator:b\${HPCD_VERSION};
      wget -O hypercloud-operator.tar.gz https://github.com/tmax-cloud/hypercloud-operator/archive/v\${HPCD_VERSION}.tar.gz;
      `;
    }
    return `
      ${gitPullCommand}
      sudo docker tag mysql:5.6 \${REGISTRY}/mysql:5.6
      sudo docker tag registry:2.6.2 \${REGISTRY}/registry:2.6.2
      sudo docker tag tmaxcloudck/hypercloud-operator:b\${HPCD_VERSION} \${REGISTRY}/tmaxcloudck/hypercloud-operator:b\${HPCD_VERSION}

      sudo docker push \${REGISTRY}/mysql:5.6
      sudo docker push \${REGISTRY}/registry:2.6.2
      sudo docker push \${REGISTRY}/tmaxcloudck/hypercloud-operator:b\${HPCD_VERSION}
      #rm -rf $CNI_HOME;
      `;
  }

}
