/* eslint-disable import/no-cycle */
import React, { useReducer } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Redirect } from 'react-router';
import InstallPage from './InstallPage';
import EnvPage from './EnvPage';
import routes from '../utils/constants/routes.json';
import * as env from '../utils/common/env';

// component간 depth가 깊어지면
// props전달로는 한계가 있으므로
// Context를 활용
export const AppContext = React.createContext('');

const initialState = {
  kubeinstallState: {
    version: '1.17.6',
    registry: ''
  }
};
const reducer = (state: any, action: any) => {
  if (action.type === 'set_nowEnv') {
    state.nowEnv = action.nowEnv;
  } else if (action.type === 'set_kubeinstallState') {
    state.kubeinstallState = action.kubeinstallState;
  }
  return state;
  // return { ...state, ...action };
};

function HomePage(props: any) {
  console.debug('HomePage', props);

  const [appState, dispatchAppState] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider
      value={{
        appState,
        dispatchAppState
      }}
    >
      <Switch>
        <Route path={routes.ENV.HOME} component={EnvPage} />
        <Route
          path={`${routes.INSTALL.HOME}/:envName`}
          component={InstallPage}
        />
        <Redirect path={routes.HOME} to={routes.ENV.HOME} />
      </Switch>
    </AppContext.Provider>
  );
}

export default HomePage;
