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
import Node from '../Node';
import ScriptRookCephFactory from '../script/ScriptRookCephFactory';

export default class RookCephInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR=`rook-install`;

  public static readonly INSTALL_HOME=`${Env.INSTALL_ROOT}/hypercloud-install-guide/rook-ceph`;

  public static readonly IMAGE_HOME=`${Env.INSTALL_ROOT}/${RookCephInstaller.IMAGE_DIR}`;

  public static readonly CEPH_VERSION=`14.2.9`;

  public static readonly ROOK_VERSION=`1.3.6`;
  // public static readonly ROOK_VERSION=`1.3.9`;

  public static readonly CEPHCSI_VERSION=`2.1.2`;

  public static readonly NODE_DRIVER_VERSION=`1.2.0`;

  public static readonly RESIZER_VERSION=`0.4.0`;

  public static readonly PROVISIONER_VERSION=`1.4.0`;

  public static readonly SNAPSHOTTER_VERSION=`1.2.2`;

  public static readonly ATTACHER_VERSION=`2.1.0`;

  // singleton
  private static instance: RookCephInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!RookCephInstaller.instance) {
      RookCephInstaller.instance = new RookCephInstaller();
    }
    return this.instance;
  }

  public async install(param: { isCdi: boolean; callback: any; setProgress: Function; }) {
    const { isCdi, callback, setProgress } = param;

    // 각 노드 디스크 초기화
    await Promise.all(
      this.env.nodeList.map((node: Node) => {
        node.cmd = this._getRookCephRemoveConfigScript();
        return node.exeCmd();
      })
    );

    setProgress(10);
    await this._preWorkInstall({
      isCdi,
      callback
    });
    setProgress(60);
    await this._installMainMaster(isCdi, callback);
    setProgress(100);
  }

  public async remove() {
    await this._removeMainMaster();
  }

  private async _installMainMaster(isCdi: boolean, callback: any) {
    console.debug('@@@@@@ Start installing main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getInstallScript({
      isCdi
    });
    await mainMaster.exeCmd(callback);

    await this._EditYamlScript();

    mainMaster.cmd = `
     cd ~/${RookCephInstaller.INSTALL_HOME};
     ./hcsctl install ./install;
    `;
    await mainMaster.exeCmd(callback);

    console.debug('###### Finish installing main Master... ######');
  }

  private async _removeMainMaster() {
    console.debug('@@@@@@ Start remove rook-ceph... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getRemoveScript();
    await mainMaster.exeCmd();
    await Promise.all(
      this.env.nodeList.map((node: Node) => {
        node.cmd = this._getRookCephRemoveConfigScript();
        return node.exeCmd();
      })
    );
    console.debug('###### Finish remove rook-ceph... ######');
  }

  private _getInstallScript(param: { isCdi: boolean }): string {
    // TODO:cdi도 설치 할 경우 먼저 설치하는 로직 추가
    const { isCdi } = param;
    let script = `cd ~/${RookCephInstaller.INSTALL_HOME};chmod 755 hcsctl;`;
    if (isCdi) {
      script += `./hcsctl create-inventory install --include-cdi;`;
    } else {
      script += `./hcsctl create-inventory install;`;
    }

    script += `
    cd install;
    sed -i 's/{ceph_version}/'v${RookCephInstaller.CEPH_VERSION}'/g'  ./rook/*.yaml;
    sed -i 's/{cephcsi_version}/'v${RookCephInstaller.CEPHCSI_VERSION}'/g'  ./rook/*.yaml;
    sed -i 's/{node_driver_version}/'v${RookCephInstaller.NODE_DRIVER_VERSION}'/g' ./rook/*.yaml;
    sed -i 's/{resizer_version}/'v${RookCephInstaller.RESIZER_VERSION}'/g'  ./rook/*.yaml;
    sed -i 's/{provisioner_version}/'v${RookCephInstaller.PROVISIONER_VERSION}'/g' ./rook/*.yaml;
    sed -i 's/{snapshotter_version}/'v${RookCephInstaller.SNAPSHOTTER_VERSION}'/g' ./rook/*.yaml;
    sed -i 's/{attacher_version}/'v${RookCephInstaller.ATTACHER_VERSION}'/g'  ./rook/*.yaml;
    sed -i 's/{rook_version}/'v${RookCephInstaller.ROOK_VERSION}'/g'  ./rook/*.yaml;
    `;

    if (this.env.registry) {
      script += `sed -i 's/{registry_endpoint}/'${this.env.registry}'/g'  ./rook/*.yaml;`;
      if (isCdi) {
        script += `sed -i 's/{registry_endpoint}/'${this.env.registry}'/g' ./cdi/*.yaml;`;
      }
    } else {
      script += `
      sed -i 's|{registry_endpoint}/ceph/ceph|ceph/ceph|g'  ./rook/*.yaml;
      sed -i 's|{registry_endpoint}/rook/ceph|rook/ceph|g'  ./rook/*.yaml;
      sed -i 's|{registry_endpoint}|quay.io|g'  ./rook/*.yaml;
      `;
      if (isCdi) {
        script += `sed -i 's|{registry_endpoint}/kubevirt|kubevirt|g' ./cdi/*.yaml;`;
      }
    }

    return script;
  }

  private _getRemoveScript(): string {
    return `
    cd ~/${RookCephInstaller.INSTALL_HOME};
    ./hcsctl uninstall ./install;
    `;
  }

  private async _setNtp(callback: any) {
    console.debug('@@@@@@ Start setting ntp... @@@@@@');
    const { mainMaster, masterArr, workerArr } = this.env.getNodesSortedByRole();

    // 기존 서버 목록 주석 처리
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      // main master를 ntp 서버로
      // main master를 제외한 노드를 ntp client로 설정하기 위함
      let script = ScriptRookCephFactory.createScript(mainMaster.os.type)
      mainMaster.cmd = script.installNtp();
      mainMaster.cmd += this._setNtpServer(mainMaster.os.type);
      await mainMaster.exeCmd(callback);
      workerArr.concat(masterArr);
      await Promise.all(
        workerArr.map(worker => {
          script = ScriptRookCephFactory.createScript(worker.os.type)
          worker.cmd = script.installNtp();
          worker.cmd += this._setNtpClient(
            mainMaster.ip,
          );
          return worker.exeCmd(callback);
        })
      );
    } else if (this.env.networkType === NETWORK_TYPE.EXTERNAL) {
      // 한국 공용 타임서버 목록 설정
      await Promise.all(
        this.env.nodeList.map((node: Node) => {
          const script = ScriptRookCephFactory.createScript(node.os.type)
          node.cmd = script.installNtp();
          node.cmd += this._setPublicNtp();
          return node.exeCmd(callback);
        })
      );
    }
    console.debug('###### Finish setting ntp... ######');
  }

  private async _installGdisk(callback: any) {
    console.debug('@@@@@@ Start installing gdisk... @@@@@@');
    await Promise.all(
      this.env.nodeList.map((node: Node) => {
        const script = ScriptRookCephFactory.createScript(node.os.type)
        node.cmd = script.installGdisk();
        return node.exeCmd(callback);
      })
    );
    console.debug('###### Finish installing gdisk... ######');
  }

  private _getRookCephRemoveConfigScript(): string{
    // TODO: disk 이름 받아오는 것으로 변경해야함
    const diskName = 'sdb';
    return `
    sudo rm -rf /var/lib/rook;
    sudo sgdisk --zap-all /dev/${diskName};
    sudo ls /dev/mapper/ceph-* | sudo xargs -I% -- dmsetup remove %;
    sudo rm -rf /dev/ceph-*;
    sudo dd if=/dev/zero of="/dev/${diskName}" bs=1M count=100 oflag=direct,dsync;
    sudo blkdiscard /dev/${diskName};
    `;
  }

  private async _EditYamlScript() {
    /**
     * 각 노드마다 OSD를 배포하도록 권장 (Taint 걸린 host 없는 걸 확인해야함)
      총 OSD 개수는 3개 이상으로 권장
      CephFS 및 RBD pool 설정 시 Replication 개수 3개 권장
     */
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = `cat ~/${RookCephInstaller.INSTALL_HOME}/install/rook/cluster.yaml;`;
    let clusterYaml;
    await mainMaster.exeCmd({
      close: () => {},
      stdout: (data: string) => {
        clusterYaml = YAML.parse(data.toString());
      },
      stderr: () => {},
    });
    // 리소스 최소값 설정
    // clusterYaml.spec.resources = {
    //   osd: {
    //     limits:{
    //       cpu:"1",
    //       memory: "2048Mi"
    //     },
    //     requests:{
    //       cpu:"1",
    //       memory: "2048Mi"
    //     }
    //   },
    //   mon: {
    //     limits:{
    //       cpu:"0.5",
    //       memory: "1024Mi"
    //     },
    //     requests:{
    //       cpu:"0.5",
    //       memory: "1024Mi"
    //     }
    //   },
    //   mgr: {
    //     limits:{
    //       cpu:"0.5",
    //       memory: "512Mi"
    //     },
    //     requests:{
    //       cpu:"0.5",
    //       memory: "512Mi"
    //     }
    //   }
    // };
    clusterYaml.spec.storage.useAllNodes = true;
    clusterYaml.spec.storage.useAllDevices = true;

    // TODO:
    // 환경에 osd 설치가 가능한 디스크 개수 알아 내야 함
    // 현재 임의 값으로 설정
    const osdCnt = 1;

    mainMaster.cmd = '';
    if (osdCnt < 3) {
      // osd 3개 이상 보장 못 할 경우
      mainMaster.cmd += `
      echo "kind: ConfigMap
apiVersion: v1
metadata:
  name: rook-config-override
  namespace: rook-ceph
data:
  config: |
    [global]
    osd_pool_default_size = 1
---" > ~/${RookCephInstaller.INSTALL_HOME}/install/rook/cluster.yaml;`;
      mainMaster.cmd += `echo "${YAML.stringify(clusterYaml)}" >> ~/${RookCephInstaller.INSTALL_HOME}/install/rook/cluster.yaml;`
    } else {
      // osd 3개 이상 보장
      mainMaster.cmd += `echo "${YAML.stringify(clusterYaml)}" > ~/${RookCephInstaller.INSTALL_HOME}/install/rook/cluster.yaml;`
    }

    await mainMaster.exeCmd();

    // TODO:
    // file_system.yaml에
    // preferredDuringSchedulingIgnoredDuringExecution 가 중복되어 2개가 있어서 파서에서 에러남
    // 임시로 sed 명령어로 바꾸는 것으로 해결
    if (osdCnt < 3) {
      // osd 3개 이상 보장 못 할 경우
      mainMaster.cmd = `
      sed -i 's/requireSafeReplicaSize: true/requireSafeReplicaSize: false/g' ~/${RookCephInstaller.INSTALL_HOME}/install/rook/block_pool.yaml;
      sed -i 's/size: 3/size: 1/g' ~/${RookCephInstaller.INSTALL_HOME}/install/rook/block_pool.yaml;

      sed -i 's/requireSafeReplicaSize: true/requireSafeReplicaSize: false/g' ~/${RookCephInstaller.INSTALL_HOME}/install/rook/file_system.yaml;
      sed -i 's/size: 3/size: 1/g' ~/${RookCephInstaller.INSTALL_HOME}/install/rook/file_system.yaml;
      `;
    }

    // 리소스 최소값 설정
    mainMaster.cmd += `
    #sed -i 's/#  limits:/  limits:/g' ~/${RookCephInstaller.INSTALL_HOME}/install/rook/file_system.yaml;
    #sed -i 's/#  requests:/  requests:/g' ~/${RookCephInstaller.INSTALL_HOME}/install/rook/file_system.yaml;
    #sed -i 's/#    cpu: "4"/    cpu: "2"/g' ~/${RookCephInstaller.INSTALL_HOME}/install/rook/file_system.yaml;
    #sed -i 's/#    memory: "4096Mi"/    memory: "2048Mi"/g' ~/${RookCephInstaller.INSTALL_HOME}/install/rook/file_system.yaml;
    `;
    await mainMaster.exeCmd();
  }

  private _startNtp(): string {
    return `
    systemctl start ntpd;
    systemctl enable ntpd;
    ntpq -p;
    `;
  }

  private _setNtpClient(mainMasterIp: string): string {
    return `
    echo -e "server ${mainMasterIp}" > /etc/ntp.conf;
    ${this._startNtp()}
    `;
  }

  private _setNtpServer(osType:  string): string {
    return `
    interfaceName=\`ip -o -4 route show to default | awk '{print $5}'\`;
    inet=\`ip -f inet addr show \${interfaceName} | awk '/inet /{ print $2}'\`;
    network=\`ipcalc -n \${inet} | cut -d"=" -f2\`;
    netmask=\`ipcalc -m \${inet} | cut -d"=" -f2\`;
    echo -e "restrict \${network} mask \${netmask} nomodify notrap\nserver 127.127.1.0 # local clock" > /etc/ntp.conf;
    ${this._startNtp()}
    `;
  }

  private _setPublicNtp(): string {
    return `
    echo -e "server 1.kr.pool.ntp.org\nserver 0.asia.pool.ntp.org\nserver 2.asia.pool.ntp.org" > /etc/ntp.conf;
    ${this._startNtp()}
    `;
  }

  // protected abstract 구현
  protected async _preWorkInstall(param: { isCdi?: boolean; callback: any; }) {
    console.debug('@@@@@@ Start pre-installation... @@@@@@');
    const { isCdi, callback } = param;
    await this._setNtp(callback);
    await this._installGdisk(callback);
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

    // TODO: CDI
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
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${RookCephInstaller.IMAGE_DIR}/`;
    await scp.sendFile(mainMaster, srcPath, `${RookCephInstaller.IMAGE_HOME}/`);
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
    mkdir -p ~/${RookCephInstaller.IMAGE_HOME};
    export ROOK_HOME=~/${RookCephInstaller.IMAGE_HOME};
    export CEPH_VERSION=v${RookCephInstaller.CEPH_VERSION};
    export ROOK_VERSION=v${RookCephInstaller.ROOK_VERSION};
    export CEPHCSI_VERSION=v${RookCephInstaller.CEPHCSI_VERSION};
    export NODE_DRIVER_VERSION=v${RookCephInstaller.NODE_DRIVER_VERSION};
    export RESIZER_VERSION=v${RookCephInstaller.RESIZER_VERSION};
    export PROVISIONER_VERSION=v${RookCephInstaller.PROVISIONER_VERSION};
    export SNAPSHOTTER_VERSION=v${RookCephInstaller.SNAPSHOTTER_VERSION};
    export ATTACHER_VERSION=v${RookCephInstaller.ATTACHER_VERSION};
    export REGISTRY=${this.env.registry};
    cd $ROOK_HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      sudo docker load < ceph_\${CEPH_VERSION}.tar;
      sudo docker load < rook-ceph_\${ROOK_VERSION}.tar;
      sudo docker load < cephcsi_\${CEPHCSI_VERSION}.tar;
      sudo docker load < csi-node-driver-registrar_\${NODE_DRIVER_VERSION}.tar;
      sudo docker load < csi-resizer_\${RESIZER_VERSION}.tar;
      sudo docker load < csi-provisioner_\${PROVISIONER_VERSION}.tar;
      sudo docker load < csi-snapshotter_\${SNAPSHOTTER_VERSION}.tar;
      sudo docker load < csi-attacher_\${ATTACHER_VERSION}.tar;
      `;
    } else {
      gitPullCommand += `
      sudo docker pull ceph/ceph:\${CEPH_VERSION};
      sudo docker pull rook/ceph:\${ROOK_VERSION};
      sudo docker pull quay.io/cephcsi/cephcsi:\${CEPHCSI_VERSION};
      sudo docker pull quay.io/k8scsi/csi-node-driver-registrar:\${NODE_DRIVER_VERSION};
      sudo docker pull quay.io/k8scsi/csi-resizer:\${RESIZER_VERSION};
      sudo docker pull quay.io/k8scsi/csi-provisioner:\${PROVISIONER_VERSION};
      sudo docker pull quay.io/k8scsi/csi-snapshotter:\${SNAPSHOTTER_VERSION};
      sudo docker pull quay.io/k8scsi/csi-attacher:\${ATTACHER_VERSION};
      `;
    }
    return `
      ${gitPullCommand}
      sudo docker tag ceph/ceph:\${CEPH_VERSION} \${REGISTRY}/ceph/ceph:\${CEPH_VERSION};
      sudo docker tag rook/ceph:\${ROOK_VERSION} \${REGISTRY}/rook/ceph:\${ROOK_VERSION};
      sudo docker tag quay.io/cephcsi/cephcsi:\${CEPHCSI_VERSION} \${REGISTRY}/cephcsi/cephcsi:\${CEPHCSI_VERSION};
      sudo docker tag quay.io/k8scsi/csi-node-driver-registrar:\${NODE_DRIVER_VERSION} \${REGISTRY}/k8scsi/csi-node-driver-registrar:\${NODE_DRIVER_VERSION};
      sudo docker tag quay.io/k8scsi/csi-resizer:\${RESIZER_VERSION} \${REGISTRY}/k8scsi/csi-resizer:\${RESIZER_VERSION};
      sudo docker tag quay.io/k8scsi/csi-provisioner:\${PROVISIONER_VERSION} \${REGISTRY}/k8scsi/csi-provisioner:\${PROVISIONER_VERSION};
      sudo docker tag quay.io/k8scsi/csi-snapshotter:\${SNAPSHOTTER_VERSION} \${REGISTRY}/k8scsi/csi-snapshotter:\${SNAPSHOTTER_VERSION};
      sudo docker tag quay.io/k8scsi/csi-attacher:\${ATTACHER_VERSION} \${REGISTRY}/k8scsi/csi-attacher:\${ATTACHER_VERSION};

      sudo docker push \${REGISTRY}/ceph/ceph:\${CEPH_VERSION};
      sudo docker push \${REGISTRY}/rook/ceph:\${ROOK_VERSION};
      sudo docker push \${REGISTRY}/cephcsi/cephcsi:\${CEPHCSI_VERSION};
      sudo docker push \${REGISTRY}/k8scsi/csi-node-driver-registrar:\${NODE_DRIVER_VERSION};
      sudo docker push \${REGISTRY}/k8scsi/csi-resizer:\${RESIZER_VERSION};
      sudo docker push \${REGISTRY}/k8scsi/csi-provisioner:\${PROVISIONER_VERSION};
      sudo docker push \${REGISTRY}/k8scsi/csi-snapshotter:\${SNAPSHOTTER_VERSION};
      sudo docker push \${REGISTRY}/k8scsi/csi-attacher:\${ATTACHER_VERSION};
      #rm -rf $ROOK_HOME;
      `;
  }
}
