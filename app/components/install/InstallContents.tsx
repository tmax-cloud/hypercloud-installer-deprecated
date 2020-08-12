/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import styles from './InstallContents.css';
import InstallContentsMain from './InstallContentsMain';
import { AppContext } from '../../containers/HomePage';
import InstallContentsKubernetes from './InstallContentsKubernetes';
import InstallKubePlease from './InstallKubePlease';
import InstallContentsCni from './InstallContentsCni';
import InstallContentsHeader from './InstallContentsHeader';
import routes from '../../utils/constants/routes.json';
import CONST from '../../utils/constants/constant';

function InstallContents(props: any) {
  console.debug(InstallContents.name, props);
  const { history, location, match } = props;

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  return (
    <div className={[styles.wrap].join(' ')}>
      <InstallContentsHeader
        history={history}
        location={location}
        match={match}
      />
      <Switch>
        <Route path={`${match.path}/main`} component={InstallContentsMain} />
        <Route
          path={`${match.path}/${CONST.PRODUCT.KUBERNETES.NAME}`}
          component={InstallContentsKubernetes}
        />
        <Route
          path={`${match.path}/${CONST.PRODUCT.CNI.NAME}`}
          component={InstallContentsCni}
        />
        <Route
          path={`${match.path}/installKubePlease`}
          component={InstallKubePlease}
        />
        <Redirect path="*" to={`${match.url}/main`} />
      </Switch>
    </div>
  );
}

export default InstallContents;
