/* eslint-disable array-callback-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable no-underscore-dangle */
import Installer from '../../interface/installer';
import * as script from '../../common/script';
import CONST from '../../constants/constant';

export default class CniInstaller extends Installer {
  // singleton
  private static instance: CniInstaller;

  private constructor() {
    super();
    CniInstaller.instance = this;
  }

  static get getInstance() {
    if (!CniInstaller.instance) {
      CniInstaller.instance = new CniInstaller();
    }
    return this.instance;
  }

  public async removeMainMaster(version: string, type: string) {
    console.error('###### Start remove main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = mainMaster.os.cloneGitFile(CONST.GIT_REPO);
    mainMaster.cmd += script.getCniRemoveScript(version);
    await mainMaster.exeCmd();
    console.error('###### Finish remove main Master... ######');
  }

  public async installMainMaster(version: string, callback: any) {
    console.error('###### Start installing main Master... ######');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = mainMaster.os.cloneGitFile(CONST.GIT_REPO);
    mainMaster.cmd += script.getCniInstallScript(
      version,
      this.env.registry
    );
    await mainMaster.exeCmd(callback);
    console.error('###### Finish installing main Master... ######');
  }
}
