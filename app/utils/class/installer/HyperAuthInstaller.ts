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
import ScriptHyperAuthFactory from '../script/ScriptHyperAuthFactory';
import CentosHyperAuthScript from '../script/CentosHyperAuthScript';

export default class HyperAuthInstaller extends AbstractInstaller {
  public static readonly INSTALL_HOME = `hypercloud-install-guide/HyperAuth`;

  public static readonly IMAGE_DIR = `hypercloud-operator-install`;

  public static readonly HPCD_VERSION=`1.0.3.4`;

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

    // setProgress(10);
    // await this._preWorkInstall({
    //   callback
    // });
    // setProgress(60);
    await this._installMainMaster(callback);
    // setProgress(100);
  }

  public async remove() {
    await this._removeMainMaster();
  }

  private async _installMainMaster(callback: any) {
    console.error('###### Start installing main Master... ######');
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

    console.error('###### Finish installing main Master... ######');
  }

  private _step1(): string {
    return `
    cd ~/${HyperAuthInstaller.INSTALL_HOME}/manifest;
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
    return `
    cd ~/${HyperAuthInstaller.INSTALL_HOME}/manifest;
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

  private async _removeMainMaster() {
    console.error('###### Start remove main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getRemoveScript();
    await mainMaster.exeCmd();
    console.error('###### Finish remove main Master... ######');
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
    const srcPath = `${rootPath}/${HyperAuthInstaller.IMAGE_DIR}/`;
    await scp.sendFile(mainMaster, srcPath, `${HyperAuthInstaller.IMAGE_DIR}/`);
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
    mkdir -p ~/${HyperAuthInstaller.IMAGE_DIR};
    export HPCD_HOME=~/${HyperAuthInstaller.IMAGE_DIR};
    export HPCD_VERSION=v${HyperAuthInstaller.HPCD_VERSION};
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
