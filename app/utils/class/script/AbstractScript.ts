export default abstract class AbstractScript {
  // TODO:모든 OS에서 사용 가능한 script

  // 해당 OS에서 구현해야 하는 script
  abstract cloneGitFile(repoPath: string, repoBranch: string): string;
}
