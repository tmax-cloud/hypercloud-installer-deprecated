import React, { useContext } from 'react';
import { Button } from '@material-ui/core';
import styles from './InstallContentsCni4.css';
// import { InstallPageContext } from '../../containers/InstallPage';
import CONST from '../../utils/constants/constant';
import { KubeInstallContext } from './InstallContentsKubernetes';
import * as env from '../../utils/common/env';
import { AppContext } from '../../containers/HomePage';
import FinishImage from '../../../resources/assets/img_finish.svg';
import routes from '../../utils/constants/routes.json';

function InstallContentsCni4(props: any) {
  console.debug(InstallContentsCni4.name, props);
  const { history, location, match, state, setState } = props;

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const nowEnv = env.loadEnvByName(match.params.envName);

  // const kubeInstallContext = useContext(KubeInstallContext);
  // const { kubeInstallState, dispatchKubeInstall } = kubeInstallContext;

  nowEnv.deleteProductByName(CONST.PRODUCT.CNI.NAME);
  nowEnv.addProduct({
    name: CONST.PRODUCT.CNI.NAME,
    version: state.version,
    type: state.type
  });
  // json 파일 저장
  env.updateEnv(nowEnv.name, nowEnv);

  const getRegistryJsx = () => {
    if (state.type) {
      return (
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>Type</span>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>
              {state.type}
            </span>
          </div>
        </div>
      );
    }
  };
  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '50px' }}>
          <img src={FinishImage} alt="Logo" />
        </div>
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>버전</span>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>
              {state.version}
            </span>
          </div>
        </div>
        {getRegistryJsx()}
        <div>
          <Button
            variant="contained"
            className={['white'].join(' ')}
            size="large"
            onClick={() => {
              history.push(`${routes.INSTALL.HOME}/${nowEnv.name}/main`);
            }}
          >
            완료
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InstallContentsCni4;
