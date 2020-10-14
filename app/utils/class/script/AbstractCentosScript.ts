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
    curl -L https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 -o /usr/local/bin/jq;
    chmod a+x /usr/local/bin/jq;
    jq -V;
    `;
  }
}
