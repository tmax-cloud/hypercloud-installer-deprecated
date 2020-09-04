import { useContext } from 'react';
import CONST from '../constants/constant';
import * as env from './env';
import routes from '../constants/routes.json';

export function getRequiredProduct() {
  const result: any[] = [];

  Object.keys(CONST.PRODUCT).map(key => {
    if (CONST.PRODUCT[key].IS_REQUIRED) {
      result.push(CONST.PRODUCT[key]);
    }
  });

  return result;
}

export function getOptionalProduct() {
  const result: any[] = [];

  Object.keys(CONST.PRODUCT).map(key => {
    if (!CONST.PRODUCT[key].IS_REQUIRED) {
      result.push(CONST.PRODUCT[key]);
    }
  });

  return result;
}

export function goProductInstallPage(productName: string, nowEnv, history) {
  if (nowEnv.isInstalled(productName)) {
    history.push(
      `${routes.INSTALL.HOME}/${nowEnv.name}/${productName}/already`
    );
  } else if (
    productName !== CONST.PRODUCT.KUBERNETES.NAME &&
    !nowEnv.isInstalled(CONST.PRODUCT.KUBERNETES.NAME)
  ) {
    // 설치 불가능한 상황
    history.push(
      `${routes.INSTALL.HOME}/${nowEnv.name}/${productName}/impossible`
    );
  } else {
    // 설치 페이지로
    history.push(`${routes.INSTALL.HOME}/${nowEnv.name}/${productName}/step1`);
  }
}
