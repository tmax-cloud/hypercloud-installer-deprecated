/**
 * 파일 작업은 모두 sync로 수행
 */

export function loadEnv() {
  const fs = require('fs');

  const envList = fs.readFileSync('./app/utils/constants/env.json');
  return JSON.parse(envList);
}
export function saveEnv(envList) {
  const jsonData = JSON.stringify(envList);
  const fs = require('fs');
  fs.writeFileSync('./app/utils/constants/env.json', jsonData, function(err) {
    if (err) {
      console.log(err);
    }
  });
}

export function getEnvByName(name: string) {
  const envList = loadEnv();
  for (let i = 0; i < envList.length; i += 1) {
    if (envList[i].name === name) {
      return envList[i];
    }
  }
  throw new Error();
}

export function deleteEnvByName(name: string) {
  const envList = loadEnv();
  for (let i = 0; i < envList.length; i += 1) {
    if (envList[i].name === name) {
      envList.splice(i, 1);
      break;
    }
  }
  saveEnv(envList);
}

export function appendEnv(env) {
  const envList = loadEnv();
  envList.push(env);
  saveEnv(envList);
}
