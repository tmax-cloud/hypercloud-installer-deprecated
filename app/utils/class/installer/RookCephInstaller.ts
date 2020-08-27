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
import Node from '../Node';

export default class RookCephInstaller extends Installer {
  static readonly INSTALL_HOME=`~/hypercloud-install-guide/rook-ceph`;

  static readonly IMAGE_HOME=`~/rook-install`;

  static readonly CEPH_VERSION=`v14.2.9`;

  static readonly ROOK_VERSION=`v1.3.6`;

  static readonly CEPHCSI_VERSION=`v2.1.2`;

  static readonly NODE_DRIVER_VERSION=`v1.2.0`;

  static readonly RESIZER_VERSION=`v0.4.0`;

  static readonly PROVISIONER_VERSION=`v1.4.0`;

  static readonly SNAPSHOTTER_VERSION=`v1.2.2`;

  static readonly ATTACHER_VERSION=`v2.1.0`;

  // singleton
  private static instance: RookCephInstaller;

  private constructor() {
    super();
    RookCephInstaller.instance = this;
  }

  static get getInstance() {
    if (!RookCephInstaller.instance) {
      RookCephInstaller.instance = new RookCephInstaller();
    }
    return this.instance;
  }

  public async install(param: object) {
    const { isCdi, callback, setProgress } = param;

    await this._preWorkInstall(isCdi, callback);
    setProgress(60);
    await this._installMainMaster(isCdi, callback);
    setProgress(100);
  }

  public async remove(param: object) {
    const { isCdi, callback, setProgress } = param;

    await this._removeMainMaster(isCdi);
  }

  private async _installMainMaster(isCdi: boolean, callback: any) {
    console.error('###### Start installing main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = mainMaster.os.cloneGitFile(CONST.GIT_REPO);
    mainMaster.cmd += script.getRookCephInstallScript(isCdi, this.env.registry);
    await mainMaster.exeCmd(callback);

    // mainMaster.cmd = `cat ~/hypercloud-install-guide/rook-ceph/install/rook/cluster.yaml`
    // await mainMaster.exeCmd({
    //   close: () => {},
    //   stdout: (data: string) => {
    //     console.error(data.toString());
    //   },
    //   stderr: () => {},
    // });

    console.error('###### Finish installing main Master... ######');
  }

  private async _removeMainMaster(isCdi: boolean) {
    console.error('###### Start remove rook-ceph... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = mainMaster.os.cloneGitFile(CONST.GIT_REPO);
    mainMaster.cmd += script.getRookCephRemoveScript();
    await mainMaster.exeCmd();
    await Promise.all(
      this.env.nodeList.map((node: Node) => {
        node.cmd = script.getRookCephRemoveConfigScript();
        return node.exeCmd();
      })
    );
    console.error('###### Finish remove rook-ceph... ######');
  }

  private async _preWorkInstall(
    isCdi: boolean,
    callback?: any
  ) {
    console.error('###### Start pre-installation... ######');
    await this._setNtp(callback);
    await this._installGdisk(callback);
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

    if (this.env.registry) {
      // 내부 image registry 구축 경우 해주어야 할 작업들
      /**
       * 설치 이미지 push
       */
      await this._pushImageFileToRegistry({
        registry: this.env.registry,
        callback
      });
    }

    // TODO: CDI
    console.error('###### Finish pre-installation... ######');
  }

  private async _setNtp(callback: any) {
    console.error('###### Start setting ntp... ######');
    const { mainMaster, masterArr, workerArr } = this.env.getNodesSortedByRole();

    // 기존 서버 목록 주석 처리
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      // main master를 ntp 서버로
      // main master를 제외한 노드를 ntp client로 설정하기 위함
      mainMaster.cmd = mainMaster.os.installNtp();
      mainMaster.cmd += script.setNtpServer();
      await mainMaster.exeCmd(callback);
      workerArr.concat(masterArr);
      await Promise.all(
        workerArr.map(worker => {
          worker.cmd = worker.os.installNtp();
          worker.cmd += script.setNtpClient(
            mainMaster.ip,
          );
          return worker.exeCmd(callback);
        })
      );
    } else if (this.env.networkType === NETWORK_TYPE.EXTERNAL) {
      // 한국 공용 타임서버 목록 설정
      await Promise.all(
        this.env.nodeList.map((node: Node) => {
          node.cmd = node.os.installNtp();
          node.cmd = script.setPublicNtp();
          return node.exeCmd(callback);
        })
      );
    }
    //
    console.error('###### Finish setting ntp... ######');
  }

  private async _installGdisk(callback: any) {
    console.error('###### Start installing gdisk... ######');
    await Promise.all(
      this.env.nodeList.map((node: Node) => {
        node.cmd = node.os.installGdisk();
        return node.exeCmd(callback);
      })
    );
    console.error('###### Finish installing gdisk... ######');
  }

  protected async _downloadImageFile() {
    // TODO: download image file
    console.error('###### Start downloading the image file to client local... ######');
    console.error('###### Finish downloading the image file to client local... ######');
  }

  protected async _sendImageFile() {
    console.error('###### Start sending the image file to main master node... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    const srcPath = `${rootPath}/rook-install/`;
    await scp.sendFile(mainMaster, srcPath, `rook-install/`);
    console.error('###### Finish sending the image file to main master node... ######');
  }

  protected async _pushImageFileToRegistry(param: object) {
    console.error('###### Start pushing the image at main master node... ######');
    const { registry, callback } = param;
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = script.getRookCephImagePushScript(
      registry,
      this.env.networkType
    );
    await mainMaster.exeCmd(callback);
    console.error('###### Finish pushing the image at main master node... ######');
  }
}
