import React, { useContext } from 'react';
import { KubernetesInstallPageContext } from './InstallContentsKubernetes';

function InstallContentsKubernetes4(props) {
  const { dispatchInstallPage } = props;

  const kubernetesInstallPageContext = useContext(KubernetesInstallPageContext);
  const { installKubernetesPageState, dispatchKubernetesInstallPage } = kubernetesInstallPageContext;

  return (
    <div>
      page 4
    </div>
  );
}

export default InstallContentsKubernetes4;
