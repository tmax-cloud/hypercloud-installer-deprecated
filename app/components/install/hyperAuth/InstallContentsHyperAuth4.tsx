import React from 'react';
import { Button } from '@material-ui/core';
import styles from '../InstallContents4.css';
import CONST from '../../../utils/constants/constant';
import * as env from '../../../utils/common/env';
import FinishImage from '../../../../resources/assets/img_finish.svg';
import routes from '../../../utils/constants/routes.json';

function InstallContentsHyperAuth4(props: any) {
  console.debug(InstallContentsHyperAuth4.name, props);
  const { history, match, state } = props;

  const nowEnv = env.loadEnvByName(match.params.envName);

  // nowEnv.deleteProductByName(CONST.PRODUCT.HYPERAUTH.NAME);
  // nowEnv.addProduct({
  //   name: CONST.PRODUCT.HYPERAUTH.NAME,
  //   version: state.version
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
            <span className={['medium', 'thick'].join(' ')}>Version</span>
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

export default InstallContentsHyperAuth4;
