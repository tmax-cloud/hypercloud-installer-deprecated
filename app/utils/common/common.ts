/**
 * @description 랜덤 문자열 생성 함수
 */
export function getRandomString() {
  return Math.random()
    .toString(36)
    .substr(2, 11);
}

export function getRandomNumber() {
  return 1;
}
