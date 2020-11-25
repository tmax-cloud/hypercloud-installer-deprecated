import simpleGit, { SimpleGit } from 'simple-git';

/**
 * @description git clone 해주는 함수
 *
 * @param repoPath clone하려는 git repo 주소
 * @param localPath 원하는 local path
 * @param option git clone 명령어 옵션 설정 가능
 *
 */
export async function clone(repoPath: string, localPath: string, option: any) {
  const git: SimpleGit = simpleGit();
  return git.clone(repoPath, localPath, option).catch(err => {
    console.error(err);
  });
}

export function test() {}
