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
      CATEGORY: 'CO', // Container Orchestration
      REQUIRED: 'R', // Required
      DESC: '컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스'
    },
    REQUIRED: [
      {
        NAME: 'Kubernetes',
        DESC: '컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스'
      }
    ],
    OPTIONAL: [
      {
        NAME: 'Helm',
        DESC: '컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스'
      },
      {
        NAME: 'HyperCloud Operator',
        DESC: '컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스'
      }
    ]
  }
};

export default CONST;
