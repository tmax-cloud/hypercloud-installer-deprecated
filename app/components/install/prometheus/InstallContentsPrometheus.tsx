import React, { useState } from 'react';
import { Switch, Route } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsPrometheus1 from './InstallContentsPrometheus1';
import InstallContentsPrometheus2 from './InstallContentsPrometheus2';
import InstallContentsPrometheus3 from './InstallContentsPrometheus3';
import InstallContentsPrometheus4 from './InstallContentsPrometheus4';
import InstallContentsPrometheusAlready from './InstallContentsPrometheusAlready';
import InstallKubePlease from '../InstallKubePlease';
import PrometheusInstaller from '../../../utils/class/installer/PrometheusInstaller';

function InstallContentsPrometheus(props: any) {
  console.debug(InstallContentsPrometheus.name, props);
  const { history, location, match } = props;

  const [state, setState] = useState({
    version: PrometheusInstaller.PROMETHEUS_VERSION,
    isUsePvc: 'true',
    serviceType: '',
    port: ''
  });

  return (
    <div className={['childUpDownCenter', styles.wrap].join(' ')}>
      {/* {getComponent()} */}
      <Switch>
        <Route
          path={`${match.path}/step1`}
          component={InstallContentsPrometheus1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsPrometheus2
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
            <InstallContentsPrometheus3
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
            <InstallContentsPrometheus4
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
          component={InstallContentsPrometheusAlready}
        />
        <Route
          path={`${match.path}/impossible`}
          component={InstallKubePlease}
        />
      </Switch>
    </div>
  );
}

export default InstallContentsPrometheus;
