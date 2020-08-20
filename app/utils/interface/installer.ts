/* eslint-disable no-underscore-dangle */
import Env from '../class/Env';

export default class Installer {
  private _env: Env;

  constructor(env: Env) {
    this._env = env;
  }

  /**
   * Getter env
   * @return {Env}
   */
  public get env(): Env {
    return this._env;
  }

  /**
   * Setter env
   * @param {Env} value
   */
  public set env(value: Env) {
    this._env = value;
  }
}
