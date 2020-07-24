import React, { useContext } from 'react';
import InstallLnb from '../components/install/InstallLnb';
import InstallContents from '../components/install/InstallContents';
import layout from './InstallPage.css';
import { AppContext } from './HomePage';
import * as env from '../utils/common/env';

function InstallPage(props: any) {
  console.debug('InstallPage');

  const { history, location, match } = props;
  console.debug(props);

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  console.log(env.getEnvByName(match.params.envName));
  dispatchAppState({
    type: 'set_nowEnv',
    nowEnv: env.getEnvByName(match.params.envName)
  });

  return (
    <div className={[layout.wrap].join(' ')}>
      <InstallLnb history={history} location={location} match={match} />
      <InstallContents history={history} location={location} match={match} />
    </div>
  );
}

export default InstallPage;
