import ScriptFactory from './ScriptFactory';
import { OS_TYPE } from '../os/AbstractOs';
import CentosRookCephScript from './CentosRookCephScript';

export default class ScriptRookCephFactory extends ScriptFactory {
  public static createScript(osType: string) {
    if (osType === OS_TYPE.CENTOS) {
      return new CentosRookCephScript();
    }
    if (osType === OS_TYPE.UBUNTU) {
      // TODO:
    }

    throw new Error();
  }
}
