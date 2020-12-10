import ScriptFactory from './ScriptFactory';
import { OS_TYPE } from '../os/AbstractOs';
import CentosHyperCloudConsoleScript from './CentosHyperCloudConsoleScript';

export default class ScriptHyperCloudConsoleFactory extends ScriptFactory {
  public static createScript(osType: string) {
    if (osType === OS_TYPE.CENTOS) {
      return new CentosHyperCloudConsoleScript();
    }
    if (osType === OS_TYPE.UBUNTU) {
      // TODO:
    }

    throw new Error();
  }
}
