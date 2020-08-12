import React, { useContext } from 'react';
import { Button } from '@material-ui/core';
import styles from './InstallContentsKubernetes4.css';
// import { InstallPageContext } from '../../containers/InstallPage';
import CONST from '../../utils/constants/constant';
import { KubeInstallContext } from './InstallContentsKubernetes';
import * as env from '../../utils/common/env';
import { AppContext } from '../../containers/HomePage';
import FinishImage from '../../../resources/assets/img_finish.svg';
import routes from '../../utils/constants/routes.json';

function InstallContentsKubernetes4(props: any) {
  console.debug(InstallContentsKubernetes4.name, props);
  const { history, location, match } = props;

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const nowEnv = env.getEnvByName(match.params.envName);

  // const kubeInstallContext = useContext(KubeInstallContext);
  // const { kubeInstallState, dispatchKubeInstall } = kubeInstallContext;

  // json 파일 저장
  env.deleteProductByName(nowEnv.name, CONST.PRODUCT.KUBERNETES.NAME);
  env.addProductAtEnv(nowEnv.name, {
    name: CONST.PRODUCT.KUBERNETES.NAME,
    version: appState.kubeinstallState.version,
    registry: appState.kubeinstallState.registry
  });

  const getRegistryJsx = () => {
    if (appState.kubeinstallState.registry) {
      return (
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>
              도커 레지스트리 주소
            </span>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>
              {appState.kubeinstallState.registry}
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
              {appState.kubeinstallState.version}
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

export default InstallContentsKubernetes4;
