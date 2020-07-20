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

  const appContext = useContext(AppContext);
  const { appState } = appContext;

  // const getComponent = () => {
  //   let component;
  //   if (installPageState.mode === CONST.INSTALL.MAIN) {
  //     component = <InstallContentsMain />;
  //   } else if (installPageState.mode === CONST.INSTALL.KUBERNETES) {
  //     component = <InstallContentsKubernetes />;
  //   }

  //   return component;
  // };

  return (
    <div className={[styles.wrap, 'left'].join(' ')}>
      <InstallContentsHeader
        history={history}
        location={location}
        match={match}
      />
      {/* {getComponent()} */}
      <Switch>
        <Route
          path={`${routes.INSTALL.HOME}/${appState.env.name}/main`}
          component={InstallContentsMain}
        />
        <Route
          path={`${routes.INSTALL.HOME}/${appState.env.name}/kubernetes`}
          component={InstallContentsKubernetes}
        />
        <Redirect
          path="*"
          to={`${routes.INSTALL.HOME}/${appState.env.name}/main`}
        />
      </Switch>
    </div>
  );
}

export default InstallContents;
