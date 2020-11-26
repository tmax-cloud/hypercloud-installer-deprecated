/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import * as scp from '../../common/scp';
import AbstractInstaller from './AbstractInstaller';
import Env, { NETWORK_TYPE } from '../Env';

export default class TektonCiCdTemplatesInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR = `cicd-install`;

  public static readonly INSTALL_HOME = `${Env.INSTALL_ROOT}/${TektonCiCdTemplatesInstaller.IMAGE_DIR}`;

  public static readonly IMAGE_HOME = `${Env.INSTALL_ROOT}/${TektonCiCdTemplatesInstaller.IMAGE_DIR}`;

  public static readonly VERSION = `1.1.5`;

  // singleton
  private static instance: TektonCiCdTemplatesInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!TektonCiCdTemplatesInstaller.instance) {
      TektonCiCdTemplatesInstaller.instance = new TektonCiCdTemplatesInstaller();
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
    console.debug('@@@@@@ Start installing ci/cd main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();

    // Step 1. 필수 Task 설치
    mainMaster.cmd = this._step1();
    await mainMaster.exeCmd(callback);

    // Step 2. CI/CD 템플릿 설치
    mainMaster.cmd = this._step2();
    await mainMaster.exeCmd(callback);

    console.debug('###### Finish installing ci/cd main Master... ######');
  }

  private _step1() {
    if (this.env.registry) {
      return `
      cd ~/${TektonCiCdTemplatesInstaller.INSTALL_HOME};
      kubectl apply -f task-s2i.yaml
      kubectl apply -f task-git-clone.yaml
      kubectl apply -f task-deploy.yaml
      `;
    }
    return `
    cd ~/${TektonCiCdTemplatesInstaller.INSTALL_HOME};
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/common-task/task-s2i.yaml
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/common-task/task-git-clone.yaml
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/common-task/task-deploy.yaml
    `;
  }

  private _step2() {
    if (this.env.registry) {
      return `
      cd ~/${TektonCiCdTemplatesInstaller.INSTALL_HOME};
      kubectl apply -f apache-template.yaml
      kubectl apply -f django-template.yaml
      kubectl apply -f nodejs-template.yaml
      kubectl apply -f tomcat-template.yaml
      kubectl apply -f wildfly-template.yaml
      `;
    }
    return `
    cd ~/${TektonCiCdTemplatesInstaller.INSTALL_HOME};
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/apache/apache-template.yaml
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/django/django-template.yaml
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/nodejs/nodejs-template.yaml
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/tomcat/tomcat-template.yaml
    kubectl apply -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/wildfly/wildfly-template.yaml
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
    // 설치의 역순으로 실행
    if (this.env.registry) {
      return `
      cd ~/${TektonCiCdTemplatesInstaller.INSTALL_HOME};
      kubectl delete -f wildfly-template.yaml
      kubectl delete -f tomcat-template.yaml
      kubectl delete -f nodejs-template.yaml
      kubectl delete -f django-template.yaml
      kubectl delete -f apache-template.yaml

      kubectl delete -f task-deploy.yaml
      kubectl delete -f task-git-clone.yaml
      kubectl delete -f task-s2i.yaml
      `;
    }
    return `
    cd ~/${TektonCiCdTemplatesInstaller.INSTALL_HOME};
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/wildfly/wildfly-template.yaml
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/tomcat/tomcat-template.yaml
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/nodejs/nodejs-template.yaml
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/django/django-template.yaml
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/apache/apache-template.yaml


    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/common-task/task-deploy.yaml
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/common-task/task-git-clone.yaml
    kubectl delete -f https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/common-task/task-s2i.yaml
    `;
  }

  private async _downloadYaml() {
    console.debug('@@@@@@ Start download yaml file from external... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = `
    mkdir -p ~/${TektonCiCdTemplatesInstaller.INSTALL_HOME};
    cd ~/${TektonCiCdTemplatesInstaller.INSTALL_HOME};
    wget https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/common-task/task-s2i.yaml
    wget https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/common-task/task-git-clone.yaml
    wget https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/common-task/task-deploy.yaml
    wget https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/apache/apache-template.yaml
    wget https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/django/django-template.yaml
    wget https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/nodejs/nodejs-template.yaml
    wget https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/tomcat/tomcat-template.yaml
    wget https://raw.githubusercontent.com/tmax-cloud/hypercloud-operator/master/_catalog_museum/was/wildfly/wildfly-template.yaml
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
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${TektonCiCdTemplatesInstaller.IMAGE_DIR}/`;
    await scp.sendFile(
      mainMaster,
      srcPath,
      `${TektonCiCdTemplatesInstaller.IMAGE_HOME}/`
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
    mainMaster.cmd += this._getImagePathEditScript();
    await mainMaster.exeCmd(callback);
    console.debug(
      '###### Finish pushing the image at main master node... ######'
    );
  }

  protected _getImagePushScript(): string {
    let gitPullCommand = `
    mkdir -p ~/${TektonCiCdTemplatesInstaller.IMAGE_HOME};
    export HOME=~/${TektonCiCdTemplatesInstaller.IMAGE_HOME};
    export VERSION=v${TektonCiCdTemplatesInstaller.VERSION};
    export REGISTRY=${this.env.registry};
    cd $HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      docker load < cicd-util_1.1.4.tar
      docker load < klar_v2.4.0.tar
      docker load < s2i_nightly.tar
      docker load < buildah_latest.tar
      docker load < s2i-apache_2.4.tar
      docker load < s2i-django_35.tar
      docker load < s2i-nodejs_12.tar
      docker load < s2i-tomcat_latest.tar
      docker load < s2i-wildfly_latest.tar
      `;
    } else {
      gitPullCommand += `
      docker pull tmaxcloudck/cicd-util:1.1.4;
      docker pull tmaxcloudck/klar:v2.4.0;
      docker pull quay.io/openshift-pipeline/s2i:nightly;
      docker pull quay.io/buildah/stable:latest;
      docker pull tmaxcloudck/s2i-apache:2.4;
      docker pull tmaxcloudck/s2i-django:35;
      docker pull tmaxcloudck/s2i-nodejs:12;
      docker pull tmaxcloudck/s2i-tomcat:latest;
      docker pull tmaxcloudck/s2i-wildfly:latest;

      docker tag tmaxcloudck/cicd-util:1.1.4 cicd-util:1.1.4
      docker tag tmaxcloudck/klar:v2.4.0 klar:v2.4.0
      docker tag quay.io/openshift-pipeline/s2i:nightly s2i:nightly
      docker tag quay.io/buildah/stable:latest buildah:latest
      docker tag tmaxcloudck/s2i-apache:2.4 s2i-apache:2.4
      docker tag tmaxcloudck/s2i-django:35 s2i-django:35
      docker tag tmaxcloudck/s2i-nodejs:12 s2i-nodejs:12
      docker tag tmaxcloudck/s2i-tomcat:latest s2i-tomcat:latest
      docker tag tmaxcloudck/s2i-wildfly:latest s2i-wildfly:latest

      #docker save cicd-util:1.1.4 > cicd-util_1.1.4.tar
      #docker save klar:v2.4.0 > klar_v2.4.0.tar
      #docker save s2i:nightly > s2i_nightly.tar
      #docker save buildah:latest > buildah_latest.tar
      #docker save s2i-apache:2.4 > s2i-apache_2.4.tar
      #docker save s2i-django:35 > s2i-django_35.tar
      #docker save s2i-nodejs:12 > s2i-nodejs_12.tar
      #docker save s2i-tomcat:latest > s2i-tomcat_latest.tar
      #docker save s2i-wildfly:latest > s2i-wildfly_latest.tar
      `;
    }
    return `
      ${gitPullCommand}
      docker tag cicd-util:1.1.4 $REGISTRY/cicd-util:1.1.4
      docker tag klar:v2.4.0 $REGISTRY/klar:v2.4.0
      docker tag s2i:nightly $REGISTRY/s2i:nightly
      docker tag buildah:latest $REGISTRY/buildah:latest
      docker tag s2i-apache:2.4 $REGISTRY/s2i-apache:2.4
      docker tag s2i-django:35 $REGISTRY/s2i-django:35
      docker tag s2i-nodejs:12 $REGISTRY/s2i-nodejs:12
      docker tag s2i-tomcat:latest $REGISTRY/s2i-tomcat:latest
      docker tag s2i-wildfly:latest $REGISTRY/s2i-wildfly:latest

      docker push $REGISTRY/cicd-util:1.1.4
      docker push $REGISTRY/klar:v2.4.0
      docker push $REGISTRY/s2i:nightly
      docker push $REGISTRY/buildah:latest
      docker push $REGISTRY/s2i-apache:2.4
      docker push $REGISTRY/s2i-django:35
      docker push $REGISTRY/s2i-nodejs:12
      docker push $REGISTRY/s2i-tomcat:latest
      docker push $REGISTRY/s2i-wildfly:latest
      #rm -rf $HOME;
      `;
  }

  private _getImagePathEditScript(): string {
    // git guide에 내용 보기 쉽게 변경해놓음 (공백 유지해야함)
    return `
    cd ~/${TektonCiCdTemplatesInstaller.INSTALL_HOME};
    export REGISTRY=${this.env.registry};
    sed -i "s/tmaxcloudck\\/cicd-util:.*/$REGISTRY\\/cicd-util:1.1.4/g" task-s2i.yaml
    sed -i "s/quay\\.io\\/openshift-pipeline\\/s2i:.*/$REGISTRY\\/s2i:nightly/g" task-s2i.yaml
    sed -i "s/quay\\.io\\/buildah\\/stable/$REGISTRY\\/buildah:latest/g" task-s2i.yaml
    sed -i "s/tmaxcloudck\\/cicd-util:.*/$REGISTRY\\/cicd-util:1.1.4/g" task-deploy.yaml
    sed -i "s/gcr\\.io\\/tekton-releases\\/github\\.com\\/tektoncd\\/pipeline\\/cmd\\/git-init:.*/$REGISTRY\\/git-init:v0.12.1/g" task-git-clone.yaml

    sed -i "s/tmaxcloudck\\/s2i-apache:.*/$REGISTRY\\/s2i-apache:2.4/g" apache-template.yaml
    sed -i "s/tmaxcloudck\\/s2i-django:.*/$REGISTRY\\/s2i-django:35/g" django-template.yaml
    sed -i "s/tmaxcloudck\\/s2i-nodejs:.*/$REGISTRY\\/s2i-nodejs:12/g" nodejs-template.yaml
    sed -i "s/tmaxcloudck\\/s2i-tomcat:.*/$REGISTRY\\/s2i-tomcat:8.5/g" tomcat-template.yaml
    sed -i "s/tmaxcloudck\\/s2i-wildfly:.*/$REGISTRY\\/s2i-wildfly:18/g" wildfly-template.yaml
    `;
  }
}
