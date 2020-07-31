/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-underscore-dangle */
export enum Role {
  MAIN_MASTER = 100,
  MASTER = 0,
  WORKER = 1
}

export default class Node {
  private _ip: string;

  private _port: number;

  private _user: string;

  private _password: string;

  private _role: Role;

  private _hostName: string;

  private _cmd?: string | undefined;

  constructor(
    ip: string,
    port: number,
    user: string,
    password: string,
    role: Role,
    hostName: string
  ) {
    this._ip = ip;
    this._port = port;
    this._user = user;
    this._password = password;
    this._role = role;
    this._hostName = hostName;
  }

  /**
   * Getter ip
   * @return {string}
   */
  public get ip(): string {
    return this._ip;
  }

  /**
   * Getter port
   * @return {number}
   */
  public get port(): number {
    return this._port;
  }

  /**
   * Getter user
   * @return {string}
   */
  public get user(): string {
    return this._user;
  }

  /**
   * Getter password
   * @return {string}
   */
  public get password(): string {
    return this._password;
  }

  /**
   * Getter cmd
   * @return {string}
   */
  public get cmd(): string | undefined {
    return this._cmd;
  }

  /**
   * Getter role
   * @return {Role}
   */
  public get role(): Role {
    return this._role;
  }

  /**
   * Getter hostName
   * @return {string}
   */
  public get hostName(): string {
    return this._hostName;
  }

  /**
   * Setter ip
   * @param {string} value
   */
  public set ip(value: string) {
    this._ip = value;
  }

  /**
   * Setter port
   * @param {number} value
   */
  public set port(value: number) {
    this._port = value;
  }

  /**
   * Setter user
   * @param {string} value
   */
  public set user(value: string) {
    this._user = value;
  }

  /**
   * Setter password
   * @param {string} value
   */
  public set password(value: string) {
    this._password = value;
  }

  /**
   * Setter cmd
   * @param {string} value
   */
  public set cmd(value: string | undefined) {
    this._cmd = value;
  }

  /**
   * Setter role
   * @param {Role} value
   */
  public set role(value: Role) {
    this._role = value;
  }

  /**
   * Setter role
   * @param {string} value
   */
  public set hostName(value: string) {
    this._hostName = value;
  }
}
