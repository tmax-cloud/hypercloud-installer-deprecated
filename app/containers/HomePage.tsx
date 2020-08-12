/* eslint-disable no-console */
/* eslint-disable import/no-cycle */
import React, { useReducer } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Redirect } from 'react-router';
import {
  CircularProgress,
  makeStyles,
  Theme,
  createStyles
} from '@material-ui/core';
import { rootPath } from 'electron-root-path';
import InstallPage from './InstallPage';
import EnvPage from './EnvPage';
import routes from '../utils/constants/routes.json';
import Data from '../utils/class/Data';
import * as env from '../utils/common/env';

// component간 depth가 깊어지면
// props전달로는 한계가 있으므로
// Context를 활용
export const AppContext = React.createContext('');

const initialState = {
  kubeinstallState: {
    version: '1.17.6',
    registry: ''
  },
  loading: false
  // data: new Data(env.loadEnvList())
};
const reducer = (state: any, action: any) => {
  if (action.type === 'set_nowEnv') {
    state.nowEnv = action.nowEnv;
  } else if (action.type === 'set_kubeinstallState') {
    state.kubeinstallState = action.kubeinstallState;
  } else if (action.type === 'set_loading') {
    return { ...state, ...action };
  }
  return state;
  // return { ...state, ...action };
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    // buttonSuccess: {
    //   backgroundColor: green[500],
    //   '&:hover': {
    //     backgroundColor: green[700]
    //   }
    // },
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -40,
      marginLeft: -40
    }
  })
);

function HomePage(props: any) {
  console.debug('rootPath', rootPath);
  console.debug('__dirname', __dirname);
  console.debug(HomePage.name, props);

  const [appState, dispatchAppState] = useReducer(reducer, initialState);
  console.debug('appState', appState);

  const classes = useStyles();
  return (
    <AppContext.Provider
      value={{
        appState,
        dispatchAppState
      }}
    >
      <div
        style={
          appState.loading
            ? {
                height: '100%',
                pointerEvents: 'none',
                opacity: '0.5'
              }
            : {
                height: '100%'
              }
        }
      >
        {appState.loading && (
          <CircularProgress
            color="secondary"
            size={40}
            className={classes.buttonProgress}
          />
        )}
        <Switch>
          <Route path={routes.ENV.HOME} component={EnvPage} />
          <Route
            path={`${routes.INSTALL.HOME}/:envName`}
            component={InstallPage}
          />
          <Redirect path={routes.HOME} to={routes.ENV.HOME} />
        </Switch>
      </div>
    </AppContext.Provider>
  );
}

export default HomePage;
