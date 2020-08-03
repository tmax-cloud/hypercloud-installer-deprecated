/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable global-require */
import CONST from '../constants/constant';
import Node, { Role } from '../class/Node';
import Env from '../class/Env';
import * as product from './product';

/**
 * 파일 작업은 모두 sync로 수행
 */

/**
 * @description Node객체 생성하여 리턴
 */
function makeNodeObject(object: any) {
  return new Node(
    object._ip,
    object._port,
    object._user,
    object._password,
    object._role,
    object._hostName
  );
}

/**
 * @description Env객체 생성하여 리턴
 */
function makeEnvObject(object: any) {
  return new Env(
    object._name,
    object._nodeList.map((node: any) => {
      return makeNodeObject(node);
    }),
    object._productList,
    object._updatedTime
  );
}

export function loadEnvList() {
  const fs = require('fs');

  try {
    if (fs.existsSync('env.json')) {
      // file exists
    } else {
      fs.writeFileSync('env.json', '[]', (err: any) => {
        if (err) {
          console.debug(err);
        }
      });
    }
  } catch (err) {
    throw Error(err);
  }

  const envList = fs.readFileSync('env.json');
  const envObjList = JSON.parse(envList).map((env: any) => {
    return makeEnvObject(env);
  });

  return envObjList;
}

/**
 * @param envList 환경 리스트
 * @description 환경 리스트 json 파일에 저장
 */
export function saveEnvList(envList: Env[]) {
  const jsonData = JSON.stringify(envList);
  const fs = require('fs');
  fs.writeFileSync('env.json', jsonData, (err: any) => {
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
  const envList = loadEnvList();
  for (let i = 0; i < envList.length; i += 1) {
    if (envList[i].name === envName) {
      return makeEnvObject(envList[i]);
    }
  }
  return null;
}

/**
 * @param envName 환경 이름
 * @description 해당 환경 정보 삭제
 */
export function deleteEnvByName(envName: string) {
  const envList = loadEnvList();
  for (let i = 0; i < envList.length; i += 1) {
    if (envList[i].name === envName) {
      envList.splice(i, 1);
      break;
    }
  }
  saveEnvList(envList);
}

/**
 * @param newEnv 새 환경
 * @description 새로운 환경 정보를 넣어준다.
 */
export function addEnv(env: Env) {
  const envList = loadEnvList();
  envList.push(env);
  saveEnvList(envList);
}

/**
 * @description 저장 된 환경 정보가 있는지, 없는지 여부
 */
export function isEmpty() {
  const envList = loadEnvList();
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
  for (let i = 0; i < env.productList.length; i += 1) {
    const target = env.productList[i];
    if (target.name === productName) {
      // 설치 됨
      return target;
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
  const requiredProduct = product.getRequiredProduct();

  for (let i = 0; i < requiredProduct.length; i += 1) {
    const target = requiredProduct.NAME;
    let installed = false;
    for (let j = 0; j < env.productList.length; j += 1) {
      const target2 = env.productList[j].name;
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

/**
 * @param envName 환경 이름
 * @param productName 제품 이름
 * @description 해당 환경에서 해당 제품을 삭제한다.
 */
export const deleteProductByName = (envName: string, productName: string) => {
  console.error(envName,productName);
  const envList = loadEnvList();
  for (let i = 0; i < envList.length; i += 1) {
    if (envList[i].name === envName) {
      const targetEnv = envList[i];
      for (let j = 0; j < targetEnv.productList.length; j += 1) {
        if (targetEnv.productList[j].name === productName) {
          targetEnv.productList.splice(j, 1);
          saveEnvList(envList);
          return;
        }
      }
    }
  }
};

export const deleteAllProduct = (envName: string) => {
  const envList = loadEnvList();
  for (let i = 0; i < envList.length; i += 1) {
    if (envList[i].name === envName) {
      const targetEnv = envList[i];
      targetEnv.productList = [];
      saveEnvList(envList);
    }
  }
};

/**
 * @param nodeInfo 한 환경의 노드 리스트
 * @description 노드 리스트를, mainMaster, master, worker로 분리하여 리턴
 */
export const getArrSortedByRole = (nodeInfo: any) => {
  // mainMaster, master, worker로 분리
  let mainMaster: any = null;
  const masterArr: any[] = [];
  const workerArr: any[] = [];

  for (let i = 0; i < nodeInfo.length; i += 1) {
    if (nodeInfo[i].role === Role.MAIN_MASTER) {
      mainMaster = nodeInfo[i];
    } else if (nodeInfo[i].role === Role.MASTER) {
      masterArr.push(nodeInfo[i]);
    } else if (nodeInfo[i].role === Role.WORKER) {
      workerArr.push(nodeInfo[i]);
    }
  }

  return {
    mainMaster,
    masterArr,
    workerArr
  };
};
