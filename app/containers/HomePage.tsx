/* eslint-disable import/no-cycle */
import React, { useReducer } from 'react';
import { Switch } from 'react-router';
import { Route } from 'react-router-dom';
import CONST from '../utils/constants/constant';
import InstallPage from './InstallPage';
import EnvPage from './EnvPage';
import routes from '../../utils/constants/routes.json';
import env from '../../utils/constants/env.json';
import EnvContentsExist from '../components/env/EnvContentsExist';
import EnvContentsNotExist from '../components/env/EnvContentsNotExist';
import EnvContentsAdd from '../components/env/EnvContentsAdd';
import EnvManagePage from './EnvManagePage';
import EnvEmptyPage from './EnvEmptyPage';

// component간 depth가 깊어지면
// props전달로는 한계가 있으므로
// Context를 활용
export const HomePageContext = React.createContext('');

const initialState = {
  mode: CONST.HOME.ENV,
  env: null
};
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, ...action.data };
    default:
      throw new Error();
  }
};

function HomePage() {
  const [homePageState, dispatchHomePage] = useReducer(reducer, initialState);

  const getPage = () => {
    switch (homePageState.mode) {
      case CONST.HOME.INSTALL:
        return <InstallPage env={homePageState.env} />;
      case CONST.HOME.ENV:
        return <EnvPage />;
      default:
        throw new Error();
    }
  };

  return (
    <HomePageContext.Provider
      value={{
        homePageState,
        dispatchHomePage
      }}
    >
      {getPage()}
    </HomePageContext.Provider>
  );
}

export default HomePage;
