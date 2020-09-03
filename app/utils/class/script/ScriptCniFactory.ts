import ScriptFactory from './ScriptFactory';
import { OS_TYPE } from '../os/AbstractOs';
import CentosCniScript from './CentosCniScript';

export default class ScriptCniFactory extends ScriptFactory {
  public static createScript(osType: string) {
    if (osType === OS_TYPE.CENTOS) {
      return new CentosCniScript();
    }

    throw new Error();
  }
}
