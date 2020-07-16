import React from 'react';
import { Switch } from 'react-router';
import { Route } from 'react-router-dom';
import routes from '../../utils/constants/routes.json';
import K8sInstallEnvironment from './K8sInstallEnvironment';
import K8sInstallSsh from './K8sInstallSsh';

export default function Content() {
  return (
    <div>
      <Switch>
        <Route
          path={routes.K8S_INSTALL_ENV}
          component={K8sInstallEnvironment}
        />
        <Route path={routes.K8S_INSTALL_SSH} component={K8sInstallSsh} />
      </Switch>
    </div>
  );
}
