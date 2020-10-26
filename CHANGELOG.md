# v4.1.2 (2020.10.26)
### Features
 - Node 추가 시, HostName, User 입력 받는 기능 추가 (IMS:242540)
 - 설치화면에서 권장 설치 순서 보여주는 LNB Stepper로 변경 (IMS:242540)
 - HyperCloud 설치 완료 화면에서, console로 이동하기 버튼 추가 (IMS:242540)
 - Kubernetes 설치 시, Pod network 대역 입력 받는 기능 추가
 
### Fixes
 - Master 다중화에서 keepalive 설치 시, network interface 가져오는 스크립트 수정 (IMS: 242561)
 - Master 다중화 설치 시, 각 노드 설정 누락되는 현상 수정 (IMS:242766)
 - Nginx 설치 가이드 변경에 따른, 설치 스크립트 수정

---

# v4.1.1 (2020.10.15)
### Features
 - 지원 OS 추가
   - Prolinux 지원
 - Tekton 설치, 삭제 기능 추가
 - Catalog Controller 설치, 삭제 기능 추가
 - HyperCloud install 기능 수정
   - Template Service Broker 설치 단계 추가 
 
### Fixes
 - kube-apiserver.yaml 수정 시, api server 정상동작 까지 시간 걸리는 이슈
   - polling으로 api server 정상동작 확인 후, 다음단계 진행하도록 수정 
 - IMS:241611
 - IMS:241609

---

# v4.1.0 (2020.10.07)
### Features
 - 환경 추가, 삭제 기능
   - OS: CentOS7만 지원
   - Network: 외부망(인터넷 접속 가능)만 지원
   - SSH 정보 입력
 - 환경 수정 기능
   - 이름 변경
   - worker 노드 추가
 - Kubernetes 설치, 삭제 기능
   - Image Registry : public Docker hub만 지원
 - CNI 설치, 삭제 기능
 - MetalLB 설치, 삭제 기능
 - Rook Ceph 설치, 삭제 기능
   - OSD설치 가능한 디스크가 존재해야 설치 가능 (최소 1개 이상)
 - Prometheus 설치, 삭제 기능
 - HyperAuth 설치, 삭제 기능
 - HyperCloud 설치, 삭제 기능
 
### Fixes
 - No changes

---
