/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import styles from './InstallContents.css';
import InstallContentsMain from './InstallContentsMain';
import InstallContentsKubernetes from './kubernetes/InstallContentsKubernetes';
import InstallContentsCni from './cni/InstallContentsCni';
import InstallContentsHeader from './InstallContentsHeader';
import CONST from '../../utils/constants/constant';
import InstallContentsRookCeph from './rookCeph/InstallContentsRookCeph';
import InstallContentsMetalLb from './metalLb/InstallContentsMetalLb';
import InstallContentsPrometheus from './prometheus/InstallContentsPrometheus';
import InstallContentsHyperAuth from './hyperAuth/InstallContentsHyperAuth';
import InstallContentsHyperCloudOperator from './hyperCloud/InstallContentsHyperCloud';

function InstallContents(props: any) {
  console.debug(InstallContents.name, props);
  const { history, location, match } = props;

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

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
          path={`${match.path}/${CONST.PRODUCT.METAL_LB.NAME}`}
          component={InstallContentsMetalLb}
        />
        <Route
          path={`${match.path}/${CONST.PRODUCT.ROOK_CEPH.NAME}`}
          component={InstallContentsRookCeph}
        />
        <Route
          path={`${match.path}/${CONST.PRODUCT.PROMETHEUS.NAME}`}
          component={InstallContentsPrometheus}
        />
        <Route
          path={`${match.path}/${CONST.PRODUCT.HYPERAUTH.NAME}`}
          component={InstallContentsHyperAuth}
        />
        <Route
          path={`${match.path}/${CONST.PRODUCT.HYPERCLOUD.NAME}`}
          component={InstallContentsHyperCloudOperator}
        />
        <Redirect path="*" to={`${match.url}/main`} />
      </Switch>
    </div>
  );
}

export default InstallContents;
