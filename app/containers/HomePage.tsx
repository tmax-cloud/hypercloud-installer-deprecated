/* eslint-disable import/no-cycle */
import React, { useReducer } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Redirect } from 'react-router';
import InstallPage from './InstallPage';
import EnvPage from './EnvPage';
import routes from '../utils/constants/routes.json';

// component간 depth가 깊어지면
// props전달로는 한계가 있으므로
// Context를 활용
export const AppContext = React.createContext('');

const initialState = {
  env: null
};
const reducer = (state: any, action: any) => {
  return { ...state, ...action };
};

function HomePage() {
  console.debug('HomePage');

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
        <Redirect path="/" to={routes.ENV.HOME} />
      </Switch>
    </AppContext.Provider>
  );
}

export default HomePage;
