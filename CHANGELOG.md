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
