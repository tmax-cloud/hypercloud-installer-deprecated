export interface InterfaceHyperAuthInstall {
  // 설치 시, 필수 구현되야 하는 기능

  createSslCert(): string;
}
