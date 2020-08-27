/* eslint-disable no-underscore-dangle */
import Env from '../../class/Env';

export default abstract class Installer {
  private _env: Env;

  private _product: string;

  /**
   * Getter product
   * @return {string}
   */
  public get product(): string {
    return this._product;
  }

  /**
   * Setter product
   * @param {string} value
   */
  public set product(value: string) {
    this._product = value;
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

  public abstract install(param?: object): void;

  public abstract remove(param?: object): void;

  protected abstract _downloadImageFile(): void;

  protected abstract _sendImageFile(): void;

  protected abstract _pushImageFileToRegistry(param?: object): void;
}
