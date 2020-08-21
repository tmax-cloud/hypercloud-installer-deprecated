import React, { useReducer, useContext, useEffect, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router';
import styles from './InstallContentsKubernetes.css';
import InstallContentsKubernetes1 from './InstallContentsKubernetes1';
import InstallContentsKubernetes2 from './InstallContentsKubernetes2';
import InstallContentsKubernetes3 from './InstallContentsKubernetes3';
import InstallContentsKubernetes4 from './InstallContentsKubernetes4';
import InstallContentsKubernetesAlready from './InstallContentsKubernetesAlready';
import { AppContext } from '../../containers/HomePage';
import CONST from '../../utils/constants/constant';
import routes from '../../utils/constants/routes.json';
import { NETWORK_TYPE } from '../../utils/class/Env';
import * as env from '../../utils/common/env';

// const initialState = {
//   version: '1.17.3',
//   registry: '',
//   page: 1
// };
// export const KubeInstallContext = React.createContext(initialState);
// const reducer = (state, action) => {
//   return { ...state, ...action };
// };

function InstallContentsKubernetes(props: any) {
  console.debug(InstallContentsKubernetes.name, props);
  const { history, location, match } = props;

  const [state, setState] = useState({
    version: CONST.PRODUCT.KUBERNETES.SUPPORTED_VERSION[0],
    registry: ''
  });

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

  // const [kubeInstallState, dispatchKubeInstall] = useReducer(
  //   reducer,
  //   initialState
  // );

  // const getComponent = () => {
  //   let component;

  //   // 설치 여부 판단
  //   let isInstalled = false;
  //   for (let i = 0; i < appState.nowEnv.productList.length; i += 1) {
  //     const target = appState.nowEnv.productList[i];
  //     if (target.name === CONST.PRODUCT.KUBERNETES.NAME) {
  //       isInstalled = true;
  //       break;
  //     }
  //   }

  //   if (!isInstalled) {
  //     if (kubeInstallState.page === 1) {
  //       component = <InstallContentsKubernetes1 />;
  //     } else if (kubeInstallState.page === 2) {
  //       component = <InstallContentsKubernetes2 />;
  //     } else if (kubeInstallState.page === 3) {
  //       component = <InstallContentsKubernetes3 />;
  //     } else if (kubeInstallState.page === 4) {
  //       component = <InstallContentsKubernetes4 history={history} />;
  //     }
  //   } else {
  //     component = <InstallContentsKubernetesAlready />;
  //   }

  //   return component;
  // };

  return (
    // <KubeInstallContext.Provider
    //   value={{
    //     kubeInstallState,
    //     dispatchKubeInstall
    //   }}
    // >
    <div className={['childUpDownCenter', styles.wrap].join(' ')}>
      {/* {getComponent()} */}
      <Switch>
        <Route
          path={`${match.path}/step1`}
          component={InstallContentsKubernetes1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsKubernetes2
              history={history}
              location={location}
              match={match}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/step3`}
          render={() => (
            <InstallContentsKubernetes3
              history={history}
              location={location}
              match={match}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/step4`}
          render={() => (
            <InstallContentsKubernetes4
              history={history}
              location={location}
              match={match}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/already`}
          component={InstallContentsKubernetesAlready}
        />
      </Switch>
    </div>
    // </KubeInstallContext.Provider>
  );
}

export default InstallContentsKubernetes;
