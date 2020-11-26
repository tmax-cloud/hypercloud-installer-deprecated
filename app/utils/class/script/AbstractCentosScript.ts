/* eslint-disable class-methods-use-this */
import Env from '../Env';
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
    sudo yum install -y wget;

    # jq
    sudo curl -L https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 -o /usr/local/bin/jq;
    sudo chmod a+x /usr/local/bin/jq;
    jq -V;

    # sshpass
    sudo yum install -y http://mirror.centos.org/centos/7/extras/x86_64/Packages/sshpass-1.06-2.el7.x86_64.rpm;
    `;
  }
}
