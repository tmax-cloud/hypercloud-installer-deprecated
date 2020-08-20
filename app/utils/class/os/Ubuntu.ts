import { OS, OS_TYPE } from '../../interface/os';

/* eslint-disable class-methods-use-this */
export default class Ubuntu implements OS {
  type: OS_TYPE = OS_TYPE.UBUNTU;
}
