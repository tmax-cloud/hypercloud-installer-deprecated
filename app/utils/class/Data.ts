/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-underscore-dangle */

import Env from './Env';

export default class Data {
  private _envList: Env[];

  constructor(nodeList: Env[]) {
    this._envList = nodeList;
  }

  /**
   * Getter nodeList
   * @return {Env[]}
   */
  public get nodeList(): Env[] {
    return this._envList;
  }

  /**
   * Setter nodeList
   * @param {Env[]} value
   */
  public set nodeList(value: Env[]) {
    this._envList = value;
  }
}
