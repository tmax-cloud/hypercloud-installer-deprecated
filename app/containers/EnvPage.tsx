import React, { useReducer } from 'react';
import EnvHeader from '../components/EnvHeader';
import EnvContents from '../components/EnvContents';
import CONST from '../constants/constant';

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
    case CONST.ENV.TEST_ADD:
      return { mode: CONST.ENV.TEST_ADD };
    default:
      throw new Error();
  }
};

function EnvPage() {
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
