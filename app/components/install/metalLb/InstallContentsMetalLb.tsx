import React, { useState } from 'react';
import { Switch, Route } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsMetalLb1 from './InstallContentsMetalLb1';
import InstallContentsMetalLb2 from './InstallContentsMetalLb2';
import InstallContentsMetalLb3 from './InstallContentsMetalLb3';
import InstallContentsMetalLb4 from './InstallContentsMetalLb4';
import InstallContentsMetalLbAlready from './InstallContentsMetalLbAlready';
import InstallKubePlease from '../InstallKubePlease';

// const initialState = {
//   version: '1.17.3',
//   registry: '',
//   page: 1
// };
// export const KubeInstallContext = React.createContext(initialState);
// const reducer = (state, action) => {
//   return { ...state, ...action };
// };

function InstallContentsMetalLb(props: any) {
  console.debug(InstallContentsMetalLb.name, props);
  const { history, location, match } = props;

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

  const [state, setState] = useState({
    data: []
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
  //       component = <InstallContentsMetalLb1 />;
  //     } else if (kubeInstallState.page === 2) {
  //       component = <InstallContentsMetalLb2 />;
  //     } else if (kubeInstallState.page === 3) {
  //       component = <InstallContentsMetalLb3 />;
  //     } else if (kubeInstallState.page === 4) {
  //       component = <InstallContentsMetalLb4 history={history} />;
  //     }
  //   } else {
  //     component = <InstallContentsMetalLbAlready />;
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
          component={InstallContentsMetalLb1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsMetalLb2
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
            <InstallContentsMetalLb3
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
            <InstallContentsMetalLb4
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
          component={InstallContentsMetalLbAlready}
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

export default InstallContentsMetalLb;
