import React, { useReducer, useContext, useEffect, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsCatalogController1 from './InstallContentsCatalogController1';
import InstallContentsCatalogController2 from './InstallContentsCatalogController2';
import InstallContentsCatalogController3 from './InstallContentsCatalogController3';
import InstallContentsCatalogController4 from './InstallContentsCatalogController4';
import InstallContentsCatalogControllerAlready from './InstallContentsCatalogControllerAlready';
import InstallKubePlease from '../InstallKubePlease';
import HyperAuthInstaller from '../../../utils/class/installer/HyperAuthInstaller';
import HyperCloudOperatorInstaller from '../../../utils/class/installer/HyperCloudOperatorInstaller';
import HyperCloudWebhookInstaller from '../../../utils/class/installer/HyperCloudWebhookInstaller';
import HyperCloudConsoleInstaller from '../../../utils/class/installer/HyperCloudConsoleInstaller';

function InstallContentsCatalogController(props: any) {
  console.debug(InstallContentsCatalogController.name, props);
  const { history, location, match } = props;

  const [state, setState] = useState({
    operator_version: HyperCloudOperatorInstaller.HPCD_VERSION,
    webhook_version: HyperCloudWebhookInstaller.WEBHOOK_VERSION,
    console_version: HyperCloudConsoleInstaller.CONSOLE_VERSION
  });

  return (
    <div className={['childUpDownCenter', styles.wrap].join(' ')}>
      <Switch>
        <Route
          path={`${match.path}/step1`}
          component={InstallContentsCatalogController1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsCatalogController2
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
            <InstallContentsCatalogController3
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
            <InstallContentsCatalogController4
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
          component={InstallContentsCatalogControllerAlready}
        />
        <Route
          path={`${match.path}/impossible`}
          component={InstallKubePlease}
        />
      </Switch>
    </div>
  );
}

export default InstallContentsCatalogController;
