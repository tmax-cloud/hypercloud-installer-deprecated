import React, { useReducer, useContext, useEffect, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router';
import styles from './InstallContentsCni.css';
import InstallContentsCni1 from './InstallContentsCni1';
import InstallContentsCni2 from './InstallContentsCni2';
import InstallContentsCni3 from './InstallContentsCni3';
import InstallContentsCni4 from './InstallContentsCni4';
import InstallContentsCniAlready from './InstallContentsCniAlready';
import { AppContext } from '../../containers/HomePage';
import CONST from '../../utils/constants/constant';
import routes from '../../utils/constants/routes.json';

// const initialState = {
//   version: '1.17.3',
//   registry: '',
//   page: 1
// };
// export const KubeInstallContext = React.createContext(initialState);
// const reducer = (state, action) => {
//   return { ...state, ...action };
// };

function InstallContentsCni(props: any) {
  console.debug(InstallContentsCni.name, props);
  const { history, location, match } = props;

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const [state, setState] = useState({
    type: 'Calico',
    version: '3.13.4'
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
  //       component = <InstallContentsCni1 />;
  //     } else if (kubeInstallState.page === 2) {
  //       component = <InstallContentsCni2 />;
  //     } else if (kubeInstallState.page === 3) {
  //       component = <InstallContentsCni3 />;
  //     } else if (kubeInstallState.page === 4) {
  //       component = <InstallContentsCni4 history={history} />;
  //     }
  //   } else {
  //     component = <InstallContentsCniAlready />;
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
          render={() => (
            <InstallContentsCni1
              history={history}
              match={match}
              location={location}
            />
          )}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsCni2
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
            <InstallContentsCni3
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
            <InstallContentsCni4
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
          component={InstallContentsCniAlready}
        />
      </Switch>
    </div>
    // </KubeInstallContext.Provider>
  );
}

export default InstallContentsCni;
