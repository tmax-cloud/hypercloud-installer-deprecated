/* eslint-disable @typescript-eslint/no-empty-interface */
export interface InterfaceRookCephInstall {
  // 필수 구현 목록 (각 운영체제 별)
  installGdisk(): string;

  installNtp(): string;
}
