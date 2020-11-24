/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import * as scp from '../../common/scp';
import AbstractInstaller from './AbstractInstaller';
import Env, { NETWORK_TYPE } from '../Env';

export default class TektonMailNotifierInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR = `mail-install`;

  public static readonly INSTALL_HOME = `${Env.INSTALL_ROOT}/${TektonMailNotifierInstaller.IMAGE_DIR}`;

  public static readonly IMAGE_HOME = `${Env.INSTALL_ROOT}/${TektonMailNotifierInstaller.IMAGE_DIR}`;

  // TODO: version 처리 안됨
  public static readonly VERSION = `0.0.4`;

  // singleton
  private static instance: TektonMailNotifierInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!TektonMailNotifierInstaller.instance) {
      TektonMailNotifierInstaller.instance = new TektonMailNotifierInstaller();
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
    console.debug(
      '@@@@@@ Start installing mail-notifier main Master... @@@@@@'
    );
    const { mainMaster } = this.env.getNodesSortedByRole();

    // Step 1. SMTP 서버 설정
    mainMaster.cmd = this._step1();
    await mainMaster.exeCmd(callback);

    // Step 2. Server 설치
    mainMaster.cmd = this._step2();
    await mainMaster.exeCmd(callback);

    console.debug(
      '###### Finish installing mail-notifier main Master... ######'
    );
  }

  private _step1() {
    // FIXME: SMTP_SERVER, SMTP_USER, SMTP_PW 입력 받아야 함
    const smtpServer = 'test.com';
    const smtpUser = 'test';
    const smtpPw = '1234';

    if (this.env.registry) {
      return `
      cd ~/${TektonMailNotifierInstaller.INSTALL_HOME};
      SMTP_SERVER=${smtpServer}
      SMTP_USER=${smtpUser}
      SMTP_PW=${smtpPw}
      NAMESPACE=approval-system

      cp secret.yaml.template secret.yaml
      sed -i "s/<SMTP Address (IP:PORT)>/'\${SMTP_SERVER}'/g" secret.yaml
      sed -i "s/<SMTP User ID>/'\${SMTP_USER}'/g" secret.yaml
      sed -i "s/<SMTP User PW>/'\${SMTP_PW}'/g" secret.yaml
      kubectl apply --namespace \${NAMESPACE} -f secret.yaml
      `;
    }
    return `
    cd ~/${TektonMailNotifierInstaller.INSTALL_HOME};
    SMTP_SERVER=${smtpServer}
    SMTP_USER=${smtpUser}
    SMTP_PW=${smtpPw}
    NAMESPACE=approval-system

    curl https://raw.githubusercontent.com/cqbqdd11519/mail-notifier/master/deploy/secret.yaml.template -s | \\
    sed "s/<SMTP Address (IP:PORT)>/'\${SMTP_SERVER}'/g" | \\
    sed "s/<SMTP User ID>/'\${SMTP_USER}'/g" | \\
    sed "s/<SMTP User PW>/'\${SMTP_PW}'/g" | \\
    kubectl apply --namespace \${NAMESPACE} -f -
    `;
  }

  private _step2() {
    if (this.env.registry) {
      return `
      cd ~/${TektonMailNotifierInstaller.INSTALL_HOME};
      NAMESPACE=approval-system
      kubectl apply --namespace \${NAMESPACE} -f service.yaml
      kubectl apply --namespace \${NAMESPACE} -f updated.yaml
      `;
    }
    return `
    cd ~/${TektonMailNotifierInstaller.INSTALL_HOME};
    NAMESPACE=approval-system
    kubectl apply --namespace \${NAMESPACE} --filename https://raw.githubusercontent.com/cqbqdd11519/mail-notifier/master/deploy/service.yaml
    kubectl apply --namespace \${NAMESPACE} --filename https://raw.githubusercontent.com/cqbqdd11519/mail-notifier/master/deploy/server.yaml
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
      cd ~/${TektonMailNotifierInstaller.INSTALL_HOME};
      NAMESPACE=approval-system
      kubectl delete --namespace \${NAMESPACE} -f updated.yaml;
      kubectl delete --namespace \${NAMESPACE} -f service.yaml;
      `;
    }
    return `
    cd ~/${TektonMailNotifierInstaller.INSTALL_HOME};
    NAMESPACE=approval-system
    kubectl delete --namespace \${NAMESPACE} --filename https://raw.githubusercontent.com/cqbqdd11519/mail-notifier/master/deploy/server.yaml;
    kubectl delete --namespace \${NAMESPACE} --filename https://raw.githubusercontent.com/cqbqdd11519/mail-notifier/master/deploy/service.yaml;
    `;
  }

  private async _downloadYaml() {
    console.debug('@@@@@@ Start download yaml file from external... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = `
    mkdir -p ~/${TektonMailNotifierInstaller.INSTALL_HOME};
    cd ~/${TektonMailNotifierInstaller.INSTALL_HOME};
    wget https://raw.githubusercontent.com/cqbqdd11519/mail-notifier/master/deploy/service.yaml;
    wget https://raw.githubusercontent.com/cqbqdd11519/mail-notifier/master/deploy/server.yaml;
    wget https://raw.githubusercontent.com/cqbqdd11519/mail-notifier/master/deploy/secret.yaml.template;
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
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${TektonMailNotifierInstaller.IMAGE_DIR}/`;
    await scp.sendFile(
      mainMaster,
      srcPath,
      `${TektonMailNotifierInstaller.IMAGE_HOME}/`
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
    mkdir -p ~/${TektonMailNotifierInstaller.IMAGE_HOME};
    export HOME=~/${TektonMailNotifierInstaller.IMAGE_HOME};
    export VERSION=v${TektonMailNotifierInstaller.VERSION};
    export REGISTRY=${this.env.registry};
    cd $HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      docker load < mail-sender-server-v0.0.4.tar;
      docker load < mail-sender-client-v0.0.4.tar;
      `;
    } else {
      gitPullCommand += `
      docker pull tmaxcloudck/mail-sender-server:v0.0.4;
      docker pull tmaxcloudck/mail-sender-client:v0.0.4;

      docker tag tmaxcloudck/mail-sender-server:v0.0.4 mail-sender-server:v0.0.4;
      docker tag tmaxcloudck/mail-sender-client:v0.0.4 mail-sender-client:v0.0.4;

      #docker save mail-sender-server:v0.0.4 > mail-sender-server-v0.0.4.tar;
      #docker save mail-sender-client:v0.0.4 > mail-sender-client-v0.0.4.tar;
      `;
    }
    return `
      ${gitPullCommand}
      docker tag mail-sender-server:v0.0.4 $REGISTRY/mail-sender-server:v0.0.4;
      docker tag mail-sender-client:v0.0.4 $REGISTRY/mail-sender-client:v0.0.4;

      docker push $REGISTRY/mail-sender-server:v0.0.4
      docker push $REGISTRY/mail-sender-client:v0.0.4
      #rm -rf $HOME;
      `;
  }

  private _getImagePathEditScript(): string {
    // git guide에 내용 보기 쉽게 변경해놓음 (공백 유지해야함)
    return `
    cd ~/${TektonMailNotifierInstaller.INSTALL_HOME};
    export REGISTRY=${this.env.registry};
    cp server.yaml updated.yaml
    sed -i "s/tmaxcloudck\\/mail-sender-server:v0.0.3/$REGISTRY\\/mail-sender-server:v0.0.3/g" updated.yaml
    `;
  }
}
