import React, { useContext } from 'react';
import { Switch } from 'react-router';
import env from '../constants/env.json';
import EnvContentsExist from './EnvContentsExist';
import EnvContentsNotExist from './EnvContentsNotExist';
import EnvContentsAdd from './EnvContentsAdd';
import EnvContentsAddCopy from './EnvContentsAddCopy';
import styles from './EnvContents.css';
import CONST from '../constants/constant';
import { EnvPageContext } from '../containers/EnvPage';

function EnvContents() {
  // const { mode, setMode } = props;
  const envPageContext = useContext(EnvPageContext);
  const { envPageState, dispatchEnvPage } = envPageContext;

  const getDefaultComponent = () => {
    let component;
    if (envPageState.mode === CONST.ENV.MANAGE) {
      if (env.length > 0) {
        component = <EnvContentsExist env={env} />;
      } else {
        component = <EnvContentsNotExist dispatchEnvPage={dispatchEnvPage} />;
      }
    } else if (envPageState.mode === CONST.ENV.ADD) {
      component = <EnvContentsAdd dispatchEnvPage={dispatchEnvPage} />;
    } else if (envPageState.mode === CONST.ENV.TEST_ADD) {
      console.log('test add');
      component = <EnvContentsAddCopy dispatchEnvPage={dispatchEnvPage} />;
    }

    return component;
  };
  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      <Switch>
        {/* <Route
          path={routes.ENV_EXIST}
          render={() => {
            return <EnvContentsExist env={env} />;
          }}
        />
        <Route path={routes.ENV_ADD} component={EnvContentsAdd} />
        <Route path={routes.ENV_NOT_EXIST} component={EnvContentsNotExist} /> */}
        {getDefaultComponent()}
      </Switch>
    </div>
  );
}

export default EnvContents;
