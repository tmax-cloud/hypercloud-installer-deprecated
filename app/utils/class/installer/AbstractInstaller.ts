/* eslint-disable no-underscore-dangle */
import Env from '../Env';

export default abstract class AbstractInstaller {
  // installer 공통

  private _env!: Env;

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

  // installer 필수 구현
  public abstract async install(param?: any): Promise<any>;

  public abstract async remove(param?: any): Promise<any>;

  protected abstract async _preWorkInstall(param?: any): Promise<any>;

  protected abstract async _downloadImageFile(param?: any): Promise<any>;

  protected abstract async _sendImageFile(param?: any): Promise<any>;

  protected abstract async _registryWork(param?: any): Promise<any>;

  protected abstract _getImagePushScript(param?: any): string;
}
