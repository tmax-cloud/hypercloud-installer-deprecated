import React, { useContext, useReducer } from 'react';
import InstallLnb from '../components/install/InstallLnb';
import InstallContents from '../components/install/InstallContents';
import layout from './InstallPage.css';
import { AppContext } from './HomePage';
import * as env from '../utils/common/env';


function InstallPage(props: any) {
  console.debug(InstallPage.name, props);
  const { history, location, match } = props;

  // dispatchAppState({
  //   type: 'set_nowEnv',
  //   nowEnv: env.loadEnvByName(match.params.envName)
  // });

  const [clicked, setClicked] = React.useState('');

  return (
    <div className={[layout.wrap].join(' ')}>
      <InstallLnb
        history={history}
        location={location}
        match={match}
        clicked={clicked}
        setClicked={setClicked}
      />
      <InstallContents
        history={history}
        location={location}
        match={match}
        clicked={clicked}
        setClicked={setClicked}
      />
    </div>
  );
}

export default InstallPage;
