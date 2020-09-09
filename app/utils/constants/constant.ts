const CONST = {
  GIT_REPO: 'https://github.com/tmax-cloud/hypercloud-install-guide.git',
  GIT_BRANCH: '4.1',
  PRODUCT: {
    KUBERNETES: {
      NAME: 'Kubernetes',
      IS_REQUIRED: true, // Required
      DESC: '컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스',
      SUPPORTED_VERSION: ['1.17.6']
    },
    CNI: {
      NAME: 'CNI',
      IS_REQUIRED: true, // Required
      DESC: '컨테이너 간의 네트워킹을 제어할 수 있는 플러그인',
      SUPPORTED_VERSION: ['3.13.4'],
      SUPPORTED_TYPE: ['Calico']
    },
    METAL_LB: {
      NAME: 'MetalLB',
      IS_REQUIRED: true, // Optional
      DESC: '로드 밸런싱 기능을 제공해주는 플러그인'
    },
    ROOK_CEPH: {
      NAME: 'Rook Ceph',
      IS_REQUIRED: true, // Optional
      DESC: '오픈 소스 소프트웨어 스토리지 플랫폼'
    },
    PROMETHEUS: {
      NAME: 'Prometheus',
      IS_REQUIRED: true, // Optional
      DESC: '이벤트 모니터링 및 경고에 사용되는 무료 소프트웨어 응용 프로그램'
    },
    HELM: {
      NAME: 'Helm',
      IS_REQUIRED: false, // Optional
      DESC: '헬름'
    },
    HYPERCLOUD_OPERATOR: {
      NAME: 'HyperCloud Operator',
      IS_REQUIRED: false, // Optional
      DESC: '하이퍼 클라우드 오퍼레이터'
    }
  }
};

export default CONST;
