import React, { useContext } from 'react';
import { KubeInstallContext } from './InstallContentsKubernetes';

function InstallContentsKubernetes4(props) {
  const { dispatchInstallPage } = props;

  const kubernetesInstallPageContext = useContext(KubeInstallContext);
  const { installKubernetesPageState, dispatchKubernetesInstallPage } = kubernetesInstallPageContext;

  return (
    <div>
      page 4
    </div>
  );
}

export default InstallContentsKubernetes4;
