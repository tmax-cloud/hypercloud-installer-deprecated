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
import ScriptHyperAuthFactory from '../script/ScriptHyperAuthFactory';
import CentosHyperAuthScript from '../script/CentosHyperAuthScript';

export default class HyperAuthInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR = `hyperauth-install`;

  public static readonly INSTALL_HOME = `${Env.INSTALL_ROOT}/hypercloud-install-guide/HyperAuth`;

  public static readonly IMAGE_HOME=`${Env.INSTALL_ROOT}/${HyperAuthInstaller.IMAGE_DIR}`;

  public static readonly POSTGRES_VERSION=`9.6.2-alpine`;

  public static readonly HYPERAUTH_VERSION=`1.0.3.4`;

  // singleton
  private static instance: HyperAuthInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!HyperAuthInstaller.instance) {
      HyperAuthInstaller.instance = new HyperAuthInstaller();
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

  public async realmImport(param: { callback: any; setProgress: Function; }) {
    const { callback, setProgress } = param;
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = `
    export HYPERAUTH_SERVICE_IP=\`kubectl describe service hyperauth -n hyperauth | grep 'LoadBalancer Ingress' | cut -d ' ' -f7\`;
    export HYPERCLOUD_CONSOLE_IP=\`kubectl describe service console-lb -n console-system | grep 'LoadBalancer Ingress' | cut -d ' ' -f7\`;
    cd ~/${HyperAuthInstaller.INSTALL_HOME}/manifest;
    sed -i 's|\\r$||g' tmaxRealmImport.sh;
    chmod 755 tmaxRealmImport.sh;
    ./tmaxRealmImport.sh \${HYPERAUTH_SERVICE_IP} \${HYPERCLOUD_CONSOLE_IP};
    `
    await mainMaster.exeCmd(callback);
  }

  private async _installMainMaster(callback: any) {
    console.debug('@@@@@@ Start installing main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();

    // Step 1. 초기화 작업
    mainMaster.cmd = this._step1();
    await mainMaster.exeCmd(callback);

    // 특정 pod가 뜨고 난 후 다음 작업 해야함
    // 15초 대기
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Step 2. SSL 인증서 생성
    mainMaster.cmd = this._step2(mainMaster.os.type);
    await mainMaster.exeCmd(callback);

    // Step 3. HyperAuth Deployment 배포
    mainMaster.cmd = this._step3();
    await mainMaster.exeCmd(callback);

    // Step 4. Kubernetes OIDC 연동
    await this._step4();

    console.debug('###### Finish installing main Master... ######');
  }

  private _step1(): string {
    // FIXME: 현재 임의로 sed로 resource 수정하고 있음, 추후 이슈 사항 있을 수도 있음!
    return `
    cd ~/${HyperAuthInstaller.INSTALL_HOME}/manifest;
    sed -i 's/cpu: "1"/cpu: "0.5"/g' 1.initialization.yaml;
    sed -i 's/memory: "5Gi"/memory: "500Mi"/g' 1.initialization.yaml;
    kubectl apply -f 1.initialization.yaml;
    `;
  }

  private _step2(osType: string): string {
    // TODO:Kubernetes Master가 다중화 된 경우, hyperauth.crt를 각 Master 노드들의 /etc/kubernetes/pki/hyperauth.crt 로 cp
    const script = ScriptHyperAuthFactory.createScript(osType);

    return `
    cd ~/${HyperAuthInstaller.INSTALL_HOME};
    ${script.createSslCert()}
    `;
  }

  private _step3(): string {
    // FIXME: 현재 임의로 sed로 resource 수정하고 있음, 추후 이슈 사항 있을 수도 있음!
    return `
    cd ~/${HyperAuthInstaller.INSTALL_HOME}/manifest;
    sed -i 's/memory: "1Gi"/memory: "500Mi"/g' 2.hyperauth_deployment.yaml;
    sed -i 's/cpu: "1"/cpu: "0.5"/g' 1.initialization.yaml;
    kubectl apply -f 2.hyperauth_deployment.yaml;
    `;
  }

  private async _step4() {
    const { mainMaster } = this.env.getNodesSortedByRole();

    mainMaster.cmd = `cat /etc/kubernetes/manifests/kube-apiserver.yaml;`;
    let apiServerYaml;
    await mainMaster.exeCmd({
      close: () => {},
      stdout: (data: string) => {
        apiServerYaml = YAML.parse(data.toString());
      },
      stderr: () => {},
    });
    console.error('apiServerYaml', apiServerYaml);
    apiServerYaml.spec.containers[0].command.push(`%%--oidc-issuer-url%%`)
    apiServerYaml.spec.containers[0].command.push(`--oidc-client-id=hypercloud4`)
    apiServerYaml.spec.containers[0].command.push(`--oidc-username-claim=preferred_username`)
    apiServerYaml.spec.containers[0].command.push(`--oidc-username-prefix=-`)
    apiServerYaml.spec.containers[0].command.push(`--oidc-groups-claim=group`)
    apiServerYaml.spec.containers[0].command.push(`--oidc-ca-file=/etc/kubernetes/pki/hyperauth.crt`)

    console.error('apiServerYaml stringify', YAML.stringify(apiServerYaml));
    mainMaster.cmd = `
    echo "${YAML.stringify(apiServerYaml)}" > /etc/kubernetes/manifests/kube-apiserver.yaml;
    export hyperCloudServiceIp=\`kubectl describe service hyperauth -n hyperauth | grep 'LoadBalancer Ingress' | cut -d ' ' -f7\`;
    sudo sed -i "s|%%--oidc-issuer-url%%|--oidc-issuer-url=https://$hyperCloudServiceIp/auth/realms/tmax|g" /etc/kubernetes/manifests/kube-apiserver.yaml;
    `
    await mainMaster.exeCmd();
  }

  private async rollbackApiServerYaml() {
    const { mainMaster } = this.env.getNodesSortedByRole();

    mainMaster.cmd = `cat /etc/kubernetes/manifests/kube-apiserver.yaml;`;
    let apiServerYaml;
    await mainMaster.exeCmd({
      close: () => {},
      stdout: (data: string) => {
        apiServerYaml = YAML.parse(data.toString());
      },
      stderr: () => {},
    });
    console.error('apiServerYaml', apiServerYaml);
    apiServerYaml.spec.containers[0].command = apiServerYaml.spec.containers[0].command.filter((cmd: string | string[])=>{
      return cmd.indexOf("--oidc") === -1;
    })

    console.error('apiServerYaml stringify', YAML.stringify(apiServerYaml));
    mainMaster.cmd = `
    echo "${YAML.stringify(apiServerYaml)}" > /etc/kubernetes/manifests/kube-apiserver.yaml;
    `
    await mainMaster.exeCmd();
  }

  private async _removeMainMaster() {
    console.debug('@@@@@@ Start remove main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getRemoveScript();
    await mainMaster.exeCmd();

    // kube-apiserver.yaml 수정
    await this.rollbackApiServerYaml();
    console.debug('###### Finish remove main Master... ######');
  }

  private _getRemoveScript(): string {
    return `
    cd ~/${HyperAuthInstaller.INSTALL_HOME}/manifest;
    kubectl delete -f 2.hyperauth_deployment.yaml;
    kubectl delete -f 1.initialization.yaml;
    `;
  }

  // protected abstract 구현
  protected async _preWorkInstall(param?: any) {
    console.debug('@@@@@@ Start pre-installation... @@@@@@');
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
    console.debug('###### Finish pre-installation... ######');
  }

  protected async _downloadImageFile() {
    // TODO: download image file
    console.debug('@@@@@@ Start downloading the image file to client local... @@@@@@');
    console.debug('###### Finish downloading the image file to client local... ######');
  }

  protected async _sendImageFile() {
    console.debug('@@@@@@ Start sending the image file to main master node... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${HyperAuthInstaller.IMAGE_DIR}/`;
    await scp.sendFile(mainMaster, srcPath, `${HyperAuthInstaller.IMAGE_HOME}/`);
    console.debug('###### Finish sending the image file to main master node... ######');
  }

  protected async _registryWork(param: { callback: any; }) {
    console.debug('@@@@@@ Start pushing the image at main master node... @@@@@@');
    const { callback } = param;
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getImagePushScript();
    await mainMaster.exeCmd(callback);
    console.debug('###### Finish pushing the image at main master node... ######');
  }

  protected _getImagePushScript(): string {
    let gitPullCommand = `
    mkdir -p ~/${HyperAuthInstaller.IMAGE_HOME};
    export HYPERAUTH_HOME=~/${HyperAuthInstaller.IMAGE_HOME};
    export POSTGRES_VERSION=${HyperAuthInstaller.POSTGRES_VERSION};
    export HYPERAUTH_VERSION=${HyperAuthInstaller.HYPERAUTH_VERSION};
    export REGISTRY=${this.env.registry};
    cd $HYPERAUTH_HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      sudo docker load < postgres_\${POSTGRES_VERSION}.tar;
      sudo docker load < hyperauth_b\${HYPERAUTH_VERSION}.tar;
      # sudo docker save tmaxcloudck/hyperauth:b\${HYPERAUTH_VERSION} > hyperauth_b\${HYPERAUTH_VERSION}.tar;
      # sudo docker save postgres:\${POSTGRES_VERSION} > postgres_\${POSTGRES_VERSION}.tar;
      `;
    } else {
      gitPullCommand += `
      sudo docker pull postgres:\${POSTGRES_VERSION};
      sudo docker pull tmaxcloudck/hyperauth:b\${HYPERAUTH_VERSION};
      `;
    }
    return `
      ${gitPullCommand}
      sudo docker tag postgres:\${POSTGRES_VERSION} \${REGISTRY}/postgres:\${POSTGRES_VERSION}
      sudo docker tag tmaxcloudck/hyperauth:b\${HYPERAUTH_VERSION}; \${REGISTRY}/tmaxcloudck/hyperauth:b\${HYPERAUTH_VERSION};

      sudo docker push \${REGISTRY}/postgres:\${POSTGRES_VERSION}
      sudo docker push \${REGISTRY}/tmaxcloudck/hyperauth:b\${HYPERAUTH_VERSION};
      #rm -rf $HYPERAUTH_HOME;
      `;
  }

}
