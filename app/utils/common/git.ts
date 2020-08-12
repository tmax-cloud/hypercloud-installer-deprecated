/* eslint-disable no-console */
/* eslint-disable global-require */
import simpleGit, { SimpleGit } from 'simple-git';

export async function clone(repoPath: string, localPath: string) {
  const git: SimpleGit = simpleGit();
  return git.clone(repoPath, localPath).catch(err => {
    console.error(err);
  });
}

export function test() {}
