import ScriptFactory from './ScriptFactory';
import { OS_TYPE } from '../os/AbstractOs';
import CentosMetalLbScript from './CentosMetalLbScript';

export default class ScriptMatalLbFactory extends ScriptFactory {
  public static createScript(osType: string) {
    if (osType === OS_TYPE.CENTOS) {
      return new CentosMetalLbScript();
    }
    if (osType === OS_TYPE.UBUNTU) {
      // TODO:
    }

    throw new Error();
  }
}
