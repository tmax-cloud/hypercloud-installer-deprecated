import React, { useState } from 'react';
import { Switch, Route } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsRookCeph1 from './InstallContentsRookCeph1';
import InstallContentsRookCeph2 from './InstallContentsRookCeph2';
import InstallContentsRookCeph3 from './InstallContentsRookCeph3';
import InstallContentsRookCeph4 from './InstallContentsRookCeph4';
import InstallContentsRookCephAlready from './InstallContentsRookCephAlready';
import InstallKubePlease from '../InstallKubePlease';
import RookCephInstaller from '../../../utils/class/installer/RookCephInstaller';

// const initialState = {
//   version: '1.17.3',
//   registry: '',
//   page: 1
// };
// export const KubeInstallContext = React.createContext(initialState);
// const reducer = (state, action) => {
//   return { ...state, ...action };
// };

function InstallContentsRookCeph(props: any) {
  console.debug(InstallContentsRookCeph.name, props);
  const { history, location, match } = props;

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

  const [state, setState] = useState({
    version: RookCephInstaller.CEPH_VERSION
  });

  const [option, setOption] = useState({
    disk: {},
    osdCpu: '',
    osdMemory: '',
    monCpu: '',
    monMemory: '',
    mgrCpu: '',
    mgrMemory: '',
    mdsCpu: '',
    mdsMemory: ''
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
  //       component = <InstallContentsRookCeph1 />;
  //     } else if (kubeInstallState.page === 2) {
  //       component = <InstallContentsRookCeph2 />;
  //     } else if (kubeInstallState.page === 3) {
  //       component = <InstallContentsRookCeph3 />;
  //     } else if (kubeInstallState.page === 4) {
  //       component = <InstallContentsRookCeph4 history={history} />;
  //     }
  //   } else {
  //     component = <InstallContentsRookCephAlready />;
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
          component={InstallContentsRookCeph1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsRookCeph2
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
              setOption={setOption}
            />
          )}
        />
        <Route
          path={`${match.path}/step3`}
          render={() => (
            <InstallContentsRookCeph3
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
              option={option}
            />
          )}
        />
        <Route
          path={`${match.path}/step4`}
          render={() => (
            <InstallContentsRookCeph4
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
          component={InstallContentsRookCephAlready}
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

export default InstallContentsRookCeph;
