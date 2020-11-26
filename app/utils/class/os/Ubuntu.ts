import { AbstractOs, OS_TYPE } from './AbstractOs';

export default class Ubuntu extends AbstractOs {
  constructor() {
    super(OS_TYPE.UBUNTU);
  }
}
