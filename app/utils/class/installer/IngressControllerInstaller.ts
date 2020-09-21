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
import Env, { NETWORK_TYPE } from '../Env';
import ScriptCniFactory from '../script/ScriptCniFactory';
import KubernetesInstaller from './KubernetesInstaller';
import AbstractScript from '../script/AbstractScript';

export default class IngressControllerInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR=`install-ingress-nginx`;

  public static readonly INSTALL_HOME=`${Env.INSTALL_ROOT}/hypercloud-install-guide/IngressNginx`;

  public static readonly IMAGE_HOME=`${Env.INSTALL_ROOT}/${IngressControllerInstaller.IMAGE_DIR}`;

  public static readonly INGRESS_NGINX_NAME=`ingress-nginx-shared`;

  public static readonly INGRESS_CLASS=`nginx-shd`;

  public static readonly NGINX_INGRESS_VERSION=`0.33.0`;

  public static readonly KUBE_WEBHOOK_CERTGEN_VERSION=`1.2.2`;

  // singleton
  private static instance: IngressControllerInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!IngressControllerInstaller.instance) {
      IngressControllerInstaller.instance = new IngressControllerInstaller();
    }
    return this.instance;
  }

  public async install(param: { callback: any; setProgress: Function; }) {
    const { callback, setProgress } = param;

    await this._preWorkInstall({
      callback
    });
    await this._installMainMaster(callback);
  }

  public async remove() {
    await this._removeMainMaster();
  }

  private async _installMainMaster(callback: any) {
    console.error('@@@@@@ Start installing main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();

    // Step0. deploy yaml 수정
    mainMaster.cmd = this._step0();
    await mainMaster.exeCmd(callback);

    // Step 1. Nginx Ingress Controller 배포
    mainMaster.cmd = this._step1();
    await mainMaster.exeCmd(callback);
    console.error('###### Finish installing main Master... ######');
  }

  private _step0() {
    // ingress-nginx 문자열 같은경우 여러번 설치하면 중복해서 sed로 치환되므로
    // 치환 되기 전에 원래대로 만들고 치환함.
    let script = `
    ${this._exportEnv()}
    cd ~/${IngressControllerInstaller.INSTALL_HOME}/yaml/;

    sed -i 's/'\${INGRESS_NGINX_NAME}'/ingress-nginx/g' deploy.yaml;
    sed -i 's/--ingress-class='\${INGRESS_CLASS}'/--ingress-class=nginx/g' deploy.yaml;
    sed -i 's/ingress-controller-leader-'\${INGRESS_CLASS}'/ingress-controller-leader-nginx/g' deploy.yaml;
    sed -i 's/'\${NGINX_INGRESS_VERSION}'/{nginx_ingress_version}/g' deploy.yaml;
    sed -i 's/'\${KUBE_WEBHOOK_CERTGEN_VERSION}'/{kube_webhook_certgen_version}/g' deploy.yaml;

    sed -i 's/ingress-nginx/'\${INGRESS_NGINX_NAME}'/g' deploy.yaml;
    sed -i 's/--ingress-class=nginx/--ingress-class='\${INGRESS_CLASS}'/g' deploy.yaml;
    sed -i 's/ingress-controller-leader-nginx/ingress-controller-leader-'\${INGRESS_CLASS}'/g' deploy.yaml;
    sed -i 's/{nginx_ingress_version}/'\${NGINX_INGRESS_VERSION}'/g' deploy.yaml;
    sed -i 's/{kube_webhook_certgen_version}/'\${KUBE_WEBHOOK_CERTGEN_VERSION}'/g' deploy.yaml;
    `;

    if (this.env.registry) {
      script += `
      sed -i 's/quay.io\\/kubernetes-ingress-controller\\/nginx-ingress-controller/'\${REGISTRY}'\\/kubernetes-ingress-controller\\/nginx-ingress-controller/g' deploy.yaml
      sed -i 's/docker.io\\/jettech\\/kube-webhook-certgen/'\${REGISTRY}'\\/jettech\\/kube-webhook-certgen/g' deploy.yaml
      `;
    }
    return script;
  }

  private _step1() {
    return `
    cd ~/${IngressControllerInstaller.INSTALL_HOME}/yaml/;
    kubectl apply -f deploy.yaml;
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
    cd ~/${IngressControllerInstaller.INSTALL_HOME}/yaml/;
    kubectl delete -f deploy.yaml;
    `;
  }

  // protected abstract 구현
  protected async _preWorkInstall(param: { callback: any; }) {
    console.error('@@@@@@ Start pre-installation... @@@@@@');
    const { callback } = param;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      // internal network 경우 해주어야 할 작업들
      /**
       * 1. 해당 이미지 파일 다운(client 로컬), 전송 (main 마스터 노드)
       */
      await this._downloadImageFile();
      await this._sendImageFile();
    } else if (this.env.networkType === NETWORK_TYPE.EXTERNAL) {
      // external network 경우 해주어야 할 작업들
      /**
       * 1. public 패키지 레포 등록 (각 노드) (필요 시)
       */
    }

    if (this.env.registry) {
      // 내부 image registry 구축 경우 해주어야 할 작업들
      /**
       * 1. 레지스트리 관련 작업
       */
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
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${IngressControllerInstaller.IMAGE_DIR}/`;
    await scp.sendFile(mainMaster, srcPath, `${IngressControllerInstaller.IMAGE_HOME}/`);
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
    mkdir -p ~/${IngressControllerInstaller.IMAGE_HOME};
    ${this._exportEnv()}
    cd $NGINX_INGRESS_HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      sudo docker load < ingress-nginx_\${NGINX_INGRESS_VERSION}.tar;
      sudo docker load < kube-webhook-certgen_\${KUBE_WEBHOOK_CERTGEN_VERSION}.tar;
      `;
    } else {
      gitPullCommand += `
      sudo docker pull quay.io/kubernetes-ingress-controller/nginx-ingress-controller:\${NGINX_INGRESS_VERSION};
      sudo docker pull jettech/kube-webhook-certgen:\${KUBE_WEBHOOK_CERTGEN_VERSION};
      `;
    }
    return `
      ${gitPullCommand}
      sudo docker tag quay.io/kubernetes-ingress-controller/nginx-ingress-controller:\${NGINX_INGRESS_VERSION} \${REGISTRY}/kubernetes-ingress-controller/nginx-ingress-controller:\${NGINX_INGRESS_VERSION};
      sudo docker tag jettech/kube-webhook-certgen:\${KUBE_WEBHOOK_CERTGEN_VERSION} \${REGISTRY}/jettech/kube-webhook-certgen:\${KUBE_WEBHOOK_CERTGEN_VERSION};

      sudo docker push \${REGISTRY}/kubernetes-ingress-controller/nginx-ingress-controller:\${NGINX_INGRESS_VERSION}
      sudo docker push \${REGISTRY}/jettech/kube-webhook-certgen:\${KUBE_WEBHOOK_CERTGEN_VERSION}
      #rm -rf $NGINX_INGRESS_HOME;
      `;
  }

  private _exportEnv() {
    return `
    export NGINX_INGRESS_HOME=~/${IngressControllerInstaller.IMAGE_HOME};
    export INGRESS_NGINX_NAME=${IngressControllerInstaller.INGRESS_NGINX_NAME};
    export INGRESS_CLASS=${IngressControllerInstaller.INGRESS_CLASS};
    export NGINX_INGRESS_VERSION=${IngressControllerInstaller.NGINX_INGRESS_VERSION};
    export KUBE_WEBHOOK_CERTGEN_VERSION=v${IngressControllerInstaller.KUBE_WEBHOOK_CERTGEN_VERSION};
    export REGISTRY=${this.env.registry};
    `
  }
}
