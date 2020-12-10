import ScriptFactory from './ScriptFactory';
import { OS_TYPE } from '../os/AbstractOs';
import CentosPrometheusScript from './CentosPrometheusScript';

export default class ScriptPrometheusFactory extends ScriptFactory {
  public static createScript(osType: string) {
    if (osType === OS_TYPE.CENTOS) {
      return new CentosPrometheusScript();
    }
    if (osType === OS_TYPE.UBUNTU) {
      // TODO:
    }

    throw new Error();
  }
}
