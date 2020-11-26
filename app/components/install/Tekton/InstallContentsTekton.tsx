import React, { useState } from 'react';
import { Switch, Route } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsTekton1 from './InstallContentsTekton1';
import InstallContentsTekton2 from './InstallContentsTekton2';
import InstallContentsTekton3 from './InstallContentsTekton3';
import InstallContentsTekton4 from './InstallContentsTekton4';
import InstallContentsTektonAlready from './InstallContentsTektonAlready';
import InstallKubePlease from '../InstallKubePlease';
import TektonApprovalInstaller from '../../../utils/class/installer/TektonApprovalInstaller';
import TektonCiCdTemplatesInstaller from '../../../utils/class/installer/TektonCiCdTemplatesInstaller';
import TektonMailNotifierInstaller from '../../../utils/class/installer/TektonMailNotifierInstaller';
import TektonPipelineInstaller from '../../../utils/class/installer/TektonPipelineInstaller';
import TektonTriggerInstaller from '../../../utils/class/installer/TektonTriggerInstaller';

function InstallContentsTekton(props: any) {
  console.debug(InstallContentsTekton.name, props);
  const { history, location, match } = props;

  const [state, setState] = useState({
    pipeline_version: TektonPipelineInstaller.VERSION,
    trigger_version: TektonTriggerInstaller.VERSION,
    approval_version: TektonApprovalInstaller.VERSION,
    mailNotifier_version: TektonMailNotifierInstaller.VERSION,
    cicdTemplates_version: TektonCiCdTemplatesInstaller.VERSION
  });

  return (
    <div className={['childUpDownCenter', styles.wrap].join(' ')}>
      <Switch>
        <Route
          path={`${match.path}/step1`}
          component={InstallContentsTekton1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsTekton2
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
            <InstallContentsTekton3
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
            <InstallContentsTekton4
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
          component={InstallContentsTektonAlready}
        />
        <Route
          path={`${match.path}/impossible`}
          component={InstallKubePlease}
        />
      </Switch>
    </div>
  );
}

export default InstallContentsTekton;
