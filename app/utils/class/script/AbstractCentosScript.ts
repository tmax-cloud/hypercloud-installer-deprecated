import Env from '../Env';
/* eslint-disable class-methods-use-this */
import AbstractScript from './AbstractScript';

export default class AbstractCentosScript extends AbstractScript {
  // Centos 공통
  cloneGitFile(repoPath: string, repoBranch = 'master') {
    return `
    yum install -y git;
    mkdir -p ~/${Env.INSTALL_ROOT};
    cd ~/${Env.INSTALL_ROOT};
    git clone -b ${repoBranch} ${repoPath};
    `;
  }

  installPackage() {
    return `
    # wget
    yum install -y wget;

    # jq
    sudo yum -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm;
    sudo yum install jq -y
    `;
  }
}
