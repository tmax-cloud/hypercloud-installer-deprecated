/* eslint-disable class-methods-use-this */
import AbstractCentosScript from './AbstractCentosScript';
import { InterfaceRookCephInstall } from './InterfaceRookCephInstall';

export default class CentosRookCephScript extends AbstractCentosScript
  implements InterfaceRookCephInstall {
  installGdisk(): string {
    return `
    yum install -y gdisk;
    `;
  }
}
