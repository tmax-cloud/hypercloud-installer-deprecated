import YAML from 'yaml';
import Node from '../class/Node';

/**
 * @description 랜덤 문자열 생성 함수
 *
 * @return 랜덤 문자열
 */
export function getRandomString() {
  return Math.random()
    .toString(36)
    .substr(2, 11);
}

/**
 * @description byte -> gigabyte 변경 함수
 *
 * @param byte
 *
 * @return gigabyte
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

/**
 * @description api server 정상 응답 확인 함수
 *
 * @param mainMaster main master Node 객체
 *
 * @return
 */
export async function waitApiServerUntilNormal(mainMaster: Node) {
  return new Promise(resolve => {
    let count = 0;
    const timerid = setInterval(async () => {
      // kubectl get node를 api server의 health check command로 사용
      mainMaster.cmd = `
      kubectl get node;
      echo $?;
      `;
      count += 1;
      if (count > 30) {
        // 30번 이상 요청 시 timeout (6초 x 30번 = 3분)
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
      // 6초마다
    }, 6000);
  });
}

/**
 * @description main master의 yaml파일을 읽어 yaml객체로 리턴해주는 함수
 *
 * @param yamlFilePath yaml file path
 * @param mainMaster main master Node 객체
 *
 * @return yaml 객체
 */
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

/**
 * @description yaml object를 main master의 yaml file에 쓰는 함수
 *
 * @param yamlFilePath yaml file path
 * @param mainMaster main master Node 객체
 * @param yamlObject yaml object
 *
 * @return yaml 객체
 */
export async function setYamlObjectByYamlFilePath(
  yamlFilePath: string,
  mainMaster: Node,
  yamlObject: any
) {
  mainMaster.cmd += `echo "${YAML.stringify(yamlObject)}" >> ${yamlFilePath};`;
  await mainMaster.exeCmd();
}

/**
 * @description yaml 파일 복사
 *
 * @param filePath 복사 할 yaml 파일
 *
 * @return yaml 파일 복사 command
 */
export function getCopyCommandByFilePath(filePath: string) {
  // 맨 앞에 \ 넣어주어야 강제 복사 가능
  const lastIndexOfDot = filePath.lastIndexOf('.');
  const copyFilePath = `${filePath.slice(0, lastIndexOfDot)}.copy.yaml`;
  return `\\cp ${filePath} ${copyFilePath};`;
}

/**
 * @description yaml 파일 이동
 *
 * @param filePath 이동 할 yaml 파일
 *
 * @return yaml 파일 이동 command
 */
export function getDeleteDuplicationCommandByFilePath(filePath: string) {
  // 맨 앞에 \ 넣어주어야 강제 복사 가능
  const lastIndexOfSlash = filePath.lastIndexOf('/');
  const tempFilePath = `${filePath.slice(0, lastIndexOfSlash)}/temp`;
  return `
  cat ${filePath} | sort | uniq > ${tempFilePath};
  \\mv ${tempFilePath} ${filePath};
  `;
}
