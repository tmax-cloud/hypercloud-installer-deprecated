/* eslint-disable import/no-cycle */
import React, { useReducer } from 'react';
import EnvHeader from '../components/env/EnvHeader';
import EnvContents from '../components/env/EnvContents';
import CONST from '../utils/constants/constant';
import { Switch, Route } from 'react-router-dom';
import CounterPage from './CounterPage';
import HomePage from './HomePage';
import InstallPage from './InstallPage';
import routes from './constants/routes.json';
import env from '../reducers/env';

// component간 depth가 깊어지면
// props전달로는 한계가 있으므로
// Context를 활용
export const EnvPageContext = React.createContext('');

const initialState = { mode: CONST.ENV.MANAGE };
const reducer = (state, action) => {
  switch (action) {
    case CONST.ENV.MANAGE:
      return { mode: CONST.ENV.MANAGE };
    case CONST.ENV.ADD:
      return { mode: CONST.ENV.ADD };
    default:
      throw new Error();
  }
};

function EnvPage(props: any) {
  const [envPageState, dispatchEnvPage] = useReducer(reducer, initialState);
  return (
    <EnvPageContext.Provider
      value={{
        envPageState,
        dispatchEnvPage
      }}
    >
      <div>
        <EnvHeader />
        <EnvContents />
      </div>
    </EnvPageContext.Provider>
  );
}

export default EnvPage;
