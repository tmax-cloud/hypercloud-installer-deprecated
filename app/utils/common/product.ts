import CONST from '../constants/constant';
import routes from '../constants/routes.json';

/**
 * @description constant 파일에서 필수 제품만 필터링 해서 리턴해주는 함수
 *
 * @return 필수 제품의 key(이름)를 배열로 리턴
 */
export function getRequiredProduct() {
  const result: any[] = [];

  Object.keys(CONST.PRODUCT).map(key => {
    if (CONST.PRODUCT[key].IS_REQUIRED) {
      result.push(CONST.PRODUCT[key]);
    }
  });

  return result;
}

/**
 * @description constant 파일에서 호환 제품만 필터링 해서 리턴해주는 함수
 *
 * @return 호환 제품의 key(이름)를 배열로 리턴
 */
export function getOptionalProduct() {
  const result: any[] = [];

  Object.keys(CONST.PRODUCT).map(key => {
    if (!CONST.PRODUCT[key].IS_REQUIRED) {
      result.push(CONST.PRODUCT[key]);
    }
  });

  return result;
}

/**
 * @description 각 제품 설치 페이지로 이동해주는 함수
 */
export function goProductInstallPage(productName: string, nowEnv, history) {
  // 이미 설치 되어 있는 경우
  if (nowEnv.isInstalled(productName)) {
    history.push(
      `${routes.INSTALL.HOME}/${nowEnv.name}/${productName}/already`
    );
  }
  // XXX:disabled 상태 없이 진행 (수동으로 환경에 직접 설치 시, 인스톨러에서 설치 여부 판단 어려움)
  // else if (
  //   productName !== CONST.PRODUCT.KUBERNETES.NAME &&
  //   !nowEnv.isInstalled(CONST.PRODUCT.KUBERNETES.NAME)
  // ) {
  //   // 설치 불가능한 상황
  //   history.push(
  //     `${routes.INSTALL.HOME}/${nowEnv.name}/${productName}/impossible`
  //   );
  // }
  else {
    // 설치 페이지로
    history.push(`${routes.INSTALL.HOME}/${nowEnv.name}/${productName}/step1`);
  }
}
