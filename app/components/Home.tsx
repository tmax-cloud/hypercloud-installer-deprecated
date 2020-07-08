import React, {useReducer} from 'react';
// import { Link } from 'react-router-dom';
// import { template } from '@babel/core';
// import routes from '../constants/routes.json';
import InstallPage from '../containers/InstallPage';
import EnvPage from '../containers/EnvPage';
import CONST from '../constants/constant';

// component간 depth가 깊어지면
// props전달로는 한계가 있으므로
// Context를 활용
export const HomePageContext = React.createContext();

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

export default function Home() {
  const [homePageState, dispatchHomePage] = useReducer(reducer, initialState);
  console.log('aaa');
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
      <div data-tid="container">
        {/* <h2>Home</h2>
        <Link to={routes.COUNTER}>to Counter</Link> */}
        {/* <header>
          <h2>Cities</h2>
        </header> */}

        {getPage()}

        {/* <Menu />
        <Content /> */}

        {/* <footer>
          <p>Footer</p>
        </footer> */}
      </div>
    </HomePageContext.Provider>
  );
}
