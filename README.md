## Install

 - 저장소 복사
 - 패키징에 필요한 의존성 패키지 설치 ('yarn'과 'npm'이 설치되어 있어야 합니다.)

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
