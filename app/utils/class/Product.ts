/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-underscore-dangle */
import { rootPath } from 'electron-root-path';
import Node, { ROLE } from './Node';
import * as scp from '../common/scp';
import * as script from '../common/script';
import * as ssh from '../common/ssh';
import * as product from '../common/product';
import * as git from '../common/git';

export default class Product {
  private _name: string;

  constructor(
    name: string
  ) {
    this._name = name;
  }
}
