import React, { useState } from 'react';
import { Switch, Route } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsKubernetes1 from './InstallContentsKubernetes1';
import InstallContentsKubernetes2 from './InstallContentsKubernetes2';
import InstallContentsKubernetes3 from './InstallContentsKubernetes3';
import InstallContentsKubernetes4 from './InstallContentsKubernetes4';
import InstallContentsKubernetesAlready from './InstallContentsKubernetesAlready';
import KubernetesInstaller from '../../../utils/class/installer/KubernetesInstaller';

function InstallContentsKubernetes(props: any) {
  console.debug(InstallContentsKubernetes.name, props);
  const { history, location, match } = props;

  const [state, setState] = useState({
    version: KubernetesInstaller.K8S_VERSION,
    registry: '',
    podSubnet: ''
  });

  return (
    <div className={['childUpDownCenter', styles.wrap].join(' ')}>
      <Switch>
        <Route
          path={`${match.path}/step1`}
          component={InstallContentsKubernetes1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsKubernetes2
              history={history}
              location={location}
              match={match}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/step3`}
          render={() => (
            <InstallContentsKubernetes3
              history={history}
              location={location}
              match={match}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/step4`}
          render={() => (
            <InstallContentsKubernetes4
              history={history}
              location={location}
              match={match}
              state={state}
              setState={setState}
            />
          )}
        />
        <Route
          path={`${match.path}/already`}
          component={InstallContentsKubernetesAlready}
        />
      </Switch>
    </div>
  );
}

export default InstallContentsKubernetes;
