import React, { useContext } from 'react';
import styles from './InstallContentsKubernetes4.css';
import { InstallPageContext } from '../../containers/InstallPage';
import CONST from '../../utils/constants/constant';
import { Button } from '@material-ui/core';
import { KubeInstallContext } from './InstallContentsKubernetes';

function InstallContentsKubernetes4() {
  const installPageContext = useContext(InstallPageContext);
  const { installPageState, dispatchInstallPage } = installPageContext;

  const kubeInstallContext = useContext(KubeInstallContext);
  const { kubeInstallState, dispatchKubeInstall } = kubeInstallContext;

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
