import React from 'react';
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
import InstallContentsHyperCloud from './hyperCloud/InstallContentsHyperCloud';
import InstallContentsCatalogController from './catalogController/InstallContentsCatalogController';
import InstallContentsTekton from './Tekton/InstallContentsTekton';

function InstallContents(props: any) {
  console.debug(InstallContents.name, props);
  const { history, location, match, setClicked } = props;

  return (
    <div className={[styles.wrap].join(' ')}>
      <InstallContentsHeader
        history={history}
        location={location}
        match={match}
      />
      <Switch>
        <Route
          path={`${match.path}/main`}
          render={() => (
            <InstallContentsMain
              history={history}
              match={match}
              setClicked={setClicked}
            />
          )}
        />
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
          component={InstallContentsHyperCloud}
        />
        <Route
          path={`${match.path}/${CONST.PRODUCT.CATALOG_CONTROLLER.NAME}`}
          component={InstallContentsCatalogController}
        />
        <Route
          path={`${match.path}/${CONST.PRODUCT.TEKTON.NAME}`}
          component={InstallContentsTekton}
        />
        <Redirect path="*" to={`${match.url}/main`} />
      </Switch>
    </div>
  );
}

export default InstallContents;
