/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import * as scp from '../../common/scp';
import AbstractInstaller from './AbstractInstaller';
import Env, { NETWORK_TYPE } from '../Env';

export default class CatalogControllerInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR = `catalog-controller-install`;

  public static readonly INSTALL_HOME = `${Env.INSTALL_ROOT}/hypercloud-install-guide/CatalogController`;

  public static readonly IMAGE_HOME = `${Env.INSTALL_ROOT}/${CatalogControllerInstaller.IMAGE_DIR}`;

  public static readonly VERSION = `0.3.0`;

  // singleton
  private static instance: CatalogControllerInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!CatalogControllerInstaller.instance) {
      CatalogControllerInstaller.instance = new CatalogControllerInstaller();
    }
    return this.instance;
  }

  public async install(param: { callback: any; setProgress: Function }) {
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
    console.debug(
      '@@@@@@ Start installing catalog controller main Master... @@@@@@'
    );
    const { mainMaster } = this.env.getNodesSortedByRole();

    // Step 1. 설치에 필요한 crd 생성
    mainMaster.cmd = this._step1();
    await mainMaster.exeCmd(callback);

    // Step 2. catalog controller namespace 및 servcice account 생성
    mainMaster.cmd = this._step2();
    await mainMaster.exeCmd(callback);

    // Step 3. catalog manager 생성
    mainMaster.cmd = this._step3();
    await mainMaster.exeCmd(callback);

    // Step 4. webhook 인증 키 생성
    mainMaster.cmd = this._step4();
    await mainMaster.exeCmd(callback);

    // Step 5. catalog-webhook 생성
    mainMaster.cmd = this._step5();
    await mainMaster.exeCmd(callback);

    console.debug(
      '###### Finish installing catalog controller main Master... ######'
    );
  }

  private _step1() {
    return `
    cd ~/${CatalogControllerInstaller.INSTALL_HOME}/yamlCopy;
    kubectl apply -f crds/
    `;
  }

  private _step2() {
    return `
    cd ~/${CatalogControllerInstaller.INSTALL_HOME}/yamlCopy;
    kubectl create namespace catalog;
    kubectl apply -f serviceaccounts.yaml;
    kubectl apply -f rbac.yaml;
    `;
  }

  private _step3() {
    let script = ``;
    if (this.env.registry) {
      script += `
      sed -i 's| quay.io| '${this.env.registry}'/quay.io|g' *.yaml;
      `;
    }

    return `
    cd ~/${CatalogControllerInstaller.INSTALL_HOME}/yamlCopy;
    ${script}
    kubectl apply -f controller-manager-deployment.yaml;
    kubectl apply -f controller-manager-service.yaml;
    `;
  }

  private _step4() {
    return `
    cd ~/${CatalogControllerInstaller.INSTALL_HOME}/ca;
    openssl genrsa -out rootca.key 2048;
    openssl req -x509 -new -nodes -key rootca.key -sha256 -days 3650 -subj /C=KO/ST=None/L=None/O=None/CN=catalog-catalog-webhook -out rootca.crt;
    openssl req -new -newkey rsa:2048 -sha256 -nodes -keyout server.key -subj /C=KO/ST=None/L=None/O=None/CN=catalog-catalog-webhook -out server.csr;
    openssl x509 -req -in server.csr -CA rootca.crt -CAkey rootca.key -CAcreateserial -out server.crt -days 3650 -sha256 -extfile ./v3.ext;
    openssl base64 -in rootca.crt -out key0;
    openssl base64 -in server.crt -out cert;
    openssl base64 -in server.key -out key;
    `;
  }

  private _step5() {
    return `
    cd ~/${CatalogControllerInstaller.INSTALL_HOME}/ca;
    export key0=\`cat key0 | tr -d '\\n'\`;
    export cert=\`cat cert | tr -d '\\n'\`;
    export key=\`cat key | tr -d '\\n'\`;
    cd ~/${CatalogControllerInstaller.INSTALL_HOME}/yamlCopy;
    sed -i "s/{{ b64enc \\$ca.Cert }}/$key0/g" webhook-register.yaml;
    sed -i "s/{{ b64enc \\$cert.Cert }}/$cert/g" webhook-register.yaml;
    sed -i "s/{{ b64enc \\$cert.Key }}/$key/g" webhook-register.yaml;
    kubectl apply -f webhook-register.yaml;
    kubectl apply -f webhook-deployment.yaml;
    kubectl apply -f webhook-service.yaml;
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
    // 설치의 역순
    return `
    cd ~/${CatalogControllerInstaller.INSTALL_HOME}/yamlCopy;
    kubectl delete -f webhook-service.yaml;
    kubectl delete -f webhook-deployment.yaml;
    kubectl delete -f webhook-register.yaml;

    kubectl delete -f controller-manager-service.yaml;
    kubectl delete -f controller-manager-deployment.yaml;

    kubectl delete -f rbac.yaml;
    kubectl delete -f serviceaccounts.yaml;
    kubectl delete namespace catalog;

    kubectl delete -f crds/
    `;
  }

  // private async _downloadYaml() {
  //   console.debug('@@@@@@ Start download yaml file from external... @@@@@@');
  //   const { mainMaster } = this.env.getNodesSortedByRole();
  //   mainMaster.cmd = `
  //   mkdir -p ~/${CatalogControllerInstaller.INSTALL_HOME};
  //   cd ~/${CatalogControllerInstaller.INSTALL_HOME};
  //   curl https://raw.githubusercontent.com/tmax-cloud/hypercloud-console4.1/hc-dev/install-yaml/1.initialization.yaml > 1.initialization.yaml;
  //   curl https://raw.githubusercontent.com/tmax-cloud/hypercloud-console4.1/hc-dev/install-yaml/2.svc-lb.yaml > 2.svc-lb.yaml;
  //   curl https://raw.githubusercontent.com/tmax-cloud/hypercloud-console4.1/hc-dev/install-yaml/3.deployment-pod.yaml > 3.deployment-pod.yaml;
  //   `;
  //   await mainMaster.exeCmd();
  //   console.debug('###### Finish download yaml file from external... ######');
  // }

  private async _copyFile(callback: any) {
    console.debug('@@@@@@ Start copy yaml file... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = `
    \\cp -r ~/${CatalogControllerInstaller.INSTALL_HOME}/yaml_install ~/${CatalogControllerInstaller.INSTALL_HOME}/yamlCopy;
    `;
    await mainMaster.exeCmd(callback);
    console.debug('###### Finish copy yaml file... ######');
  }

  // protected abstract 구현
  protected async _preWorkInstall(param?: any) {
    console.debug('@@@@@@ Start pre-installation... @@@@@@');
    const { callback } = param;
    await this._copyFile(callback);
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      // internal network 경우 해주어야 할 작업들
      await this._downloadImageFile();
      await this._sendImageFile();
      // TODO: downloadYamlAtLocal();
      // TODO: sendYaml();
    } else if (this.env.networkType === NETWORK_TYPE.EXTERNAL) {
      // external network 경우 해주어야 할 작업들
      // await this._downloadYaml();
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
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${CatalogControllerInstaller.IMAGE_DIR}/`;
    await scp.sendFile(
      mainMaster,
      srcPath,
      `${CatalogControllerInstaller.IMAGE_HOME}/`
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
    mkdir -p ~/${CatalogControllerInstaller.IMAGE_HOME};
    export CATALOG_HOME=~/${CatalogControllerInstaller.IMAGE_HOME};
    export CATALOG_VERSION=v${CatalogControllerInstaller.VERSION};
    export REGISTRY=${this.env.registry};
    cd $CATALOG_HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      docker load < service-catalog_v\${CATALOG_VERSION}.tar
      `;
    } else {
      gitPullCommand += `
      docker pull quay.io/kubernetes-service-catalog/service-catalog:v\${CATALOG_VERSION}

      #docker save quay.io/kubernetes-service-catalog/service-catalog:v\${CATALOG_VERSION} > service-catalog_v\${CATALOG_VERSION}.tar
      `;
    }
    return `
      ${gitPullCommand}
      docker tag quay.io/kubernetes-service-catalog/service-catalog:v\${CATALOG_VERSION} \${REGISTRY}/quay.io/kubernetes-service-catalog/service-catalog:v\${CATALOG_VERSION}

      docker push \${REGISTRY}/quay.io/kubernetes-service-catalog/service-catalog:v\${CATALOG_VERSION}
      #rm -rf $CATALOG_HOME;
      `;
  }
}
