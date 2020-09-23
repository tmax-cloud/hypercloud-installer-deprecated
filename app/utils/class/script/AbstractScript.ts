export default abstract class AbstractScript {
  // 해당 OS에서 구현해야 하는 script
  abstract cloneGitFile(repoPath: string, repoBranch: string): string;

  abstract installPackage(): string;
}
