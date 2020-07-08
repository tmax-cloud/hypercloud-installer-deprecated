import React, { useReducer } from 'react';
import CONST from '../constants/constant';
import InstallPage from './InstallPage';
import EnvPage from './EnvPage';

// component간 depth가 깊어지면
// props전달로는 한계가 있으므로
// Context를 활용
export const HomePageContext = React.createContext('');

const initialState = { mode: CONST.HOME.ENV };
const reducer = (state, action) => {
  switch (action) {
    case CONST.HOME.INSTALL:
      return { mode: CONST.HOME.INSTALL };
    case CONST.HOME.ENV:
      return { mode: CONST.HOME.ENV };
    default:
      throw new Error();
  }
};

export default function HomePage() {
  const [homePageState, dispatchHomePage] = useReducer(reducer, initialState);

  const getPage = () => {
    switch (homePageState.mode) {
      case CONST.HOME.INSTALL:
        return <InstallPage />;
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
    // <Home />
  );
}

// export default HomePage;
