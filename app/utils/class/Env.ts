/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-underscore-dangle */
import { rootPath } from 'electron-root-path';
import Node, { ROLE } from './Node';
import * as scp from '../common/scp';
import * as script from '../common/script';
import * as ssh from '../common/ssh';
import * as product from '../common/product';
import * as git from '../common/git';

export enum NETWORK_TYPE {
  INTERNAL = 'internal',
  EXTERNAL = 'external'
}

export default class Env {
  public static TARGET_ARC_NAME = `archive_20.07.10`;

  private _name: string;

  private _networkType: string;

  private _registry: string;

  private _nodeList: Node[];

  private _productList: any;

  private _updatedTime: Date;

  constructor(
    name: string,
    networkType: string,
    registry: string,
    nodeList: any[],
    productList: any[],
    updatedTime: Date
  ) {
    this._name = name;
    this._networkType = networkType;
    this._registry = registry;
    this._nodeList = nodeList.map((node: any) => {
      return new Node(
        node._ip,
        node._port,
        node._user,
        node._password,
        node._os,
        node._role,
        node._hostName
      );
    });
    this._productList = productList;
    this._updatedTime = updatedTime;
  }

  // public async preWorkInstall(registry: string, version: string, callback: any) {
  //   if (this.networkType === NETWORK_TYPE.INTERNAL) {
  //     // 폐쇄망 경우 해주어야 할 작업들
  //     await this._downloadPackageFile();
  //     await this._sendPackageFile();
  //     await this._installLocalPackageRepository(callback);
  //     await this._downloadGitFile();
  //     await this._sendGitFile();
  //     await this._downloadKubernetesImageFile();
  //     await this._sendKubernetesImageFile();
  //   } else if (this.networkType === NETWORK_TYPE.EXTERNAL) {
  //     await this._setPublicPackageRepository(callback);
  //     await this._cloneGitFile(callback);
  //   }

  //   if (registry) {
  //     // image registry 구축
  //     await this._installImageRegistry(registry, callback);
  //     // push kubernetes image
  //     await this._kubernetesImagePush(registry, callback);
  //   }
  // }

  // private async _downloadPackageFile() {
  //   // TODO: download package file
  //   console.error('###### Start downloading the package file to client local... ######');
  //   console.error('###### Finish downloading the package file to client local... ######');
  // }

  // private async _sendPackageFile() {
  //   console.error('###### Start sending the package file to each node (using scp)... ######');
  //   const srcPath = `${rootPath}/${Env.TARGET_ARC_NAME}/`;
  //   const destPath = `${Env.TARGET_ARC_NAME}/`;
  //   console.debug(`srcPath`, srcPath);
  //   console.debug(`destPath`, destPath);
  //   await Promise.all(
  //     this.nodeList.map(node => {
  //       return scp.sendFile(node, srcPath, destPath);
  //     })
  //   );
  //   console.error('###### Finish sending the package file to each node (using scp)... ######');
  // }

  // private async _installLocalPackageRepository(callback: any) {
  //   console.error('###### Start installing the local package repository at each node... ######');
  //   const destPath = `${Env.TARGET_ARC_NAME}/`;
  //   await Promise.all(
  //     this.nodeList.map((node: Node) => {
  //       node.cmd = node.os.setPackageRepository(destPath);
  //       console.debug(node.cmd);
  //       return node.exeCmd(callback);
  //     })
  //   );
  //   console.error('###### Finish installing the local package repository at each node... ######');
  // }

  // private async _downloadGitFile() {
  //   console.error('###### Start downloading the GIT file to client local... ######');
  //   const repoPath = `https://github.com/tmax-cloud/hypercloud-install-guide.git`;
  //   const localPath = `${rootPath}/hypercloud-install-guide/`;
  //   console.debug(`repoPath`, repoPath);
  //   console.debug(`localPath`, localPath);
  //   await git.clone(repoPath, localPath);
  //   console.error('###### Finish downloading the GIT file to client local... ######');
  // }

  // private async _sendGitFile() {
  //   console.error('###### Start sending the GIT file to each node (using scp)... ######');
  //   const localPath = `${rootPath}/hypercloud-install-guide/`;
  //   await Promise.all(
  //     this.nodeList.map(node => {
  //       return scp.sendFile(node, localPath, `hypercloud-install-guide/`);
  //     })
  //   );
  //   console.error('###### Finish sending the GIT file to each node (using scp)... ######');
  // }

  // private async _downloadKubernetesImageFile() {
  //   // TODO: download kubernetes image file
  //   console.error('###### Start downloading the Kubernetes image file to client local... ######');
  //   console.error('###### Finish downloading the Kubernetes image file to client local... ######');
  // }

  // private async _sendKubernetesImageFile() {
  //   console.error('###### Start sending the Kubernetes image file to main master node... ######');
  //   const { mainMaster } = this.getNodesSortedByRole();
  //   const srcPath = `${rootPath}/kube_image/`;
  //   await scp.sendFile(mainMaster, srcPath, `k8s-install/`);
  //   console.error('###### Finish sending the Kubernetes image file to main master node... ######');
  // }

  // private async _setPublicPackageRepository(callback: any) {
  //   console.error('###### Start setting the public package repository at each node... ######');
  //   await Promise.all(
  //     this.nodeList.map((node: Node) => {
  //       node.cmd = node.os.setPublicPackageRepository();
  //       console.debug(node.cmd);
  //       return node.exeCmd(callback);
  //     })
  //   );
  //   console.error('###### Finish setting the public package repository at each node... ######');
  // }

  // private async _cloneGitFile(callback: any) {
  //   console.error('###### Start clone the GIT file at each node... ######');
  //   const repoPath = `https://github.com/tmax-cloud/hypercloud-install-guide.git`;
  //   await Promise.all(
  //     this.nodeList.map((node: Node) => {
  //       node.cmd = node.os.cloneGitFile(repoPath);
  //       console.debug(node.cmd);
  //       return node.exeCmd(callback);
  //     })
  //   );
  //   console.error('###### Finish clone the GIT file at each node... ######');
  // }

  // private async _installImageRegistry(registry: string, callback: any) {
  //   console.error('###### Start installing the image registry at main master node... ######');
  //   const { mainMaster } = this.getNodesSortedByRole();
  //   mainMaster.cmd = mainMaster.os.getImageRegistrySettingScript(
  //     registry,
  //     this.networkType
  //   );
  //   console.debug(mainMaster.cmd);
  //   await mainMaster.exeCmd(callback);
  //   console.error('###### Finish installing the image registry at main master node... ######');
  // }

  // private async _kubernetesImagePush(registry: string, callback: any) {
  //   console.error('###### Start pushing the Kubernetes image at main master node... ######');
  //   const { mainMaster } = this.getNodesSortedByRole();
  //   mainMaster.cmd = script.getKubernetesImagePushScript(
  //     registry,
  //     this.networkType
  //   );
  //   console.debug(mainMaster.cmd);
  //   await mainMaster.exeCmd(callback);
  //   console.error('###### Finish pushing the Kubernetes image at main master node... ######');
  // }

  // public async installMainMaster(registry: string, version: string, callback: any) {
  //   console.error('###### Start installing main Master... ######');
  //   const { mainMaster, masterArr } = this.getNodesSortedByRole();
  //   mainMaster.cmd = mainMaster.os.getInstallMainMasterScript(
  //     mainMaster,
  //     registry,
  //     version,
  //     masterArr.length > 0
  //   );
  //   console.debug(mainMaster.cmd);
  //   await mainMaster.exeCmd(callback);
  //   console.error('###### Finish installing main Master... ######');
  // }

  // public async installMaster(registry: string, version: string, callback: any) {
  //   console.error('###### Start installing Master... ######');
  //   const { mainMaster, masterArr } = this.getNodesSortedByRole();
  //   const masterJoinCmd = await this.getMasterJoinCmd(mainMaster);
  //   await Promise.all(
  //     masterArr.map((master, index) => {
  //       master.cmd = master.os.getInstallMasterScript(
  //         mainMaster,
  //         registry,
  //         version,
  //         master,
  //         99-index
  //       );
  //       master.cmd += `${masterJoinCmd.trim()} --cri-socket=/var/run/crio/crio.sock;`;
  //       console.debug(master.cmd);
  //       return master.exeCmd(callback);
  //     })
  //   );
  //   console.error('###### Finish installing Master... ######');
  // }

  // public async installWorker(registry: string, version: string, callback?: any) {
  //   console.error('###### Start installing Worker... ######');
  //   const { mainMaster, workerArr } = this.getNodesSortedByRole();
  //   const workerJoinCmd = await this.getWorkerJoinCmd(mainMaster);
  //   await Promise.all(
  //     workerArr.map(worker => {
  //       worker.cmd = worker.os.getInstallWorkerScript(
  //         mainMaster,
  //         registry,
  //         version,
  //         worker
  //       );
  //       worker.cmd += `${workerJoinCmd.trim()} --cri-socket=/var/run/crio/crio.sock;`;
  //       console.debug(worker.cmd);
  //       return worker.exeCmd(callback);
  //     })
  //   );
  //   console.error('###### Finish installing Worker... ######');
  // }

  // public async deleteWorker() {
  //   console.error('###### Start deleting Worker... ######');
  //   const { mainMaster, workerArr } = this.getNodesSortedByRole();
  //   let command = '';
  //   workerArr.map(worker => {
  //     command += script.getDeleteWorkerNodeScript(worker);
  //   });
  //   mainMaster.cmd = command;
  //   console.debug(mainMaster.cmd);
  //   await mainMaster.exeCmd();

  //   workerArr.map((worker) => {
  //     command = worker.os.getK8sMasterRemoveScript();
  //     worker.cmd = command;
  //     console.debug(worker.cmd);
  //     worker.exeCmd();
  //   });
  //   console.error('###### Finish deleting Worker... ######');
  // }

  // public async getWorkerJoinCmd(mainMaster: Node) {
  //   mainMaster.cmd = script.getK8sClusterWorkerJoinScript();
  //   let workerJoinCmd = '';
  //   await ssh.send(mainMaster, {
  //     close: () => {},
  //     stdout: (data: string) => {
  //       workerJoinCmd = data.toString().split('@@@')[1];
  //     },
  //     stderr: () => {}
  //   });

  //   return workerJoinCmd;
  // }

  // public async getMasterJoinCmd(mainMaster: Node) {
  //   mainMaster.cmd = script.getK8sClusterMasterJoinScript();
  //   let masterJoinCmd = '';
  //   await ssh.send(mainMaster, {
  //     close: () => {},
  //     stdout: (data: string) => {
  //       masterJoinCmd = data.toString().split('%%%')[1];
  //     },
  //     stderr: () => {}
  //   });

  //   return masterJoinCmd;
  // }

  public getNodesSortedByRole() {
    // mainMaster, master, worker로 분리
    let mainMaster: any = null;
    const masterArr: any[] = [];
    const workerArr: any[] = [];

    for (let i = 0; i < this.nodeList.length; i += 1) {
      if (this.nodeList[i].role === ROLE.MAIN_MASTER) {
        mainMaster = this.nodeList[i];
      } else if (this.nodeList[i].role === ROLE.MASTER) {
        masterArr.push(this.nodeList[i]);
      } else if (this.nodeList[i].role === ROLE.WORKER) {
        workerArr.push(this.nodeList[i]);
      }
    }

    return {
      mainMaster,
      masterArr,
      workerArr
    };
  }

  public isAllRequiredProductInstall() {
    const requiredProduct = product.getRequiredProduct();

    for (let i = 0; i < requiredProduct.length; i += 1) {
      const target = requiredProduct[i].NAME;
      let installed = false;
      for (let j = 0; j < this.productList.length; j += 1) {
        const target2 = this.productList[j].name;
        if (target === target2) {
          installed = true;
          break;
        }
      }
      if (!installed) {
        return false;
      }
    }
    return true;
  }

  public isInstalled(productName: string) {
    for (let i = 0; i < this.productList.length; i += 1) {
      const target = this.productList[i];
      if (target.name === productName) {
        // 설치 됨
        return target;
      }
    }
    // 설치 안됨
    return false;
  }

  public deleteAllProduct() {
    this.productList=[];
  }

  public deleteProductByName(productName: string) {
    for (let j = 0; j < this.productList.length; j += 1) {
      if (this.productList[j].name === productName) {
        this.productList.splice(j, 1);
        return;
      }
    }
  }

  public addProduct(productObj: any) {
    this.productList.push(productObj);
  }

  /**
   * Getter name
   * @return {string}
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Getter type
   * @return {string}
   */
  public get networkType(): string {
    return this._networkType;
  }

  /**
   * Getter registry
   * @return {string}
   */
  public get registry(): string {
    return this._registry;
  }

  /**
   * Getter nodeList
   * @return {Node[]}
   */
  public get nodeList(): Node[] {
    return this._nodeList;
  }

  /**
   * Getter productList
   * @return {any}
   */
  public get productList(): any {
    return this._productList;
  }

  /**
   * Getter updatedTime
   * @return {Date}
   */
  public get updatedTime(): Date {
    return this._updatedTime;
  }

  /**
   * Setter name
   * @param {string} value
   */
  public set name(value: string) {
    this._name = value;
  }

  /**
   * Setter type
   * @param {string} value
   */
  public set networkType(value: string) {
    this._networkType = value;
  }

  /**
   * Setter registry
   * @param {string} value
   */
  public set registry(value: string) {
    this._registry = value;
  }

  /**
   * Setter nodeList
   * @param {Node[]} value
   */
  public set nodeList(value: Node[]) {
    this._nodeList = value;
  }

  /**
   * Setter productList
   * @param {any} value
   */
  public set productList(value: any) {
    this._productList = value;
  }

  /**
   * Setter updatedTime
   * @param {Date} value
   */
  public set updatedTime(value: Date) {
    this._updatedTime = value;
  }
}
