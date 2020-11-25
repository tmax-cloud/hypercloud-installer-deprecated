/**
 * @description IP형식 체크 함수
 *
 * @param ip IP
 *
 * @return IP형식에 맞으면 true, 맞지 않으면 false
 */
export function checkIpFormat(ip: string): boolean {
  const regex = /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/;
  return regex.test(ip);
}

/**
 * @description Email형식 체크 함수

 * @param email Email

 * @return Email형식에 맞으면 true, 맞지 않으면 false
 */
export function checkEmailFormat(email: string): boolean {
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return regex.test(email);
}

/**
 * @description 문자열에 대문자 포함 여부 체크 함수
 *
 * @param str 문자열
 *
 * @return 대문자 포함 true, 미포함 false
 */
export function checkHaveUppercase(str: string): boolean {
  if (str === str.toLocaleLowerCase()) {
    return false;
  }
  return true;
}

/**
 * @description 문자열에 소문자 포함 여부 체크 함수
 *
 * @param str 문자열
 *
 * @return 소문자 포함 true, 미포함 false
 */
export function checkHaveLowercase(str: string): boolean {
  if (str === str.toLocaleUpperCase()) {
    return false;
  }
  return true;
}

/**
 * @description 문자열에 숫자 포함 여부 체크 함수
 *
 * @param str 문자열
 *
 * @return 숫자 포함 true, 미포함 false
 */
export function checkHaveNumber(str: string): boolean {
  const regex = /[0-9]/;
  return regex.test(str);
}

/**
 * @description 문자열에 특수문자 포함 여부 체크 함수
 *
 * @param str 문자열
 *
 * @return 특수문자 포함 true, 미포함 false
 */
export function checkHaveSpecialCharacter(str: string): boolean {
  const regex = /[~!@#$%^&*()_+|<>?:{}]/;
  return regex.test(str);
}
