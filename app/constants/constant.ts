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
    REQUIRED: [
      {
        NAME: 'Kubernetes'
      }
    ],
    OPTIONAL: [
      {
        NAME: 'Helm'
      },
      {
        NAME: 'HyperCloud Operator'
      }
    ]
  }
};

export default CONST;
