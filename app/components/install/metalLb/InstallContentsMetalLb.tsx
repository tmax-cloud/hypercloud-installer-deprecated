import React, { useState } from 'react';
import { Switch, Route } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsMetalLb1 from './InstallContentsMetalLb1';
import InstallContentsMetalLb2 from './InstallContentsMetalLb2';
import InstallContentsMetalLb3 from './InstallContentsMetalLb3';
import InstallContentsMetalLb4 from './InstallContentsMetalLb4';
import InstallContentsMetalLbAlready from './InstallContentsMetalLbAlready';
import InstallKubePlease from '../InstallKubePlease';
import MetalLbInstaller from '../../../utils/class/installer/MetalLbInstaller';

function InstallContentsMetalLb(props: any) {
  console.debug(InstallContentsMetalLb.name, props);
  const { history, location, match } = props;

  const [state, setState] = useState({
    version: MetalLbInstaller.METALLB_VERSION,
    data: []
  });

  return (
    <div className={['childUpDownCenter', styles.wrap].join(' ')}>
      <Switch>
        <Route
          path={`${match.path}/step1`}
          component={InstallContentsMetalLb1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsMetalLb2
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
            <InstallContentsMetalLb3
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
            <InstallContentsMetalLb4
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
          component={InstallContentsMetalLbAlready}
        />
        <Route
          path={`${match.path}/impossible`}
          component={InstallKubePlease}
        />
      </Switch>
    </div>
  );
}

export default InstallContentsMetalLb;
