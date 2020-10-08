## Install

 - 저장소 복사 (zip 형태로 다운받아 압축해제해도 무관)
 - 패키징에 필요한 의존성 패키지 설치 ('npm'과 'yarn'이 설치되어 있어야 합니다.)
    - nodejs: https://nodejs.org/
    - yarn: https://classic.yarnpkg.com/

```bash
$ git clone --depth 1 --single-branch -b {version} https://github.com/tmax-cloud/hypercloud-installer.git {your-project-name}
ex) git clone --depth 1 --single-branch -b v4.1.0 https://github.com/tmax-cloud/hypercloud-installer.git hypercloud-installer
$ cd {your-project-name}
$ yarn
```

## Packaging for Production

 - hypercloud-installer 설치 파일 패키징

```bash
$ yarn package
```

 - release 디렉토리에서 설치 파일 확인
    - Linux
       - Ubuntu
          - .deb 파일 확인 (debian 계열 Linux 설치 파일)
       - CentOS
          - .rpm 파일 확인 (redhat 계열 Linux 설치 파일)
    - Windows: 
       - .msi 파일 확인
