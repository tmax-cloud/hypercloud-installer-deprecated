import { AbstractOs, OS_TYPE } from './AbstractOs';

export default class CentOS extends AbstractOs {
  constructor() {
    super(OS_TYPE.CENTOS);
  }
}
