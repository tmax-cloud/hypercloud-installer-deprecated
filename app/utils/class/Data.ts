/* eslint-disable no-underscore-dangle */
import Env from './Env';

export default class Data {
  private _envList: Env[];

  constructor(envList: Env[]) {
    this._envList = envList;
  }

  /**
   * Getter envList
   * @return {Env[]}
   */
  public get envList(): Env[] {
    return this._envList;
  }

  /**
   * Setter envList
   * @param {Env[]} value
   */
  public set envList(value: Env[]) {
    this._envList = value;
  }
}
