import React, { useState } from 'react';
import { Switch, Route } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsHyperCloud1 from './InstallContentsHyperCloud1';
import InstallContentsHyperCloud2 from './InstallContentsHyperCloud2';
import InstallContentsHyperCloud3 from './InstallContentsHyperCloud3';
import InstallContentsHyperCloud4 from './InstallContentsHyperCloud4';
import InstallContentsHyperCloudAlready from './InstallContentsHyperCloudAlready';
import InstallKubePlease from '../InstallKubePlease';
import HyperCloudOperatorInstaller from '../../../utils/class/installer/HyperCloudOperatorInstaller';
import HyperCloudWebhookInstaller from '../../../utils/class/installer/HyperCloudWebhookInstaller';
import HyperCloudConsoleInstaller from '../../../utils/class/installer/HyperCloudConsoleInstaller';
import InstallContentsHyperCloud2Network from './InstallContentsHyperCloud2Network';
import InstallContentsHyperCloud2Admin from './InstallContentsHyperCloud2Admin';

function InstallContentsHyperCloud(props: any) {
  console.debug(InstallContentsHyperCloud.name, props);
  const { history, location, match } = props;

  const [state, setState] = useState({
    operator_version: HyperCloudOperatorInstaller.HPCD_VERSION,
    webhook_version: HyperCloudWebhookInstaller.WEBHOOK_VERSION,
    console_version: HyperCloudConsoleInstaller.CONSOLE_VERSION,
    isUseIngress: true,
    sharedIngress: true,
    systemIngress: true,
    email: '',
    password: ''
  });

  return (
    <div className={['childUpDownCenter', styles.wrap].join(' ')}>
      <Switch>
        <Route
          path={`${match.path}/step1`}
          component={InstallContentsHyperCloud1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsHyperCloud2
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/step2-network`}
          render={() => (
            <InstallContentsHyperCloud2Network
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/step2-admin`}
          render={() => (
            <InstallContentsHyperCloud2Admin
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
            <InstallContentsHyperCloud3
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
            <InstallContentsHyperCloud4
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
          component={InstallContentsHyperCloudAlready}
        />
        <Route
          path={`${match.path}/impossible`}
          component={InstallKubePlease}
        />
      </Switch>
    </div>
  );
}

export default InstallContentsHyperCloud;
