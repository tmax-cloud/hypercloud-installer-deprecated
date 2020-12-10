/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import * as scp from '../../common/scp';
import AbstractInstaller from './AbstractInstaller';
import Env, { NETWORK_TYPE } from '../Env';
import SecretWatcherInstaller from './SecretWatcherInstaller';
import IngressControllerSharedInstaller from './IngressControllerSharedInstaller';
import IngressControllerSystemInstaller from './IngressControllerSystemInstaller';

export default class HyperCloudOperatorInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR = `hypercloud-operator-install`;

  public static readonly INSTALL_HOME = `${Env.INSTALL_ROOT}/${HyperCloudOperatorInstaller.IMAGE_DIR}`;

  public static readonly IMAGE_HOME = `${Env.INSTALL_ROOT}/${HyperCloudOperatorInstaller.IMAGE_DIR}`;

  public static readonly HPCD_VERSION = `4.1.4.7`;

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

  public async install(param: {
    state: any;
    callback: any;
    setProgress: Function;
  }) {
    const { state, callback, setProgress } = param;

    await this._preWorkInstall({
      callback
    });

    if (state.isUseIngress) {
      if (state.sharedIngress) {
        const ingressControllerSharedInstaller =
          IngressControllerSharedInstaller.getInstance;
        ingressControllerSharedInstaller.env = this.env;
        await ingressControllerSharedInstaller.install({
          callback,
          setProgress
        });
      }
      if (state.systemIngress) {
        const ingressControllerSystemInstaller =
          IngressControllerSystemInstaller.getInstance;
        ingressControllerSystemInstaller.env = this.env;
        await ingressControllerSystemInstaller.install({
          callback,
          setProgress
        });
      }
    }

    // operator 설치
    await this._installMainMaster(state, callback);

    // secret watcher 설치
    const secretWatcherInstaller = SecretWatcherInstaller.getInstance;
    secretWatcherInstaller.env = this.env;
    await secretWatcherInstaller.install({
      callback,
      setProgress
    });
  }

  public async remove() {
    // secret watcher 삭제
    const secretWatcherInstaller = SecretWatcherInstaller.getInstance;
    secretWatcherInstaller.env = this.env;
    await secretWatcherInstaller.remove();

    // operator 삭제
    await this._removeMainMaster();

    // ingress controller 삭제
    // FIXME: 현재 shared, system 둘 다 삭제함
    const ingressControllerSystemInstaller =
      IngressControllerSystemInstaller.getInstance;
    ingressControllerSystemInstaller.env = this.env;
    await ingressControllerSystemInstaller.remove();
    const ingressControllerSharedInstaller =
      IngressControllerSharedInstaller.getInstance;
    ingressControllerSharedInstaller.env = this.env;
    await ingressControllerSharedInstaller.remove();
  }

  private async _installMainMaster(state: any, callback: any) {
    console.debug(
      '@@@@@@ Start installing hypercloud operator main Master... @@@@@@'
    );
    const { mainMaster } = this.env.getNodesSortedByRole();

    // Step 0. install yaml 수정
    mainMaster.cmd = this._step0();
    await mainMaster.exeCmd(callback);

    // Step 1. 1.initialization.yaml 실행
    mainMaster.cmd = this._step1();
    await mainMaster.exeCmd(callback);

    // Step 2. CRD 적용
    mainMaster.cmd = this._step2();
    await mainMaster.exeCmd(callback);

    // Step 3. 2.mysql-settings.yaml 실행
    mainMaster.cmd = this._step3();
    await mainMaster.exeCmd(callback);

    // Step 4. 3.mysql-create.yaml 실행
    mainMaster.cmd = this._step4();
    await mainMaster.exeCmd(callback);

    // Step 5. 4.hypercloud4-operator.yaml 실행
    mainMaster.cmd = this._step5();
    await mainMaster.exeCmd(callback);

    // Step 6. 6.default-auth-object-init.yaml 실행
    mainMaster.cmd = this._step6(state);
    await mainMaster.exeCmd(callback);

    console.debug(
      '###### Finish installing hypercloud operator main Master... ######'
    );
  }

  private _step0() {
    let script = `
    cd ~/${HyperCloudOperatorInstaller.INSTALL_HOME};
    tar -xzf hypercloud-operator.tar.gz;

    sed -i 's/{HPCD_VERSION}/'b${HyperCloudOperatorInstaller.HPCD_VERSION}'/g' hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/4.hypercloud4-operator.yaml;
    `;

    if (this.env.registry) {
      script += `
      sed -i 's/ mysql:5.6/ '${this.env.registry}'\\/mysql:5.6/g' hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/3.mysql-create.yaml;
      sed -i 's/ tmaxcloudck\\/hypercloud-operator/ '${this.env.registry}'\\/tmaxcloudck\\/hypercloud-operator/g' hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/4.hypercloud4-operator.yaml;

      `;
    }
    return script;
  }

  private _step1() {
    return `
    cd ~/${HyperCloudOperatorInstaller.INSTALL_HOME};
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/1.initialization.yaml;
    `;
  }

  private _step2() {
    return `
    cd ~/${HyperCloudOperatorInstaller.INSTALL_HOME};
    # kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/UserCRD.yaml;
    # kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/UsergroupCRD.yaml;
    # kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/TokenCRD.yaml;
    # kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/ClientCRD.yaml;
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/UserSecurityPolicyCRD.yaml;
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Claim/NamespaceClaimCRD.yaml;
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Claim/ResourceQuotaClaimCRD.yaml;
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Claim/RoleBindingClaimCRD.yaml;
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Registry/RegistryCRD.yaml;
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Registry/ImageCRD.yaml;
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Template/TemplateCRD_v1beta1.yaml;
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Template/TemplateInstanceCRD_v1beta1.yaml;
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Template/CatalogServiceClaimCRD_v1beta1.yaml;
    `;
  }

  private _step3() {
    return `
    cd ~/${HyperCloudOperatorInstaller.INSTALL_HOME};
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/2.mysql-settings.yaml;
    `;
  }

  private _step4() {
    let script = `cd ~/${HyperCloudOperatorInstaller.INSTALL_HOME};`;

    // 개발 환경에서는 테스트 시, POD의 메모리를 조정하여 테스트
    if (process.env.RESOURCE === 'low') {
      script += `
      sed -i 's/memory: "5Gi"/memory: "1Gi"/g' hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/3.mysql-create.yaml;
      sed -i 's/cpu: "1"/cpu: "0.5"/g' hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/3.mysql-create.yaml;
      `;
    }
    script += `
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/3.mysql-create.yaml;
    `;

    return script;
  }

  private _step5() {
    let script = `cd ~/${HyperCloudOperatorInstaller.INSTALL_HOME};`;

    // 개발 환경에서는 테스트 시, POD의 메모리를 조정하여 테스트
    if (process.env.RESOURCE === 'low') {
      script += `
      sed -i 's/memory: "1Gi"/memory: "500Mi"/g' hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/4.hypercloud4-operator.yaml;
      sed -i 's/cpu: "1"/cpu: "0.5"/g' hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/4.hypercloud4-operator.yaml;
      `;
    }
    script += `
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/4.hypercloud4-operator.yaml;
    `;

    return script;
  }

  private _step6(state: any) {
    // FIXME: targetEmail 값 변경 될 가능성 있음
    const targetEmail = 'admin-tmax.co.kr';
    const newEmail = state.email;

    return `
    cd ~/${HyperCloudOperatorInstaller.INSTALL_HOME};
    sed -i 's/${targetEmail}/${newEmail}/g' hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/6.default-auth-object-init.yaml;
    kubectl apply -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/6.default-auth-object-init.yaml;
    `;
  }

  private async _removeMainMaster() {
    console.debug(
      '@@@@@@ Start remove hypercloud operator main Master... @@@@@@'
    );
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getRemoveScript();
    await mainMaster.exeCmd();
    console.debug(
      '###### Finish remove hypercloud operator main Master... ######'
    );
  }

  private _getRemoveScript(): string {
    return `
    cd ~/${HyperCloudOperatorInstaller.INSTALL_HOME};
    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/6.default-auth-object-init.yaml;

    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/4.hypercloud4-operator.yaml;

    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/3.mysql-create.yaml;

    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/2.mysql-settings.yaml;

    # kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/UserCRD.yaml;
    # kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/UsergroupCRD.yaml;
    # kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/TokenCRD.yaml;
    # kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/ClientCRD.yaml;
    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Auth/UserSecurityPolicyCRD.yaml;
    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Claim/NamespaceClaimCRD.yaml;
    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Claim/ResourceQuotaClaimCRD.yaml;
    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Claim/RoleBindingClaimCRD.yaml;
    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Registry/RegistryCRD.yaml;
    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Registry/ImageCRD.yaml;
    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Template/TemplateCRD_v1beta1.yaml;
    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Template/TemplateInstanceCRD_v1beta1.yaml;
    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_CRD/${HyperCloudOperatorInstaller.HPCD_VERSION}/Template/CatalogServiceClaimCRD_v1beta1.yaml;

    kubectl delete -f hypercloud-operator-${HyperCloudOperatorInstaller.HPCD_VERSION}/_yaml_Install/1.initialization.yaml;

    #rm -rf ~/${HyperCloudOperatorInstaller.INSTALL_HOME};
    `;
  }

  private async _downloadYaml() {
    console.debug('@@@@@@ Start download yaml file from external... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = `
    mkdir -p ~/${HyperCloudOperatorInstaller.INSTALL_HOME};
    cd ~/${HyperCloudOperatorInstaller.INSTALL_HOME};
    wget -O hypercloud-operator.tar.gz https://github.com/tmax-cloud/hypercloud-operator/archive/v${HyperCloudOperatorInstaller.HPCD_VERSION}.tar.gz;
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
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${HyperCloudOperatorInstaller.IMAGE_DIR}/`;
    await scp.sendFile(
      mainMaster,
      srcPath,
      `${HyperCloudOperatorInstaller.IMAGE_HOME}/`
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
    mkdir -p ~/${HyperCloudOperatorInstaller.IMAGE_HOME};
    export HPCD_HOME=~/${HyperCloudOperatorInstaller.IMAGE_HOME};
    export HPCD_VERSION=${HyperCloudOperatorInstaller.HPCD_VERSION};
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
      #rm -rf $HPCD_HOME;
      `;
  }
}
