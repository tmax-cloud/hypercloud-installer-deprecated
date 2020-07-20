import React, { useContext } from 'react';
import styles from './InstallContentsKubernetes4.css';
// import { InstallPageContext } from '../../containers/InstallPage';
import CONST from '../../utils/constants/constant';
import { Button } from '@material-ui/core';
import { KubeInstallContext } from './InstallContentsKubernetes';
import * as env from '../../utils/common/env';

function InstallContentsKubernetes4(props) {
  // const installPageContext = useContext(InstallPageContext);
  // const { installPageState, dispatchInstallPage } = installPageContext;
  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const kubeInstallContext = useContext(KubeInstallContext);
  const { kubeInstallState, dispatchKubeInstall } = kubeInstallContext;

  // json 파일 저장
  const envList = env.loadEnv();
  for (let i = 0; i < envList.length; i += 1) {
    if (envList[i].name === appState.env.name) {
      envList[i].installedProducts.push({
        name: 'Kubernetes',
        version: kubeInstallState.version,
        registry: kubeInstallState.registry
      });
      break;
    }
  }
  env.saveEnv(envList);

  const getRegistryJsx = () => {
    if (kubeInstallState.registry) {
      return <span>레지스트리 : {kubeInstallState.registry}</span>;
    }
  };
  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      <div>
        <div>이미지</div>
        <div>설치가 완료되었습니다.</div>
        <div>
          버전:{kubeInstallState.version}
          {getRegistryJsx()}
        </div>
        <div>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              dispatchInstallPage({
                type: 'SET_MODE',
                data: {
                  mode: CONST.INSTALL.MAIN
                }
              });
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
