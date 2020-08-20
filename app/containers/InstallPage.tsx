import React, { useContext } from 'react';
import InstallLnb from '../components/install/InstallLnb';
import InstallContents from '../components/install/InstallContents';
import layout from './InstallPage.css';
import { AppContext } from './HomePage';
import * as env from '../utils/common/env';

function InstallPage(props: any) {
  console.debug(InstallPage.name, props);
  const { history, location, match } = props;

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  // dispatchAppState({
  //   type: 'set_nowEnv',
  //   nowEnv: env.loadEnvByName(match.params.envName)
  // });

  return (
    <div className={[layout.wrap].join(' ')}>
      <InstallLnb history={history} location={location} match={match} />
      <InstallContents history={history} location={location} match={match} />
    </div>
  );
}

export default InstallPage;
