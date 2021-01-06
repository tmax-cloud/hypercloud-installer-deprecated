/* eslint-disable no-underscore-dangle */
import { remote } from 'electron';
import path from 'path';
import Env from '../class/Env';

/**
 * 파일 작업은 모두 sync로 수행
 */

/**
 * @description OS객체 생성하여 리턴
 */
// function makeOsObject(object: any) {
//   if (object._os.type === OS_TYPE.CENTOS) {
//     return new CentOS();
//   }
//   return new Ubuntu();
// }

/**
 * @description Node객체 생성하여 리턴
 */
// function makeNodeObject(object: any) {
//   return new Node(
//     object._ip,
//     object._port,
//     object._user,
//     object._password,
//     makeOsObject(object),
//     object._role,
//     object._hostName
//   );
// }

/**
 * @description Env객체 생성하여 리턴
 */
function makeEnvObject(object: any) {
  return new Env(
    object._name,
    object._virtualIp,
    object._networkType,
    object._registry,
    object._nodeList,
    object._productList,
    object._updatedTime
  );
}

/**
 * @description path 파일 삭제 (동기)
 */
export function deleteFileSync(filePath: string) {
  const fs = require('fs');

  try {
    fs.unlinkSync(filePath);
    // file removed
  } catch (err) {
    console.error(err);
  }
}

/**
 * @description path 파일 삭제 (비동기)
 */
export function deleteFileAsync(filePath: string) {
  const fs = require('fs');

  fs.unlink(filePath, err => {
    if (err) {
      console.error(err);
    }

    // file removed
  });
}

/**
 * @description load env list
 */
export function loadEnvList() {
  const fs = require('fs');
  const envPath = path.join(remote.app.getPath('home'), '/env.json');
  // const envPath = '/env.json';

  try {
    if (fs.existsSync(envPath)) {
      // exist
      console.debug('env.json exist.');
    } else {
      // not exist
      fs.writeFileSync(envPath, '[]', (err: any) => {
        if (err) {
          console.debug(err);
        }
      });
    }
  } catch (err) {
    throw Error(err);
  }

  const envList = fs.readFileSync(envPath);
  const envObjList = JSON.parse(envList).map((env: any) => {
    return makeEnvObject(env);
  });

  return envObjList;
}

/**
 * @description save env list
 *
 * @param envList
 */
export function saveEnvList(envList: Env[]) {
  const jsonData = JSON.stringify(envList);
  // const envPath = path.join(rootPath, 'env.json');
  const envPath = path.join(remote.app.getPath('home'), '/env.json');

  const fs = require('fs');
  fs.writeFileSync(envPath, jsonData, (err: any) => {
    if (err) {
      console.debug(err);
    }
  });
}

// Env CRUD
/**
 * @description 새로운 환경 정보를 저장
 *
 * @param newEnv 새 환경
 */
export function createEnv(env: Env) {
  const envList = loadEnvList();
  envList.push(env);
  saveEnvList(envList);
}

/**
 * @description 해당 환경 정보 리턴
 *
 * @param envName
 */
export function loadEnvByName(envName: string) {
  const envList = loadEnvList();
  for (let i = 0; i < envList.length; i += 1) {
    if (envList[i].name === envName) {
      return envList[i];
    }
  }
  return null;
}

/**
 * @description 해당 환경 정보 삭제
 *
 * @param envName
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
 * @description 기존 환경을 지우고, 새 환경으로 저장
 *
 * @param deleteEnvName 삭제 할 환경 이름
 * @param newEnv 새 환
 */
export function updateEnv(deleteEnvName: string, newEnv: Env) {
  deleteEnvByName(deleteEnvName);
  createEnv(newEnv);
}

/**
 * @description 해당 환경에서 해당 제품을 삭제한다.
 *
 * @param envName 환경 이름
 * @param productName 제품 이름
 */
// export const deleteProductByName = (envName: string, productName: string) => {
//   console.error(envName, productName);
//   const envList = loadEnvList();
//   for (let i = 0; i < envList.length; i += 1) {
//     if (envList[i].name === envName) {
//       const targetEnv = envList[i];
//       for (let j = 0; j < targetEnv.productList.length; j += 1) {
//         if (targetEnv.productList[j].name === productName) {
//           targetEnv.productList.splice(j, 1);
//           saveEnvList(envList);
//           return;
//         }
//       }
//     }
//   }
// };

/**
 * @description 해당 환경에서 모든 제품 삭제
 *
 * @param envName 환경 이름
 */
// export const deleteAllProduct = (envName: string) => {
//   const envList = loadEnvList();
//   for (let i = 0; i < envList.length; i += 1) {
//     if (envList[i].name === envName) {
//       const targetEnv = envList[i];
//       targetEnv.productList = [];
//       saveEnvList(envList);
//     }
//   }
// };

/**
 * @description 새로운 환경 정보를 넣어준다.
 *
 * @param newEnv 새 환경09
 */
// export function addProductAtEnv(envName: string, productObj: any) {
//   const envList = loadEnvList();
//   for (let i = 0; i < envList.length; i += 1) {
//     if (envList[i].name === envName) {
//       envList[i].productList.push(productObj);
//       break;
//     }
//   }
//   saveEnvList(envList);
// }

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
 * @description 해당 환경에 해당 제품이 설치 되어 있는지 여부
 *
 * @param productName 제품 명
 * @param env 환경
 */
// export function isInstalled(productName: any, env: any) {
//   for (let i = 0; i < env.productList.length; i += 1) {
//     const target = env.productList[i];
//     if (target.name === productName) {
//       // 설치 됨
//       return target;
//     }
//   }
//   // 설치 안됨
//   return false;
// }

/**
 * @description 해당 환경에 필수 제품이 모두 설치 되어 있는지 여부
 *
 * @param env 환경
 */
// export const isAllRequiredProductInstall = (env: any) => {
//   const requiredProduct = product.getRequiredProduct();

//   for (let i = 0; i < requiredProduct.length; i += 1) {
//     const target = requiredProduct[i].NAME;
//     let installed = false;
//     for (let j = 0; j < env.productList.length; j += 1) {
//       const target2 = env.productList[j].name;
//       if (target === target2) {
//         installed = true;
//         break;
//       }
//     }
//     if (!installed) {
//       return false;
//     }
//   }
//   return true;
// };

/**
 * @description 노드 리스트를, mainMaster, master, worker로 분리하여 리턴
 *
 * @param nodeInfo 한 환경의 노드 리스트-
 */
// export const getArrSortedByRole = (nodeList: any) => {
//   // mainMaster, master, worker로 분리
//   let mainMaster: any = null;
//   const masterArr: any[] = [];
//   const workerArr: any[] = [];

//   for (let i = 0; i < nodeList.length; i += 1) {
//     if (nodeList[i].role === ROLE.MAIN_MASTER) {
//       mainMaster = nodeList[i];
//     } else if (nodeList[i].role === ROLE.MASTER) {
//       masterArr.push(nodeList[i]);
//     } else if (nodeList[i].role === ROLE.WORKER) {
//       workerArr.push(nodeList[i]);
//     }
//   }

//   return {
//     mainMaster,
//     masterArr,
//     workerArr
//   };
// };
