/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';
import * as env from '../../utils/common/env';
import EnvContentsExist from './EnvContentsExist';
import EnvContentsNotExist from './EnvContentsNotExist';
import EnvContentsAdd from './EnvContentsAdd';
import styles from './EnvContents.css';
import CONST from '../../utils/constants/constant';
import { EnvPageContext } from '../../containers/EnvPage';

function EnvContents() {
  // const { mode, setMode } = props;
  const envPageContext = useContext(EnvPageContext);
  const { envPageState, dispatchEnvPage } = envPageContext;

  const getComponent = () => {
    let component;
    if (envPageState.mode === CONST.ENV.MANAGE) {
      if (env.loadEnv().length > 0) {
        component = <EnvContentsExist />;
      } else {
        component = <EnvContentsNotExist dispatchEnvPage={dispatchEnvPage} />;
      }
    } else if (envPageState.mode === CONST.ENV.ADD) {
      component = <EnvContentsAdd dispatchEnvPage={dispatchEnvPage} />;
    }

    return component;
  };

  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      {getComponent()}
    </div>
  );
}

export default EnvContents;
