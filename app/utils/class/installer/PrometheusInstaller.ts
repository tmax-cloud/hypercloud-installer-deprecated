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
import ScriptPrometheusFactory from '../script/ScriptPrometheusFactory';

export default class PrometheusInstaller extends AbstractInstaller {
  public static readonly INSTALL_HOME=`hypercloud-install-guide/Prometheus`;

  public static readonly IMAGE_DIR=`prometheus-install`;

  public static readonly PROMETHEUS_VERSION=`2.11.0`;

  public static readonly PROMETHEUS_OPERATOR_VERSION=`0.34.0`;

  public static readonly NODE_EXPORTER_VERSION=`0.18.1`;

  public static readonly GRAFANA_VERSION=`6.4.3`;

  public static readonly KUBE_STATE_METRICS_VERSION=`1.8.0`;

  public static readonly CONFIGMAP_RELOADER_VERSION=`0.34.0`;

  public static readonly CONFIGMAP_RELOAD_VERSION=`0.0.1`;

  public static readonly KUBE_RBAC_PROXY_VERSION=`0.4.1`;

  public static readonly PROMETHEUS_ADAPTER_VERSION=`0.5.0`;

  public static readonly ALERTMANAGER_VERSION=`0.20.0`;

  // singleton
  private static instance: PrometheusInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!PrometheusInstaller.instance) {
      PrometheusInstaller.instance = new PrometheusInstaller();
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
    const script = ScriptPrometheusFactory.createScript(mainMaster.os.type)
    mainMaster.cmd = script.cloneGitFile(CONST.GIT_REPO, CONST.GIT_BRANCH);
    mainMaster.cmd += this._getInstallScript();
    await mainMaster.exeCmd(callback);

    // setup/ yaml 적용 후, 특정 pod가 뜨고 난 후 다음 작업 해야함
    // 10초 대기
    await new Promise(resolve => setTimeout(resolve, 10000));


    // Step 2. Prometheus 모듈들에 대한 deploy 및 RBAC 생성
    mainMaster.cmd = `
    cd ~/${PrometheusInstaller.INSTALL_HOME}/yaml/;
    kubectl create -f manifests/;
    kubectl get svc -n monitoring prometheus-k8s -o yaml | sed "s|type: NodePort|type: LoadBalancer|g" | kubectl replace -f -;
    kubectl get svc -n monitoring grafana -o yaml | sed "s|type: ClusterIP|type: LoadBalancer|g" | kubectl replace -f -;
    `;
    await mainMaster.exeCmd(callback);

    // Step 3. kube-scheduler 와 kube-controller-manager 설정
    mainMaster.cmd = `
    cd ~/${PrometheusInstaller.INSTALL_HOME}/yaml/;
    kubectl create -f kube-controller-manager-prometheus-discovery.yaml;
    kubectl create -f kube-scheduler-prometheus-discovery.yaml;
    `;
    await mainMaster.exeCmd(callback);
    // monitoring namespace의 servicemonitor 객체 중 kube-controller-manager 와 kube-scheduler의 spec.endpoints.metricRelabelings 부분 삭제
    await this._EditYamlScript();
    // kube-system namespace에 있는 모든 kube-schduler pod의 metadata.labels에k8s-app: kube-scheduler추가
    // kube-system namespace에 있는 모든 kube-contoroller-manager pod의 metadata.labels에k8s-app: kube-controller-manager 추가
    await this._EditYamlScript2();
    console.error('###### Finish installing main Master... ######');
  }

  private async _EditYamlScript2() {
    const { mainMaster } = this.env.getNodesSortedByRole();

    mainMaster.cmd = `kubectl get pod -n kube-system -o=jsonpath='{.items[*].metadata.name}';`;
    let podNameStr;
    await mainMaster.exeCmd({
      close: () => {},
      stdout: (data: string) => {
        podNameStr = data.toString();
      },
      stderr: () => {},
    });
    const podNameList = podNameStr.split(' ');
    const schedulerNameList: string[] = [];
    const controllerNameList: string[] = [];

    podNameList.map((podName: string)=>{
      if (podName.startsWith('kube-scheduler')) {
        schedulerNameList.push(podName);
      } else if (podName.startsWith('kube-controller-manager')) {
        controllerNameList.push(podName);
      }
    });
    mainMaster.cmd = '';
    schedulerNameList.map((podName)=>{
      mainMaster.cmd += `kubectl get pod -n kube-system ${podName} -o yaml | sed "s|labels:|labels:\\n    k8s-app: kube-scheduler|g" | kubectl replace -f -;`
    })
    controllerNameList.map((podName)=>{
      mainMaster.cmd += `kubectl get pod -n kube-system ${podName} -o yaml | sed "s|labels:|labels:\\n    k8s-app: kube-controller-manager|g" | kubectl replace -f -;`
    })

    await mainMaster.exeCmd();
  }

  private async _EditYamlScript() {
    const { mainMaster } = this.env.getNodesSortedByRole();

    // kube-controller-manager 변경
    mainMaster.cmd = `kubectl get servicemonitor -n monitoring kube-controller-manager -o yaml;`;
    let controllerYaml;
    await mainMaster.exeCmd({
      close: () => {},
      stdout: (data: string) => {
        controllerYaml = YAML.parse(data.toString());
      },
      stderr: () => {},
    });
    console.error(controllerYaml);
    for (let i = 0; i< controllerYaml.spec.endpoints.length; i += 1) {
      delete controllerYaml.spec.endpoints[i].metricRelabelings;
    }
    mainMaster.cmd = `
    echo "${YAML.stringify(controllerYaml)}" > ~/${PrometheusInstaller.INSTALL_HOME}/controller.yaml;
    sed -i "s|${controllerYaml.metadata.resourceVersion}|\\"${controllerYaml.metadata.resourceVersion}\\"|g" ~/${PrometheusInstaller.INSTALL_HOME}/controller.yaml;
    kubectl replace -f ~/${PrometheusInstaller.INSTALL_HOME}/controller.yaml;
    rm -rf ~/${PrometheusInstaller.INSTALL_HOME}/controller.yaml;
    `;
    await mainMaster.exeCmd();

    // kube-scheduler 변경
    mainMaster.cmd = `kubectl get servicemonitor -n monitoring kube-scheduler -o yaml;`;
    let schedulerYaml;
    await mainMaster.exeCmd({
      close: () => {},
      stdout: (data: string) => {
        schedulerYaml = YAML.parse(data.toString());
      },
      stderr: () => {},
    });
    console.error(schedulerYaml);
    for (let i = 0; i< schedulerYaml.spec.endpoints.length; i += 1) {
      delete schedulerYaml.spec.endpoints[i].metricRelabelings;
    }
    mainMaster.cmd = `
    echo "${YAML.stringify(schedulerYaml)}" > ~/${PrometheusInstaller.INSTALL_HOME}/scheduler.yaml;
    sed -i "s|${schedulerYaml.metadata.resourceVersion}|\\"${schedulerYaml.metadata.resourceVersion}\\"|g" ~/${PrometheusInstaller.INSTALL_HOME}/scheduler.yaml;
    kubectl replace -f ~/${PrometheusInstaller.INSTALL_HOME}/scheduler.yaml;
    rm -rf ~/${PrometheusInstaller.INSTALL_HOME}/scheduler.yaml;
    `;
    await mainMaster.exeCmd();
  }

  private async _removeMainMaster() {
    console.error('###### Start remove rook-ceph... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const script = ScriptPrometheusFactory.createScript(mainMaster.os.type)
    mainMaster.cmd = script.cloneGitFile(CONST.GIT_REPO, CONST.GIT_BRANCH);
    mainMaster.cmd += this._getRemoveScript();
    await mainMaster.exeCmd();
    console.error('###### Finish remove rook-ceph... ######');
  }

  private _getInstallScript(): string {
    let setRegistry = '';
    // git guide에 내용 보기 쉽게 변경해놓음 (공백 유지해야함)
    if (this.env.registry) {
      setRegistry = `
      cd ~/${PrometheusInstaller.INSTALL_HOME}/yaml/manifests/;
      sed -i "s| quay.io/prometheus/alertmanager| ${this.env.registry}/prometheus/alertmanager|g" alertmanager-alertmanager.yaml;
      sed -i "s| grafana/grafana| ${this.env.registry}/grafana|g" grafana-deployment.yaml;
      sed -i "s| quay.io/coreos/kube-rbac-proxy| ${this.env.registry}/coreos/kube-rbac-proxy|g" kube-state-metrics-deployment.yaml;
      sed -i "s| quay.io/coreos/kube-state-metrics| ${this.env.registry}/coreos/kube-state-metrics|g" kube-state-metrics-deployment.yaml;
      sed -i "s| quay.io/prometheus/node-exporter| ${this.env.registry}/prometheus/node-exporter|g" node-exporter-daemonset.yaml;
      sed -i "s| quay.io/coreos/kube-rbac-proxy| ${this.env.registry}/coreos/kube-rbac-proxy|g" node-exporter-daemonset.yaml;
      sed -i "s| quay.io/coreos/k8s-prometheus-adapter-amd64| ${this.env.registry}/coreos/k8s-prometheus-adapter-amd64|g" prometheus-adapter-deployment.yaml;
      sed -i "s| quay.io/prometheus/prometheus| ${this.env.registry}/prometheus/prometheus|g" prometheus-prometheus.yaml;

      cd ~/${PrometheusInstaller.INSTALL_HOME}/yaml/setup/;
      sed -i "s| quay.io/coreos/configmap-reload| ${this.env.registry}/coreos/configmap-reload|g" prometheus-operator-deployment.yaml
      sed -i "s| quay.io/coreos/prometheus-config-reloader| ${this.env.registry}/coreos/prometheus-config-reloader|g" prometheus-operator-deployment.yaml
      sed -i "s| quay.io/coreos/prometheus-operator| ${this.env.registry}/coreos/prometheus-operator|g" prometheus-operator-deployment.yaml
      `;
    }
    return `
      export PROMETHEUS_VERSION=v${PrometheusInstaller.PROMETHEUS_VERSION};
      export PROMETHEUS_OPERATOR_VERSION=v${PrometheusInstaller.PROMETHEUS_OPERATOR_VERSION};
      export NODE_EXPORTER_VERSION=v${PrometheusInstaller.NODE_EXPORTER_VERSION};
      export GRAFANA_VERSION=${PrometheusInstaller.GRAFANA_VERSION};
      export KUBE_STATE_METRICS_VERSION=v${PrometheusInstaller.KUBE_STATE_METRICS_VERSION};
      export CONFIGMAP_RELOADER_VERSION=v${PrometheusInstaller.CONFIGMAP_RELOADER_VERSION};
      export CONFIGMAP_RELOAD_VERSION=v${PrometheusInstaller.CONFIGMAP_RELOAD_VERSION};
      export KUBE_RBAC_PROXY_VERSION=v${PrometheusInstaller.KUBE_RBAC_PROXY_VERSION};
      export PROMETHEUS_ADAPTER_VERSION=v${PrometheusInstaller.PROMETHEUS_ADAPTER_VERSION};
      export ALERTMANAGER_VERSION=v${PrometheusInstaller.ALERTMANAGER_VERSION};

      cd ~/${PrometheusInstaller.INSTALL_HOME}/yaml/manifests/;
      sed -i 's/{ALERTMANAGER_VERSION}/'\${ALERTMANAGER_VERSION}'/g' alertmanager-alertmanager.yaml;
      sed -i 's/{GRAFANA_VERSION}/'\${GRAFANA_VERSION}'/g' grafana-deployment.yaml;
      sed -i 's/{KUBE_RBAC_PROXY_VERSION}/'\${KUBE_RBAC_PROXY_VERSION}'/g' kube-state-metrics-deployment.yaml;
      sed -i 's/{KUBE_STATE_METRICS_VERSION}/'\${KUBE_STATE_METRICS_VERSION}'/g' kube-state-metrics-deployment.yaml;
      sed -i 's/{NODE_EXPORTER_VERSION}/'\${NODE_EXPORTER_VERSION}'/g' node-exporter-daemonset.yaml;
      sed -i 's/{KUBE_RBAC_PROXY_VERSION}/'\${KUBE_RBAC_PROXY_VERSION}'/g' node-exporter-daemonset.yaml;
      sed -i 's/{PROMETHEUS_ADAPTER_VERSION}/'\${PROMETHEUS_ADAPTER_VERSION}'/g' prometheus-adapter-deployment.yaml;
      sed -i 's/{PROMETHEUS_VERSION}/'\${PROMETHEUS_VERSION}'/g' prometheus-prometheus.yaml;

      cd ~/${PrometheusInstaller.INSTALL_HOME}/yaml/setup/;
      sed -i 's/{PROMETHEUS_OPERATOR_VERSION}/'\${PROMETHEUS_OPERATOR_VERSION}'/g' prometheus-operator-deployment.yaml;
      sed -i 's/{CONFIGMAP_RELOADER_VERSION}/'\${CONFIGMAP_RELOADER_VERSION}'/g' prometheus-operator-deployment.yaml;
      sed -i 's/{CONFIGMAP_RELOAD_VERSION}/'\${CONFIGMAP_RELOAD_VERSION}'/g' prometheus-operator-deployment.yaml;
      ${setRegistry}

      cd ~/${PrometheusInstaller.INSTALL_HOME}/yaml/;
      kubectl create -f setup/;
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
    const srcPath = `${rootPath}/${PrometheusInstaller.IMAGE_DIR}/`;
    await scp.sendFile(mainMaster, srcPath, `${PrometheusInstaller.IMAGE_DIR}/`);
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
    mkdir -p ~/${PrometheusInstaller.IMAGE_DIR};
    export PROMETHEUS_HOME=~/${PrometheusInstaller.IMAGE_DIR};
    export PROMETHEUS_VERSION=v${PrometheusInstaller.PROMETHEUS_VERSION};
    export PROMETHEUS_OPERATOR_VERSION=v${PrometheusInstaller.PROMETHEUS_OPERATOR_VERSION};
    export NODE_EXPORTER_VERSION=v${PrometheusInstaller.NODE_EXPORTER_VERSION};
    export GRAFANA_VERSION=${PrometheusInstaller.GRAFANA_VERSION};
    export KUBE_STATE_METRICS_VERSION=v${PrometheusInstaller.KUBE_STATE_METRICS_VERSION};
    export CONFIGMAP_RELOADER_VERSION=v${PrometheusInstaller.CONFIGMAP_RELOADER_VERSION};
    export CONFIGMAP_RELOAD_VERSION=v${PrometheusInstaller.CONFIGMAP_RELOAD_VERSION};
    export KUBE_RBAC_PROXY_VERSION=v${PrometheusInstaller.KUBE_RBAC_PROXY_VERSION};
    export PROMETHEUS_ADAPTER_VERSION=v${PrometheusInstaller.PROMETHEUS_ADAPTER_VERSION};
    export ALERTMANAGER_VERSION=v${PrometheusInstaller.ALERTMANAGER_VERSION};
    export REGISTRY=${this.env.registry};
    cd $PROMETHEUS_HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      sudo docker load < prometheus-prometheus_\${PROMETHEUS_VERSION}.tar;
      sudo docker load < prometheus-operator_\${PROMETHEUS_OPERATOR_VERSION}.tar;
      sudo docker load < node-exporter_\${NODE_EXPORTER_VERSION}.tar;
      sudo docker load < grafana_\${GRAFANA_VERSION}.tar;
      sudo docker load < kube-state-metrics_\${KUBE_STATE_METRICS_VERSION}.tar;
      sudo docker load < config-reloader_\${CONFIGMAP_RELOADER_VERSION}.tar;
      sudo docker load < config-reload_\${CONFIGMAP_RELOAD_VERSION}.tar;
      sudo docker load < kube-rbac-proxy_\${KUBE_RBAC_PROXY_VERSION}.tar;
      sudo docker load < prometheus-adapter_\${PROMETHEUS_ADAPTER_VERSION}.tar;
      sudo docker load < alertmanager_\${ALERTMANAGER_VERSION}.tar;
      `;
    } else {
      gitPullCommand += `
      sudo docker pull quay.io/prometheus/prometheus:\${PROMETHEUS_VERSION};
      sudo docker pull quay.io/coreos/prometheus-operator:\${PROMETHEUS_OPERATOR_VERSION};
      sudo docker pull quay.io/prometheus/node-exporter:\${NODE_EXPORTER_VERSION};
      sudo docker pull grafana/grafana:\${GRAFANA_VERSION};
      sudo docker pull quay.io/coreos/kube-state-metrics:\${KUBE_STATE_METRICS_VERSION};
      sudo docker pull quay.io/coreos/prometheus-config-reloader:\${CONFIGMAP_RELOADER_VERSION};
      sudo docker pull quay.io/coreos/configmap-reload:\${CONFIGMAP_RELOAD_VERSION};
      sudo docker pull quay.io/coreos/kube-rbac-proxy:\${KUBE_RBAC_PROXY_VERSION};
      sudo docker pull quay.io/coreos/k8s-prometheus-adapter-amd64:\${PROMETHEUS_ADAPTER_VERSION};
      sudo docker pull quay.io/prometheus/alertmanager:\${ALERTMANAGER_VERSION};
      `;
    }
    return `
      ${gitPullCommand}
      sudo docker tag quay.io/prometheus/prometheus:\${PROMETHEUS_VERSION} \${REGISTRY}/prometheus/prometheus:\${PROMETHEUS_VERSION};
      sudo docker tag quay.io/coreos/prometheus-operator:\${PROMETHEUS_OPERATOR_VERSION} \${REGISTRY}/coreos/prometheus-operator:\${PROMETHEUS_OPERATOR_VERSION};
      sudo docker tag quay.io/prometheus/node-exporter:\${NODE_EXPORTER_VERSION} \${REGISTRY}/prometheus/node-exporter:\${NODE_EXPORTER_VERSION};
      sudo docker tag grafana/grafana:\${GRAFANA_VERSION} \${REGISTRY}/grafana:\${GRAFANA_VERSION};
      sudo docker tag quay.io/coreos/kube-state-metrics:\${KUBE_STATE_METRICS_VERSION} \${REGISTRY}/coreos/kube-state-metrics:\${KUBE_STATE_METRICS_VERSION};
      sudo docker tag quay.io/coreos/prometheus-config-reloader:\${CONFIGMAP_RELOADER_VERSION} \${REGISTRY}/coreos/prometheus-config-reloader:\${CONFIGMAP_RELOADER_VERSION};
      sudo docker tag quay.io/coreos/configmap-reload:\${CONFIGMAP_RELOAD_VERSION} \${REGISTRY}/coreos/configmap-reload:\${CONFIGMAP_RELOAD_VERSION};
      sudo docker tag quay.io/coreos/kube-rbac-proxy:\${KUBE_RBAC_PROXY_VERSION} \${REGISTRY}/coreos/kube-rbac-proxy:\${KUBE_RBAC_PROXY_VERSION};
      sudo docker tag quay.io/coreos/k8s-prometheus-adapter-amd64:\${PROMETHEUS_ADAPTER_VERSION} \${REGISTRY}/coreos/k8s-prometheus-adapter-amd64:\${PROMETHEUS_ADAPTER_VERSION};
      sudo docker tag quay.io/prometheus/alertmanager:\${ALERTMANAGER_VERSION} \${REGISTRY}/prometheus/alertmanager:\${ALERTMANAGER_VERSION};

      sudo docker push \${REGISTRY}/prometheus/prometheus:\${PROMETHEUS_VERSION};
      sudo docker push \${REGISTRY}/coreos/prometheus-operator:\${PROMETHEUS_OPERATOR_VERSION};
      sudo docker push \${REGISTRY}/prometheus/node-exporter:\${NODE_EXPORTER_VERSION};
      sudo docker push \${REGISTRY}/grafana:\${GRAFANA_VERSION};
      sudo docker push \${REGISTRY}/coreos/kube-state-metrics:\${KUBE_STATE_METRICS_VERSION};
      sudo docker push \${REGISTRY}/coreos/prometheus-config-reloader:\${CONFIGMAP_RELOADER_VERSION};
      sudo docker push \${REGISTRY}/coreos/configmap-reload:\${CONFIGMAP_RELOAD_VERSION};
      sudo docker push \${REGISTRY}/coreos/kube-rbac-proxy:\${KUBE_RBAC_PROXY_VERSION};
      sudo docker push \${REGISTRY}/coreos/k8s-prometheus-adapter-amd64:\${PROMETHEUS_ADAPTER_VERSION};
      sudo docker push \${REGISTRY}/prometheus/alertmanager:\${ALERTMANAGER_VERSION};
      #rm -rf $PROMETHEUS_HOME;
      `;
  }
}
