import React, { useState } from 'react';
import { Switch, Route } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsHyperAuth1 from './InstallContentsHyperAuth1';
import InstallContentsHyperAuth2 from './InstallContentsHyperAuth2';
import InstallContentsHyperAuth3 from './InstallContentsHyperAuth3';
import InstallContentsHyperAuth4 from './InstallContentsHyperAuth4';
import InstallContentsHyperAuthAlready from './InstallContentsHyperAuthAlready';
import InstallKubePlease from '../InstallKubePlease';
import HyperAuthInstaller from '../../../utils/class/installer/HyperAuthInstaller';

function InstallContentsHyperAuth(props: any) {
  console.debug(InstallContentsHyperAuth.name, props);
  const { history, location, match } = props;

  const [state, setState] = useState({
    version: HyperAuthInstaller.HYPERAUTH_VERSION
  });

  return (
    <div className={['childUpDownCenter', styles.wrap].join(' ')}>
      <Switch>
        <Route
          path={`${match.path}/step1`}
          component={InstallContentsHyperAuth1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsHyperAuth2
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/step3`}
          render={() => (
            <InstallContentsHyperAuth3
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/step4`}
          render={() => (
            <InstallContentsHyperAuth4
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/already`}
          component={InstallContentsHyperAuthAlready}
        />
        <Route
          path={`${match.path}/impossible`}
          component={InstallKubePlease}
        />
      </Switch>
    </div>
  );
}

export default InstallContentsHyperAuth;
