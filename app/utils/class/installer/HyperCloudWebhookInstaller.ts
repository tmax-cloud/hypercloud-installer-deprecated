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
import ScriptHyperCloudOperatorFactory from '../script/ScriptHyperCloudOperatorFactory';
import IngressControllerInstaller from './ingressControllerInstaller';

export default class HyperCloudWebhookInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR = `hypercloud-webhook-install`;

  public static readonly INSTALL_HOME = `${Env.INSTALL_ROOT}/hypercloud-install-guide/HyperCloud\\ Webhook`;

  public static readonly IMAGE_HOME=`${Env.INSTALL_ROOT}/${HyperCloudWebhookInstaller.IMAGE_DIR}`;

  public static readonly WEBHOOK_VERSION=`b4.1.0.22`;

  // singleton
  private static instance: HyperCloudWebhookInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!HyperCloudWebhookInstaller.instance) {
      HyperCloudWebhookInstaller.instance = new HyperCloudWebhookInstaller();
    }
    return this.instance;
  }

  public async install(param: { callback: any; setProgress: Function; }) {
    const { callback, setProgress } = param;

    await this._preWorkInstall({
      callback
    });
    setProgress(20);

    await this._installMainMaster(callback);
    setProgress(100);
  }

  public async remove() {
    await this._removeMainMaster();
  }

  private async _installMainMaster(callback: any) {
    console.error('@@@@@@ Start installing main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();

    // Step 0. hypercloud-webhook yaml 수정
    mainMaster.cmd = this._step0();
    await mainMaster.exeCmd(callback);

    // Step 1. Secret 생성
    mainMaster.cmd = this._step1();
    await mainMaster.exeCmd(callback);

    // Step 2. HyperCloud Webhook Server 설치
    mainMaster.cmd = this._step2();
    await mainMaster.exeCmd(callback);

    // Step 3. HyperCloud Webhook Config 생성
    mainMaster.cmd = this._step3();
    await mainMaster.exeCmd(callback);

    // Step 4. HyperCloud Webhook Config 적용
    mainMaster.cmd = this._step4();
    await mainMaster.exeCmd(callback);

    // Step 5. HyperCloud Audit Webhook Config 생성
    mainMaster.cmd = this._step5();
    await mainMaster.exeCmd(callback);

    // Step 6. HyperCloud Audit Webhook Config 적용
    await this._step6();

    // Step 7. test-yaml 배포
    mainMaster.cmd = this._step7();
    await mainMaster.exeCmd(callback);

    console.error('###### Finish installing main Master... ######');
  }

  private _step0() {
    let script = `
    cd ~/${HyperCloudWebhookInstaller.INSTALL_HOME}/manifests;
    export WEBHOOK_VERSION=${HyperCloudWebhookInstaller.WEBHOOK_VERSION};

    sed -i 's/{webhook_version}/'\${WEBHOOK_VERSION}'/g' 02_webhook-deployment.yaml;
    sed -i 's/{hostname}/'\${HOSTNAME}'/g' 02_webhook-deployment.yaml;
    `;

    if (this.env.registry) {
      script += `
      sed -i 's/tmaxcloudck\\/hypercloud-webhook/'\${REGISTRY}'\\/hypercloud-webhook/g' 02_webhook-deployment.yaml;
      `;
    }
    return script;
  }

  private _step1() {
    return `
    cd ~/${HyperCloudWebhookInstaller.INSTALL_HOME}/manifests;
    sh 01_create_secret.sh;
    `;
  }

  private _step2() {
    // FIXME: 현재 임의로 sed로 resource 수정하고 있음, 추후 이슈 사항 있을 수도 있음!
    return `
    cd ~/${HyperCloudWebhookInstaller.INSTALL_HOME}/manifests;
    sed -i 's/memory: "1Gi"/memory: "500Mi"/g' 02_webhook-deployment.yaml;
    kubectl apply -f 02_webhook-deployment.yaml;
    `;
  }

  private _step3() {
    return `
    cd ~/${HyperCloudWebhookInstaller.INSTALL_HOME}/manifests;
    sh 03_gen-webhook-config.sh;
    `;
  }

  private _step4() {
    return `
    cd ~/${HyperCloudWebhookInstaller.INSTALL_HOME}/manifests;
    kubectl apply -f 04_webhook-configuration.yaml;
    `;
  }

  private _step5() {
    return `
    cd ~/${HyperCloudWebhookInstaller.INSTALL_HOME}/manifests;
    sh 05_gen-audit-config.sh;
    cp 06_audit-webhook-config /etc/kubernetes/pki/audit-webhook-config;
    cp 07_audit-policy.yaml /etc/kubernetes/pki/audit-policy.yaml;
    `;
  }

  private async _step6() {
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
    apiServerYaml.spec.containers[0].command.push(`--audit-log-path=/var/log/kubernetes/apiserver/audit.log`)
    apiServerYaml.spec.containers[0].command.push(`--audit-policy-file=/etc/kubernetes/pki/audit-policy.yaml`)
    apiServerYaml.spec.containers[0].command.push(`--audit-webhook-config-file=/etc/kubernetes/pki/audit-webhook-config`)
    apiServerYaml.spec.dnsPolicy = 'ClusterFirstWithHostNet';

    console.error('apiServerYaml stringify', YAML.stringify(apiServerYaml));
    mainMaster.cmd = `
    echo "${YAML.stringify(apiServerYaml)}" > /etc/kubernetes/manifests/kube-apiserver.yaml;
    `
    await mainMaster.exeCmd();
  }

  private _step7() {
    return `
    cd ~/${HyperCloudWebhookInstaller.INSTALL_HOME}/manifests;
    kubectl apply -f test-yaml/namespaceclaim.yaml;
    `;
  }

  private async _removeMainMaster() {
    console.error('@@@@@@ Start remove main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getRemoveScript();
    await mainMaster.exeCmd();
    console.error('###### Finish remove main Master... ######');
  }

  private _getRemoveScript(): string {
    return `
    cd ~/${HyperCloudWebhookInstaller.INSTALL_HOME}/manifests;
    kubectl delete -f test-yaml/namespaceclaim.yaml;
    kubectl delete -f 04_webhook-configuration.yaml;
    kubectl delete -f 02_webhook-deployment.yaml;
    #rm -rf ~/${HyperCloudWebhookInstaller.INSTALL_HOME};
    `;
  }

  // protected abstract 구현
  protected async _preWorkInstall(param?: any) {
    console.error('@@@@@@ Start pre-installation... @@@@@@');
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
    console.error('@@@@@@ Start downloading the image file to client local... @@@@@@');
    console.error('###### Finish downloading the image file to client local... ######');
  }

  protected async _sendImageFile() {
    console.error('@@@@@@ Start sending the image file to main master node... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${HyperCloudWebhookInstaller.IMAGE_DIR}/`;
    await scp.sendFile(mainMaster, srcPath, `${HyperCloudWebhookInstaller.IMAGE_HOME}/`);
    console.error('###### Finish sending the image file to main master node... ######');
  }

  protected async _registryWork(param: { callback: any; }) {
    console.error('@@@@@@ Start pushing the image at main master node... @@@@@@');
    const { callback } = param;
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getImagePushScript();
    await mainMaster.exeCmd(callback);
    console.error('###### Finish pushing the image at main master node... ######');
  }

  protected _getImagePushScript(): string {
    let gitPullCommand = `
    mkdir -p ~/${HyperCloudWebhookInstaller.IMAGE_HOME};
    export WEBHOOK_HOME=~/${HyperCloudWebhookInstaller.IMAGE_HOME};
    export WEBHOOK_VERSION=${HyperCloudWebhookInstaller.WEBHOOK_VERSION};
    export REGISTRY=${this.env.registry};
    cd $WEBHOOK_HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      sudo docker load < hypercloud-webhook_\${WEBHOOK_VERSION}.tar;
      `;
    } else {
      gitPullCommand += `
      sudo docker pull tmaxcloudck/hypercloud-webhook:\${WEBHOOK_VERSION};
      `;
    }
    return `
      ${gitPullCommand}
      sudo docker tag tmaxcloudck/hypercloud-webhook:\${WEBHOOK_VERSION} \${REGISTRY}/hypercloud-webhook:\${WEBHOOK_VERSION};

      sudo docker push \${REGISTRY}/hypercloud-webhook:\${WEBHOOK_VERSION}
      #rm -rf $WEBHOOK_HOME;
      `;
  }
}
