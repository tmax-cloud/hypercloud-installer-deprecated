import MuiBox from '@material-ui/core/Box';
import React, { useContext } from 'react';
import { Button } from '@material-ui/core';
import styles from './InstallContentsKubernetes1.css';
import { AppContext } from '../../containers/HomePage';
import { KubeInstallContext } from './InstallContentsKubernetes';
import routes from '../../utils/constants/routes.json';
import KubernetesImage from '../../../resources/assets/Kubernetes_logo.png';
import * as env from '../../utils/common/env';

function InstallContentsKubernetes1(props: any) {
  console.log('InstallContentsKubernetes1');

  const { history, location, match } = props;
  console.debug(props);

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

  const nowEnv = env.getEnvByName(match.params.envName);

  const defaultProps = {
    bgcolor: 'background.paper',
    borderColor: 'text.primary',
    m: 1,
    border: 1,
    style: { width: '20rem', height: '20rem' }
  };

  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      <div>
        <div className={styles.contents}>
          <div className="childLeftRightCenter">
            <MuiBox
              className={["childUpDownCenter", styles.circle].join(' ')}
              borderRadius="50%"
              {...defaultProps}
            >
              <div className={[styles.insideCircle].join(' ')}>
                <div>
                  <img src={KubernetesImage} alt="Logo" />
                </div>
                <div>
                  <span className={['large', 'thick'].join(' ')}>Kubernetes</span>
                </div>
                <div>
                  <span className={['small', 'lightDark'].join(' ')}>
                    컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스
                  </span>
                </div>
              </div>
            </MuiBox>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>쿠버네티스를 설치할 수 있습니다.</span>
            <br />
            <span className={['medium', 'lightDark'].join(' ')}>계속하시려면, 아래의 버튼을 클릭해 주세요.</span>
          </div>
          <div>
            <Button
              variant="contained"
              className={['blue'].join(' ')}
              size="large"
              onClick={() => {
                // dispatchKubeInstall({
                //   page: 2
                // });
                history.push(`${routes.INSTALL.HOME}/${nowEnv.name}/kubernetes/step2`);
              }}
            >
              다음 >
            </Button>
          </div>
        </div>
        {/* <button
          type="button"
          onClick={() => {
            abc();
          }}
        >
          test
        </button>
        <span>{cnt}</span>
        <textarea value={stdout} disabled />
        <textarea value={stderr} disabled />
        <LinearProgressWithLabel value={progress} /> */}
      </div>
    </div>
  );
}

export default InstallContentsKubernetes1;
