/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import styles from './InstallContents.css';
import InstallContentsMain from './InstallContentsMain';
import { AppContext } from '../../containers/HomePage';
import InstallContentsKubernetes from './InstallContentsKubernetes';
import InstallContentsHeader from './InstallContentsHeader';
import routes from '../../utils/constants/routes.json';

function InstallContents(props: any) {
  console.debug('InstallContents');

  const { history, location, match } = props;
  console.debug(props);

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
          path={`${match.path}/kubernetes`}
          component={InstallContentsKubernetes}
        />
        <Redirect path="*" to={`${match.url}/main`} />
      </Switch>
    </div>
  );
}

export default InstallContents;
