import React, { useContext, useEffect } from 'react';
import { AppContext } from './HomePage';
import * as env from '../utils/common/env';
import InstallLnb from '../components/install/InstallLnb';
import InstallContents from '../components/install/InstallContents';
import layout from './InstallPage.css';

// component간 depth가 깊어지면
// props전달로는 한계가 있으므로
// Context를 활용
// export const InstallPageContext = React.createContext('');

// const initialState = { mode: CONST.INSTALL.MAIN };
// const reducer = (state, action) => {
//   switch (action.type) {
//     case 'SET_MODE':
//       return { ...state, ...action.data };
//     case 'SET_ENV':
//       return { ...state, ...action.data };
//     default:
//       throw new Error();
//   }
// };

function InstallPage(props: any) {
  console.debug('InstallPage');

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const { history, location, match } = props;
  console.log(props);

  useEffect(() => {
    dispatchAppState({
      env: env.getEnvByName(props.match.params.envName)
    });
    // console.log(appState);
  }, []);

  const getCompenent = () => {
    if (appState.env) {
      return (
        <div className={[layout.wrap].join(' ')}>
          <InstallLnb history={history} location={location} match={match} />
          <InstallContents
            history={history}
            location={location}
            match={match}
          />
        </div>
      );
    } else {
      return <></>
    }
  }
  return <>{getCompenent()}</>;
}

export default InstallPage;
