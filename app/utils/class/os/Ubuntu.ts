import { AbstractOs, OS_TYPE } from './AbstractOs';

/* eslint-disable class-methods-use-this */
export default class Ubuntu extends AbstractOs {
  constructor() {
    super(OS_TYPE.UBUNTU);
  }
}
