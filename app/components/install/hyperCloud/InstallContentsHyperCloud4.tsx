import React from 'react';
import { Button } from '@material-ui/core';
import styles from '../InstallContents4.css';
import CONST from '../../../utils/constants/constant';
import * as env from '../../../utils/common/env';
// import FinishImage from '../../../../resources/assets/img_finish_mint.svg';
import FinishImage from '../../../../resources/assets/img_finish_blue.svg';
import routes from '../../../utils/constants/routes.json';

function InstallContentsHyperCloud4(props: any) {
  console.debug(InstallContentsHyperCloud4.name, props);
  const { history, match, state } = props;

  const nowEnv = env.loadEnvByName(match.params.envName);

  // nowEnv.deleteProductByName(CONST.PRODUCT.HYPERCLOUD.NAME);
  // nowEnv.addProduct({
  //   name: CONST.PRODUCT.HYPERCLOUD.NAME,
  //   operator_version: state.operator_version,
  //   webhook_version: state.webhook_version,
  //   console_version: state.console_version
  // });
  // // json 파일 저장
  // env.updateEnv(nowEnv.name, nowEnv);

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
        {getRegistryJsx()}
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
