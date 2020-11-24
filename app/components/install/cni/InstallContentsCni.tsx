import React, { useState } from 'react';
import { Switch, Route } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsCni1 from './InstallContentsCni1';
import InstallContentsCni2 from './InstallContentsCni2';
import InstallContentsCni3 from './InstallContentsCni3';
import InstallContentsCni4 from './InstallContentsCni4';
import InstallContentsCniAlready from './InstallContentsCniAlready';
import InstallKubePlease from '../InstallKubePlease';
import CniInstaller from '../../../utils/class/installer/CniInstaller';

function InstallContentsCni(props: any) {
  console.debug(InstallContentsCni.name, props);
  const { history, location, match } = props;

  const [state, setState] = useState({
    version: CniInstaller.CNI_VERSION,
    type: 'Calico'
  });

  return (
    <div className={['childUpDownCenter', styles.wrap].join(' ')}>
      {/* {getComponent()} */}
      <Switch>
        <Route path={`${match.path}/step1`} component={InstallContentsCni1} />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsCni2
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
            <InstallContentsCni3
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
            <InstallContentsCni4
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
          component={InstallContentsCniAlready}
        />
        <Route
          path={`${match.path}/impossible`}
          component={InstallKubePlease}
        />
      </Switch>
    </div>
  );
}

export default InstallContentsCni;
