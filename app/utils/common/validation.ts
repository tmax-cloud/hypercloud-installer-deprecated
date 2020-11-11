/* eslint-disable import/prefer-default-export */
/**
 * @description 랜덤 문자열 생성 함수
 */
export function checkIpFormat(ip: string): boolean {
  const regex = /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/;
  return regex.test(ip);
}
export function checkEmailFormat(email: string): boolean {
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return regex.test(email);
}
