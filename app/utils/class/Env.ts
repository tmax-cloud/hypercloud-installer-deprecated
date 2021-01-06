/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-underscore-dangle */
import { rootPath } from 'electron-root-path';
import Node, { ROLE } from './Node';
import * as product from '../common/product';

export enum NETWORK_TYPE {
  INTERNAL = 'internal',
  EXTERNAL = 'external'
}

export default class Env {
  public static INSTALL_ROOT = `hypercloud_install`;

  public static LOCAL_INSTALL_ROOT = `${rootPath}/${Env.INSTALL_ROOT}`;

  // public static TARGET_ARC_NAME = `archive_20.07.10`;

  private _name: string;

  private _virtualIp: string;

  private _networkType: string;

  private _registry: string;

  private _nodeList: Node[];

  private _productList: any;

  private _updatedTime: Date;

  constructor(
    name: string,
    virtualIp: string,
    networkType: string,
    registry: string,
    nodeList: any[],
    productList: any[],
    updatedTime: Date
  ) {
    this._name = name;
    this._virtualIp = virtualIp;
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

  public getProductByName(name: string) {
    for (let i = 0; i < this.productList.length; i += 1) {
      if (this.productList[i].name === name) {
        return this.productList[i];
      }
    }
    return null;
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
    this.productList = [];
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
   * Getter virtualIp
   * @return {string}
   */
  public get virtualIp(): string {
    return this._virtualIp;
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
   * Setter virtualIp
   * @param {string} value
   */
  public set virtualIp(value: string) {
    this._virtualIp = value;
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
