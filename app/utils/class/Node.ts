/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-underscore-dangle */
import { AbstractOs, OS_TYPE } from './os/AbstractOs';
import * as ssh from '../common/ssh';
import CentOS from './os/CentOS';
import Ubuntu from './os/Ubuntu';

export enum ROLE {
  MAIN_MASTER = 100,
  MASTER = 0,
  WORKER = 1
}

export default class Node {
  private _ip: string;

  private _port: number;

  private _user: string;

  private _password: string;

  private _os: AbstractOs;

  private _role: ROLE;

  private _hostName: string;

  private _cmd?: string | undefined;

  constructor(
    ip: string,
    port: number,
    user: string,
    password: string,
    os: any,
    role: ROLE,
    hostName: string
  ) {
    this._ip = ip;
    this._port = port;
    this._user = user;
    this._password = password;
    if (os.type === OS_TYPE.CENTOS || os.type === OS_TYPE.PROLINUX) {
      this._os = new CentOS();
    } else {
      this._os = new Ubuntu();
    }
    this._role = role;
    this._hostName = hostName;
  }

  public async exeCmd(callback?: any) {
    const promise = await ssh.send(this, callback);
    // FIXME:cmd 초기화 하지 않으면 env.json에 저장됨...
    this.cmd = '';
    return promise;
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
   * @return {ROLE}
   */
  public get role(): ROLE {
    return this._role;
  }

  /**
   * Getter os
   * @return {OS}
   */
  public get os(): AbstractOs {
    return this._os;
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
   * @param {ROLE} value
   */
  public set role(value: ROLE) {
    this._role = value;
  }

  /**
   * Setter os
   * @param {OS} value
   */
  public set os(value: AbstractOs) {
    this._os = value;
  }

  /**
   * Setter hostName
   * @param {string} value
   */
  public set hostName(value: string) {
    this._hostName = value;
  }
}
