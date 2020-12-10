/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import YAML from 'yaml';
import * as scp from '../../common/scp';
import AbstractInstaller from './AbstractInstaller';
import Env, { NETWORK_TYPE } from '../Env';
import * as Common from '../../common/common';
import Node from '../Node';

export default class HyperCloudWebhookInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR = `hypercloud-webhook-install`;

  public static readonly INSTALL_HOME = `${Env.INSTALL_ROOT}/hypercloud-install-guide/HyperCloud\\ Webhook`;

  public static readonly IMAGE_HOME = `${Env.INSTALL_ROOT}/${HyperCloudWebhookInstaller.IMAGE_DIR}`;

  public static readonly WEBHOOK_VERSION = `4.1.0.22`;

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
    console.debug('@@@@@@ Start installing webhook main Master... @@@@@@');
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

    // Webhook Config 다른 마스터들에게 복사
    mainMaster.cmd = this._cpConfigtoMaster();
    await mainMaster.exeCmd(callback);

    // Step 6. HyperCloud Audit Webhook Config 적용
    await this._step6();

    // Step 7. test-yaml 배포
    mainMaster.cmd = this._step7();
    await mainMaster.exeCmd(callback);

    console.debug('###### Finish installing webhook main Master... ######');
  }

  private _step0() {
    let script = `
    cd ~/${HyperCloudWebhookInstaller.INSTALL_HOME}/manifests;
    export WEBHOOK_VERSION=${HyperCloudWebhookInstaller.WEBHOOK_VERSION};

    sed -i 's/{webhook_version}/'b\${WEBHOOK_VERSION}'/g' 02_webhook-deployment.yaml;
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
    let script = `cd ~/${HyperCloudWebhookInstaller.INSTALL_HOME}/manifests;`;

    // 개발 환경에서는 테스트 시, POD의 메모리를 조정하여 테스트
    if (process.env.RESOURCE === 'low') {
      script += `
      sed -i 's/memory: "1Gi"/memory: "500Mi"/g' 02_webhook-deployment.yaml;
      `;
    }
    script += `
    kubectl apply -f 02_webhook-deployment.yaml;
    `;

    return script;
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

  private _cpConfigtoMaster() {
    const { masterArr } = this.env.getNodesSortedByRole();
    let copyScript = '';
    masterArr.map(master => {
      copyScript += `
      sshpass -p '${master.password}' scp -P ${master.port} -o StrictHostKeyChecking=no ./06_audit-webhook-config ${master.user}@${master.ip}:/etc/kubernetes/pki/audit-webhook-config;
      sshpass -p '${master.password}' scp -P ${master.port} -o StrictHostKeyChecking=no ./07_audit-policy.yaml ${master.user}@${master.ip}:/etc/kubernetes/pki/audit-policy.yaml;
      `;
    });

    return `
    cd ~/${HyperCloudWebhookInstaller.INSTALL_HOME}/manifests;
    ${copyScript}
    `;
  }

  private async _step6() {
    const { mainMaster, masterArr } = this.env.getNodesSortedByRole();

    mainMaster.cmd = `cat /etc/kubernetes/manifests/kube-apiserver.yaml;`;
    let apiServerYaml: any;
    await mainMaster.exeCmd({
      close: () => {},
      stdout: (data: string) => {
        apiServerYaml = YAML.parse(data.toString());
      },
      stderr: () => {}
    });
    console.error('apiServerYaml', apiServerYaml);
    apiServerYaml.spec.containers[0].command.push(
      `--audit-log-path=/var/log/kubernetes/apiserver/audit.log`
    );
    apiServerYaml.spec.containers[0].command.push(
      `--audit-policy-file=/etc/kubernetes/pki/audit-policy.yaml`
    );
    apiServerYaml.spec.containers[0].command.push(
      `--audit-webhook-config-file=/etc/kubernetes/pki/audit-webhook-config`
    );
    apiServerYaml.spec.dnsPolicy = 'ClusterFirstWithHostNet';

    console.error('apiServerYaml stringify', YAML.stringify(apiServerYaml));
    mainMaster.cmd = `
    echo "${YAML.stringify(
      apiServerYaml
    )}" > /etc/kubernetes/manifests/kube-apiserver.yaml;
    `;
    await mainMaster.exeCmd();

    await Common.waitApiServerUntilNormal(mainMaster);

    // 다른 마스터에도 적용
    await Promise.all(
      masterArr.map(async (master: Node) => {
        master.cmd = `cat /etc/kubernetes/manifests/kube-apiserver.yaml;`;
        await master.exeCmd({
          close: () => {},
          stdout: (data: string) => {
            apiServerYaml = YAML.parse(data.toString());
          },
          stderr: () => {}
        });
        console.error('apiServerYaml', apiServerYaml);
        apiServerYaml.spec.containers[0].command.push(
          `--audit-log-path=/var/log/kubernetes/apiserver/audit.log`
        );
        apiServerYaml.spec.containers[0].command.push(
          `--audit-policy-file=/etc/kubernetes/pki/audit-policy.yaml`
        );
        apiServerYaml.spec.containers[0].command.push(
          `--audit-webhook-config-file=/etc/kubernetes/pki/audit-webhook-config`
        );
        apiServerYaml.spec.dnsPolicy = 'ClusterFirstWithHostNet';

        console.error('apiServerYaml stringify', YAML.stringify(apiServerYaml));
        master.cmd = `
        echo "${YAML.stringify(
          apiServerYaml
        )}" > /etc/kubernetes/manifests/kube-apiserver.yaml;
        `;
        await master.exeCmd();
      })
    );
  }

  private _step7() {
    return `
    cd ~/${HyperCloudWebhookInstaller.INSTALL_HOME}/manifests;
    kubectl apply -f test-yaml/namespaceclaim.yaml;
    `;
  }

  public async rollbackApiServerYaml() {
    const { mainMaster, masterArr } = this.env.getNodesSortedByRole();

    const targetList = [...masterArr, mainMaster];

    await Promise.all(
      targetList.map(async node => {
        node.cmd = `cat /etc/kubernetes/manifests/kube-apiserver.yaml;`;
        let apiServerYaml;
        await node.exeCmd({
          close: () => {},
          stdout: (data: string) => {
            apiServerYaml = YAML.parse(data.toString());
          },
          stderr: () => {}
        });
        console.error('apiServerYaml', apiServerYaml);
        apiServerYaml.spec.containers[0].command = apiServerYaml.spec.containers[0].command.filter(
          (cmd: string | string[]) => {
            return cmd.indexOf('--audit') === -1;
          }
        );
        delete apiServerYaml.spec.dnsPolicy;

        console.error('apiServerYaml stringify', YAML.stringify(apiServerYaml));
        node.cmd = `
        echo "${YAML.stringify(
          apiServerYaml
        )}" > /etc/kubernetes/manifests/kube-apiserver.yaml;
        `;
        await node.exeCmd();
      })
    );
  }

  private async _removeMainMaster() {
    console.debug('@@@@@@ Start remove webhook main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getRemoveScript();
    await mainMaster.exeCmd();
    console.debug('###### Finish remove webhook main Master... ######');
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
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${HyperCloudWebhookInstaller.IMAGE_DIR}/`;
    await scp.sendFile(
      mainMaster,
      srcPath,
      `${HyperCloudWebhookInstaller.IMAGE_HOME}/`
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
    mkdir -p ~/${HyperCloudWebhookInstaller.IMAGE_HOME};
    export WEBHOOK_HOME=~/${HyperCloudWebhookInstaller.IMAGE_HOME};
    export WEBHOOK_VERSION=${HyperCloudWebhookInstaller.WEBHOOK_VERSION};
    export REGISTRY=${this.env.registry};
    cd $WEBHOOK_HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      sudo docker load < hypercloud-webhook_b\${WEBHOOK_VERSION}.tar;
      `;
    } else {
      gitPullCommand += `
      sudo docker pull tmaxcloudck/hypercloud-webhook:b\${WEBHOOK_VERSION};
      `;
    }
    return `
      ${gitPullCommand}
      sudo docker tag tmaxcloudck/hypercloud-webhook:b\${WEBHOOK_VERSION} \${REGISTRY}/hypercloud-webhook:b\${WEBHOOK_VERSION};

      sudo docker push \${REGISTRY}/hypercloud-webhook:b\${WEBHOOK_VERSION}
      #rm -rf $WEBHOOK_HOME;
      `;
  }
}
