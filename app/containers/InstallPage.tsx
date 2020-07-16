import React, { useReducer } from 'react';
import InstallLnb from '../components/install/InstallLnb';
import InstallContents from '../components/install/InstallContents';
import CONST from '../utils/constants/constant';

// component간 depth가 깊어지면
// props전달로는 한계가 있으므로
// Context를 활용
export const InstallPageContext = React.createContext('');

const initialState = { mode: CONST.INSTALL.MAIN };
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, ...action.data };
    default:
      throw new Error();
  }
};

function InstallPage(props: any) {
  const { node } = props;
  const [installPageState, dispatchInstallPage] = useReducer(reducer, {
    mode: CONST.INSTALL.MAIN,
    node
  });
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
