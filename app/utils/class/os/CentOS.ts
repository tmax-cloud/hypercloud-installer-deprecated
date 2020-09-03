import { AbstractOs, OS_TYPE } from './AbstractOs';

/* eslint-disable class-methods-use-this */
export default class CentOS extends AbstractOs {
  constructor() {
    super(OS_TYPE.CENTOS);
  }
}
