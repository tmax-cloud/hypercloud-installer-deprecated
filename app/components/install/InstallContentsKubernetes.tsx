import React, { useReducer } from 'react';
import styles from './InstallContentsKubernetes.css';
import InstallContentsKubernetes1 from './InstallContentsKubernetes1';
import InstallContentsKubernetes2 from './InstallContentsKubernetes2';
import InstallContentsKubernetes3 from './InstallContentsKubernetes3';
import InstallContentsKubernetes4 from './InstallContentsKubernetes4';

const initialState = {
  version: '1.17.3',
  registry: '',
  page: 1
};
export const KubeInstallContext = React.createContext(initialState);
const reducer = (state, action) => {
  return { ...state, ...action };
};

function InstallContentsKubernetes() {
  console.log('InstallContentsKubernetes');
  const [kubeInstallState, dispatchKubeInstall] = useReducer(
    reducer,
    initialState
  );

  const getComponent = () => {
    let component;
    if (kubeInstallState.page === 1) {
      component = <InstallContentsKubernetes1 />;
    } else if (kubeInstallState.page === 2) {
      component = <InstallContentsKubernetes2 />;
    } else if (kubeInstallState.page === 3) {
      component = <InstallContentsKubernetes3 />;
    } else if (kubeInstallState.page === 4) {
      component = <InstallContentsKubernetes4 />;
    }

    return component;
  };

  return (
    <KubeInstallContext.Provider
      value={{
        kubeInstallState,
        dispatchKubeInstall
      }}
    >
      <div className={['childUpDownCenter', styles.wrap].join(' ')}>
        {getComponent()}
      </div>
      {/* <Switch>
        <Route
          path={routes.INSTALL.KUBERNETES.STEP1}
          component={InstallContentsKubernetes1}
        />
        <Route
          path={routes.INSTALL.KUBERNETES.STEP2}
          component={InstallContentsKubernetes2}
        />
        <Route
          path={routes.INSTALL.KUBERNETES.STEP3}
          component={InstallContentsKubernetes3}
        />
        <Route
          path={routes.INSTALL.KUBERNETES.STEP4}
          component={InstallContentsKubernetes4}
        />
      </Switch> */}
    </KubeInstallContext.Provider>
  );
}

export default InstallContentsKubernetes;
