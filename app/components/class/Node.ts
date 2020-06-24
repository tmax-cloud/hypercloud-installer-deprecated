/* eslint-disable no-dupe-class-members */
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */

/* eslint-disable no-underscore-dangle */
export enum State {
  INIT = 0,
  WAIT = 1,
  SUCCESS = 2,
  FAIL = 3
}

export enum Role {
  MASTER = 0,
  WORKER = 1
}

export default class Node {
  private _ip: string;

  private _port: number;

  private _user: string;

  private _password: string;

  private _cmd: string;

  private _state: State;

  private _role: Role;

  constructor(
    ip: string,
    port: number,
    user: string,
    password: string,
    cmd: string,
    state: State,
    role: Role
  ) {
    this._ip = ip;
    this._port = port;
    this._user = user;
    this._password = password;
    this._cmd = cmd;
    this._state = state;
    this._role = role;
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
  public get cmd(): string {
    return this._cmd;
  }

  /**
   * Getter state
   * @return {State}
   */
  public get state(): State {
    return this._state;
  }

  /**
   * Getter role
   * @return {Role}
   */
  public get role(): Role {
    return this._role;
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
  public set cmd(value: string) {
    this._cmd = value;
  }

  /**
   * Setter state
   * @param {State} value
   */
  public set state(value: State) {
    this._state = value;
  }

  /**
   * Setter role
   * @param {Role} value
   */
  public set role(value: Role) {
    this._role = value;
  }
}
