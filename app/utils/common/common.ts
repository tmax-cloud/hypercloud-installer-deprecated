/* eslint-disable eqeqeq */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */

import Node from '../class/Node';

/**
 * @description 랜덤 문자열 생성 함수
 */
export function getRandomString() {
  return Math.random()
    .toString(36)
    .substr(2, 11);
}

export async function waitApiServerUntilNomal(mainMaster: Node) {
  return new Promise(resolve => {
    let count = 0;
    const timerid = setInterval(async () => {
      mainMaster.cmd = `
      kubectl get node;
      echo $?;
      `;
      count += 1;
      if (count > 10) {
        clearInterval(timerid);
        resolve();
      } else {
        await mainMaster.exeCmd({
          close: () => {},
          stdout: (data: any) => {
            if (data == 0) {
              clearInterval(timerid);
              resolve();
            }
          },
          stderr: () => {}
        });
      }
      console.log(count);
    }, 5000);
  });
}
