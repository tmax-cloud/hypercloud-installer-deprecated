const CONST = {
  HOME: {
    INSTALL: 'install',
    ENV: 'env'
  },
  INSTALL: {
    MAIN: 'main',
    KUBERNETES: 'Kubernetes'
  },
  ENV: {
    MANAGE: 'manage',
    ADD: 'add'
  },
  PRODUCT: {
    KUBERNETES: {
      NAME: 'Kubernetes',
      IS_REQUIRED: true, // Required
      DESC: '컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스'
    },
    CNI: {
      NAME: 'CNI',
      IS_REQUIRED: true, // Required
      DESC: '컨테이너 간의 네트워킹을 제어할 수 있는 플러그인'
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
    // REQUIRED: [
    //   {
    //     NAME: 'Kubernetes',
    //     DESC: '컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스'
    //   }
    // ],
    // OPTIONAL: [
    //   {
    //     NAME: 'Helm',
    //     DESC: '컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스'
    //   },
    //   {
    //     NAME: 'HyperCloud Operator',
    //     DESC: '컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스'
    //   }
    // ]
  }
};

export default CONST;
