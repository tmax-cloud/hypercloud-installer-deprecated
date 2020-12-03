import React from 'react';
import { Button } from '@material-ui/core';
import styles from '../InstallContents4.css';
// import { InstallPageContext } from '../../containers/InstallPage';
import * as env from '../../../utils/common/env';
// import FinishImage from '../../../../resources/assets/img_finish_mint.svg';
import FinishImage from '../../../../resources/assets/img_finish_blue.svg';
import routes from '../../../utils/constants/routes.json';

function InstallContentsPrometheus4(props: any) {
  console.debug(InstallContentsPrometheus4.name, props);
  const { history, match, state } = props;

  const nowEnv = env.loadEnvByName(match.params.envName);

  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '50px' }}>
          <img src={FinishImage} alt="Logo" />
        </div>
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>Version</span>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>
              {state.version}
            </span>
          </div>
        </div>
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>PVC</span>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>
              {state.isUsePvc ? '사용함' : '사용안함'}
            </span>
          </div>
        </div>
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>Service</span>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>
              {state.serviceType}/{state.port}
            </span>
          </div>
        </div>
        <div>
          <Button
            variant="contained"
            className={['secondary'].join(' ')}
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

export default InstallContentsPrometheus4;
