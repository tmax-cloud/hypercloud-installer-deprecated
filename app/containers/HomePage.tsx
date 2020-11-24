import { remote } from 'electron';
import React, { useReducer } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Redirect } from 'react-router';
import { CircularProgress, makeStyles, createStyles } from '@material-ui/core';
import { rootPath } from 'electron-root-path';
import InstallPage from './InstallPage';
import EnvPage from './EnvPage';
import routes from '../utils/constants/routes.json';
import { AppContext, initialState, reducer } from './AppContext';
import zIndex from '@material-ui/core/styles/zIndex';

// component간 depth가 깊어지면
// props전달로는 한계가 있으므로
// Context를 활용
// export const AppContext = React.createContext({});

// const initialState = {
//   loading: false
// };
// const reducer = (state: any, action: any) => {
//   if (action.type === 'set_loading') {
//     return { ...state, ...action };
//   }
//   return state;
// };

const useStyles = makeStyles(() =>
  createStyles({
    // loading progress bar
    loadingProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -40,
      marginLeft: -40,
      zIndex: 100
    },
    // 로딩 중 화면 css
    loading: {
      pointerEvents: 'none',
      opacity: '0.5',
      height: '100%'
    },
    notLoading: {
      height: '100%'
    }
  })
);

function HomePage() {
  console.debug('rootPath', rootPath);
  console.debug('__dirname', __dirname);
  console.debug(`remote.app.getPath('home')`, remote.app.getPath('home'));
  console.debug(HomePage.name);

  const [appState, dispatchAppState] = useReducer(reducer, initialState);

  const classes = useStyles();
  return (
    <AppContext.Provider
      value={{
        appState,
        dispatchAppState
      }}
    >
      <div className={appState.loading ? classes.loading : classes.notLoading}>
        {appState.loading && (
          <CircularProgress
            color="secondary"
            size={50}
            className={classes.loadingProgress}
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
