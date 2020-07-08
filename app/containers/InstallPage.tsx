import React, { useReducer } from 'react';
import InstallLnb from '../components/InstallLnb';
import InstallContents from '../components/InstallContents';
import CONST from '../constants/constant';

// component간 depth가 깊어지면
// props전달로는 한계가 있으므로
// Context를 활용
export const InstallPageContext = React.createContext('');

const initialState = { mode: CONST.INSTALL.MAIN };
const reducer = (state, action) => {
  switch (action) {
    case CONST.INSTALL.MAIN:
      return { mode: CONST.INSTALL.MAIN };
    default:
      throw new Error();
  }
};

function InstallPage() {
  const [installPageState, dispatchInstallPage] = useReducer(
    reducer,
    initialState
  );
  return (
    <InstallPageContext.Provider
      value={{
        installPageState,
        dispatchInstallPage
      }}
    >
      <InstallLnb />
      <InstallContents />
    </InstallPageContext.Provider>
  );
}

export default InstallPage;
