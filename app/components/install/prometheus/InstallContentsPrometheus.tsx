/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-named-as-default-member */
import React, { useState } from 'react';
import { Switch, Route } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsPrometheus1 from './InstallContentsPrometheus1';
import InstallContentsPrometheus2 from './InstallContentsPrometheus2';
import InstallContentsPrometheus3 from './InstallContentsPrometheus3';
import InstallContentsPrometheus4 from './InstallContentsPrometheus4';
import InstallContentsPrometheusAlready from './InstallContentsPrometheusAlready';
import InstallKubePlease from '../InstallKubePlease';
import PrometheusInstaller from '../../../utils/class/installer/PrometheusInstaller';

// const initialState = {
//   version: '1.17.3',
//   registry: '',
//   page: 1
// };
// export const KubeInstallContext = React.createContext(initialState);
// const reducer = (state, action) => {
//   return { ...state, ...action };
// };

function InstallContentsPrometheus(props: any) {
  console.debug(InstallContentsPrometheus.name, props);
  const { history, location, match } = props;

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

  const [state, setState] = useState({
    version: PrometheusInstaller.PROMETHEUS_VERSION
  });

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
  //       component = <InstallContentsPrometheus1 />;
  //     } else if (kubeInstallState.page === 2) {
  //       component = <InstallContentsPrometheus2 />;
  //     } else if (kubeInstallState.page === 3) {
  //       component = <InstallContentsPrometheus3 />;
  //     } else if (kubeInstallState.page === 4) {
  //       component = <InstallContentsPrometheus4 history={history} />;
  //     }
  //   } else {
  //     component = <InstallContentsPrometheusAlready />;
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
          component={InstallContentsPrometheus1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsPrometheus2
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/step3`}
          render={() => (
            <InstallContentsPrometheus3
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/step4`}
          render={() => (
            <InstallContentsPrometheus4
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/already`}
          component={InstallContentsPrometheusAlready}
        />
        <Route
          path={`${match.path}/impossible`}
          component={InstallKubePlease}
        />
      </Switch>
    </div>
    // </KubeInstallContext.Provider>
  );
}

export default InstallContentsPrometheus;
