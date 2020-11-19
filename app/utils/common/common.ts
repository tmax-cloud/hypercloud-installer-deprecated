/* eslint-disable eqeqeq */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */

import YAML from 'yaml';
import Node from '../class/Node';

/**
 * @description 랜덤 문자열 생성 함수
 */
export function getRandomString() {
  return Math.random()
    .toString(36)
    .substr(2, 11);
}

/**
 *
 * @param
 */

export function ChangeByteToGigaByte(byte: number) {
  let gigaByte = byte / (1024 * 1024 * 1024);

  // 소수 3번째 자리에서 반올림 하기 위해 100을 곱해줌
  gigaByte *= 100;
  // 반올림
  gigaByte = Math.round(gigaByte);
  // 다시 100으로 나눠줌
  gigaByte /= 100;

  return gigaByte;
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
      if (count > 30) {
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

export async function getYamlObjectByYamlFilePath(
  yamlFilePath: string,
  mainMaster: Node
) {
  mainMaster.cmd = `cat ${yamlFilePath};`;
  let yamlObject = null;
  console.error('1');
  await mainMaster.exeCmd({
    close: () => {},
    stdout: (data: string) => {
      yamlObject = YAML.parse(data.toString());
      console.error('2');
    },
    stderr: () => {}
  });
  console.error('3');
  return yamlObject;
}

export async function setYamlObjectByYamlFilePath(
  yamlFilePath: string,
  mainMaster: Node,
  yamlObject: any
) {
  mainMaster.cmd += `echo "${YAML.stringify(yamlObject)}" >> ${yamlFilePath};`;
  await mainMaster.exeCmd();
}

export function getCopyCommandByFilePath(filePath: string) {
  // 맨 앞에 \ 넣어주어야 강제 복사 가능
  const lastIndexOfDot = filePath.lastIndexOf('.');
  const copyFilePath = `${filePath.slice(0, lastIndexOfDot)}.copy.yaml`;
  return `\\cp ${filePath} ${copyFilePath};`;
}

export function getDeleteDuplicationCommandByFilePath(filePath: string) {
  // 맨 앞에 \ 넣어주어야 강제 복사 가능
  const lastIndexOfSlash = filePath.lastIndexOf('/');
  const tempFilePath = `${filePath.slice(0, lastIndexOfSlash)}/temp`;
  return `
  cat ${filePath} | sort | uniq > ${tempFilePath};
  \\mv ${tempFilePath} ${filePath};
  `;
}
