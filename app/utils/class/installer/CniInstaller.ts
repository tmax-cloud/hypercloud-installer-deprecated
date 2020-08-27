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
import Installer from '../../interface/installer/installer';
import * as script from '../../common/script';
import CONST from '../../constants/constant';
import { NETWORK_TYPE } from '../Env';

export default class CniInstaller extends Installer {
  // singleton
  private static instance: CniInstaller;

  private constructor() {
    super();
    CniInstaller.instance = this;
  }

  static get getInstance() {
    if (!CniInstaller.instance) {
      CniInstaller.instance = new CniInstaller();
    }
    return this.instance;
  }

  public async install(param: object) {
    const { type, version, callback, setProgress } = param;

    await this._preWorkInstall(this.env.registry, version, callback);
    setProgress(60);
    await this._installMainMaster(type, version, callback);
    setProgress(100);
  }

  public async remove(param: object) {
    const { type, version } = param;

    await this._removeMainMaster(type, version);
  }

  private async _preWorkInstall(
    registry: string,
    version: string,
    callback?: any
  ) {
    console.error('###### Start pre-installation... ######');
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      // internal network 경우 해주어야 할 작업들
      /**
       * 1. 패키지 파일 다운(client 로컬), 전송(각 노드), 설치 (각 노드)
       * 2. git guide 다운(client 로컬), 전송(각 노드)
       * 3. 설치 이미지 파일 다운(client 로컬), 전송(각 노드)
       */
      await this._downloadImageFile();
      await this._sendImageFile();
    } else if (this.env.networkType === NETWORK_TYPE.EXTERNAL) {
      // external network 경우 해주어야 할 작업들
      /**
       * 1. public 패키지 레포 등록 (각 노드)
       * 2. git guide clone (각 노드)
       */
    }

    if (registry) {
      // 내부 image registry 구축 경우 해주어야 할 작업들
      /**
       * 설치 이미지 push
       */
      await this._pushImageFileToRegistry({
        registry: this.env.registry,
        callback
      });
    }
    console.error('###### Finish pre-installation... ######');
  }

  private async _installMainMaster(type: string, version: string, callback: any) {
    console.error('###### Start installing main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = mainMaster.os.cloneGitFile(CONST.GIT_REPO);
    mainMaster.cmd += script.getCniInstallScript(
      version,
      this.env.registry,
      this.env.networkType
    );
    await mainMaster.exeCmd(callback);
    console.error('###### Finish installing main Master... ######');
  }

  private async _removeMainMaster(type: string, version: string) {
    console.error('###### Start remove main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = mainMaster.os.cloneGitFile(CONST.GIT_REPO);
    mainMaster.cmd += script.getCniRemoveScript(version);
    await mainMaster.exeCmd();
    console.error('###### Finish remove main Master... ######');
  }

  protected async _downloadImageFile() {
    // TODO: download kubernetes image file
    console.error('###### Start downloading the image file to client local... ######');
    console.error('###### Finish downloading the image file to client local... ######');
  }

  protected async _sendImageFile() {
    console.error('###### Start sending the image file to main master node... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const srcPath = `${rootPath}/cni-install/`;
    await scp.sendFile(mainMaster, srcPath, `cni-install/`);
    console.error('###### Finish sending the image file to main master node... ######');
  }

  protected async _pushImageFileToRegistry(param: object) {
    console.error('###### Start pushing the image at main master node... ######');
    const { registry, callback } = param;
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = script.getCniImagePushScript(
      registry,
      this.env.networkType
    );
    await mainMaster.exeCmd(callback);
    console.error('###### Finish pushing the image at main master node... ######');
  }
}
