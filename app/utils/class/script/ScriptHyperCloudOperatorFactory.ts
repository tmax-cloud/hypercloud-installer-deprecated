import ScriptFactory from './ScriptFactory';
import { OS_TYPE } from '../os/AbstractOs';
import CentosHyperCloudOperatorScript from './CentosHyperCloudOperatorScript';

export default class ScriptHyperCloudOperatorFactory extends ScriptFactory {
  public static createScript(osType: string) {
    if (osType === OS_TYPE.CENTOS) {
      return new CentosHyperCloudOperatorScript();
    }

    throw new Error();
  }
}
