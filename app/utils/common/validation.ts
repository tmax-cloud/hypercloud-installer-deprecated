/* eslint-disable import/prefer-default-export */
/**
 * @description 랜덤 문자열 생성 함수
 */
export function checkIpFormat(ip: string): boolean {
  const ipRegex = /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/;
  return ipRegex.test(ip);
}
