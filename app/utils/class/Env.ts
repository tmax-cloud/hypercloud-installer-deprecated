/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-underscore-dangle */
import Node from './Node';

export enum Type {
  INTERNAL = 'internal',
  EXTERNAL = 'external'
}

export default class Env {
  private _name: string;

  private _type: string;

  private _nodeList: Node[];

  private _productList: any;

  private _updatedTime: Date;

  constructor(
    name: string,
    type: string,
    nodeList: Node[],
    productList: any,
    updatedTime: Date
  ) {
    this._name = name;
    this._type = type;
    this._nodeList = nodeList;
    this._productList = productList;
    this._updatedTime = updatedTime;
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
  public get type(): string {
    return this._type;
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
  public set type(value: string) {
    this._type = value;
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
