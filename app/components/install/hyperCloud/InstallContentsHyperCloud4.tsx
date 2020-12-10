import React from 'react';
import { Button } from '@material-ui/core';
import styles from '../InstallContents4.css';
import * as env from '../../../utils/common/env';
// import FinishImage from '../../../../resources/assets/img_finish_mint.svg';
import FinishImage from '../../../../resources/assets/img_finish_blue.svg';
import routes from '../../../utils/constants/routes.json';

function InstallContentsHyperCloud4(props: any) {
  console.debug(InstallContentsHyperCloud4.name, props);
  const { history, match, state } = props;

  const nowEnv = env.loadEnvByName(match.params.envName);

  const getNetworkJsx = state => {
    let jsx;
    if (state.isUseIngress) {
      jsx = (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>- 인그레스</span>
            <span>사용함</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>- 인그레스 컨트롤러</span>
            <span>
              {state.sharedIngress ? '사용자 공용' : ''}
              {state.sharedIngress && state.systemIngress ? ',' : ''}
              {state.systemIngress ? '시스템' : ''}
            </span>
          </div>
        </div>
      );
    } else {
      jsx = (
        <div style={{ marginBottom: '30px' }}>
          <span>- 인그레스</span>
          <span>사용안함</span>
        </div>
      );
    }
    return jsx;
  };
  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      <div style={{ textAlign: 'center', width: '300px' }}>
        <div style={{ marginBottom: '50px' }}>
          <img src={FinishImage} alt="Logo" />
        </div>
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>
              Operator Version
            </span>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>
              {state.operator_version}
            </span>
          </div>
        </div>
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>
              Webhook Version
            </span>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>
              {state.webhook_version}
            </span>
          </div>
        </div>
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>
              Console Version
            </span>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>
              {state.console_version}
            </span>
          </div>
        </div>
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>네트워크</span>
          </div>
          <div>
            <span className={['lightDark'].join(' ')}>
              {getNetworkJsx(state)}
            </span>
          </div>
        </div>
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>관리자 계정</span>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>
              {state.email}
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

export default InstallContentsHyperCloud4;
