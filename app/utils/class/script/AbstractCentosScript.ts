/* eslint-disable class-methods-use-this */
import AbstractScript from './AbstractScript';

export default class AbstractCentosScript extends AbstractScript {
  // Centos
  cloneGitFile(repoPath: string, repoBranch = 'master') {
    return `
    cd ~;
    yum install -y git;
    git clone -b ${repoBranch} ${repoPath};
    `;
  }
}
