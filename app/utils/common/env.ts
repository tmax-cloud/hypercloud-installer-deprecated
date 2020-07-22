import CONST from '../constants/constant';

/**
 * 파일 작업은 모두 sync로 수행
 */

/**
 * @description json 파일에서 환경 리스트를 리턴
 */
export function loadEnv() {
  const fs = require('fs');

  const envList = fs.readFileSync('./app/utils/constants/env.json');
  return JSON.parse(envList);
}

/**
 * @param envList 환경 리스트
 * @description 환경 리스트 json 파일에 저장
 */
export function saveEnv(envList: any) {
  const jsonData = JSON.stringify(envList);
  const fs = require('fs');
  fs.writeFileSync('./app/utils/constants/env.json', jsonData, function(err) {
    if (err) {
      console.log(err);
    }
  });
}

/**
 * @param envName 환경 이름
 * @description 해당 환경 정보 리턴
 */
export function getEnvByName(envName: string) {
  const envList = loadEnv();
  for (let i = 0; i < envList.length; i += 1) {
    if (envList[i].name === envName) {
      return envList[i];
    }
  }
  return null;
}

/**
 * @param envName 환경 이름
 * @description 해당 환경 정보 삭제
 */
export function deleteEnvByName(envName: string) {
  const envList = loadEnv();
  for (let i = 0; i < envList.length; i += 1) {
    if (envList[i].name === envName) {
      envList.splice(i, 1);
      break;
    }
  }
  saveEnv(envList);
}

/**
 * @param newEnv 새 환경
 * @description 새로운 환경 정보를 넣어준다.
 */
export function appendEnv(newEnv: any) {
  const envList = loadEnv();
  envList.push(newEnv);
  saveEnv(envList);
}

/**
 * @description 저장 된 환경 정보가 있는지, 없는지 여부
 */
export function isEmpty() {
  const envList = loadEnv();
  if (envList.length > 0) {
    // 환경 정보 없음
    return false;
  }
  // 환경 정보 있음
  return true;
}

/**
 * @param productName 제품 명
 * @param env 환경
 * @description 해당 환경에 해당 제품이 설치 되어 있는지 여부
 */
export function isInstalled(productName: any, env: any) {
  for (let i = 0; i < env.installedProducts.length; i += 1) {
    const target = env.installedProducts[i];
    if (target.name === productName) {
      // 설치 됨
      return true;
    }
  }
  // 설치 안됨
  return false;
}

/**
 * @param env 환경
 * @description 해당 환경에 필수 제품이 모두 설치 되어 있는지 여부
 */
export const isAllRequiredProductInstall = (env: any) => {
  for (let i = 0; i < CONST.PRODUCT.REQUIRED.length; i += 1) {
    const target = CONST.PRODUCT.REQUIRED[i].NAME;
    let installed = false;
    for (let j = 0; j < env.installedProducts.length; j += 1) {
      const target2 = env.installedProducts[j].name;
      if (target === target2) {
        installed = true;
        break;
      }
    }
    if (!installed) {
      return false;
    }
  }
  return true;
};
