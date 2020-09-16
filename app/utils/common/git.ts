/* eslint-disable no-console */
/* eslint-disable global-require */
import simpleGit, { SimpleGit } from 'simple-git';

export async function clone(repoPath: string, localPath: string, option: any) {
  const git: SimpleGit = simpleGit();
  return git.clone(repoPath, localPath, option).catch(err => {
    console.error(err);
  });
}

export function test() {}
