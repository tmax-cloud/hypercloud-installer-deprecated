import Env from '../Env';
/* eslint-disable class-methods-use-this */
import AbstractScript from './AbstractScript';

export default class AbstractCentosScript extends AbstractScript {
  // Centos 공통
  cloneGitFile(repoPath: string, repoBranch = 'master') {
    return `
    ${this.installPackage('git')}
    mkdir -p ~/${Env.INSTALL_ROOT};
    cd ~/${Env.INSTALL_ROOT};
    git clone -b ${repoBranch} ${repoPath};
    `;
  }

  installPackage(target: string) {
    return `
    yum install -y ${target};
    `;
  }
}
