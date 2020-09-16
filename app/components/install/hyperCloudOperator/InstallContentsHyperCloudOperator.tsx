import React, { useReducer, useContext, useEffect, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsHyperCloudOperator1 from './InstallContentsHyperCloudOperator1';
import InstallContentsHyperCloudOperator2 from './InstallContentsHyperCloudOperator2';
import InstallContentsHyperCloudOperator3 from './InstallContentsHyperCloudOperator3';
import InstallContentsHyperCloudOperator4 from './InstallContentsHyperCloudOperator4';
import InstallContentsHyperCloudOperatorAlready from './InstallContentsHyperCloudOperatorAlready';
import InstallKubePlease from '../InstallKubePlease';

function InstallContentsHyperCloudOperator(props: any) {
  console.debug(InstallContentsHyperCloudOperator.name, props);
  const { history, location, match } = props;

  const [state, setState] = useState();

  return (
    <div className={['childUpDownCenter', styles.wrap].join(' ')}>
      <Switch>
        <Route
          path={`${match.path}/step1`}
          component={InstallContentsHyperCloudOperator1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsHyperCloudOperator2
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
            <InstallContentsHyperCloudOperator3
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
            <InstallContentsHyperCloudOperator4
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
          component={InstallContentsHyperCloudOperatorAlready}
        />
        <Route
          path={`${match.path}/impossible`}
          component={InstallKubePlease}
        />
      </Switch>
    </div>
  );
}

export default InstallContentsHyperCloudOperator;
