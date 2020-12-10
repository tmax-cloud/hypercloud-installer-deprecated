import React, { useState } from 'react';
import { Switch, Route } from 'react-router';
import styles from '../InstallContents0.css';
import InstallContentsRookCeph1 from './InstallContentsRookCeph1';
import InstallContentsRookCeph2 from './InstallContentsRookCeph2';
import InstallContentsRookCeph3 from './InstallContentsRookCeph3';
import InstallContentsRookCeph4 from './InstallContentsRookCeph4';
import InstallContentsRookCephAlready from './InstallContentsRookCephAlready';
import InstallKubePlease from '../InstallKubePlease';
import RookCephInstaller from '../../../utils/class/installer/RookCephInstaller';

function InstallContentsRookCeph(props: any) {
  console.debug(InstallContentsRookCeph.name, props);
  const { history, location, match } = props;

  const [state, setState] = useState({
    version: RookCephInstaller.ROOK_VERSION
  });

  const [option, setOption] = useState({
    disk: {},
    osdCpu: '',
    osdMemory: '',
    monCpu: '',
    monMemory: '',
    mgrCpu: '',
    mgrMemory: '',
    mdsCpu: '',
    mdsMemory: ''
  });

  return (
    <div className={['childUpDownCenter', styles.wrap].join(' ')}>
      <Switch>
        <Route
          path={`${match.path}/step1`}
          component={InstallContentsRookCeph1}
        />
        <Route
          path={`${match.path}/step2`}
          render={() => (
            <InstallContentsRookCeph2
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
              setOption={setOption}
            />
          )}
        />
        <Route
          path={`${match.path}/step3`}
          render={() => (
            <InstallContentsRookCeph3
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
              option={option}
            />
          )}
        />
        <Route
          path={`${match.path}/step4`}
          render={() => (
            <InstallContentsRookCeph4
              history={history}
              match={match}
              location={location}
              state={state}
              setState={setState}
              option={option}
            />
          )}
        />
        <Route
          path={`${match.path}/already`}
          component={InstallContentsRookCephAlready}
        />
        <Route
          path={`${match.path}/impossible`}
          component={InstallKubePlease}
        />
      </Switch>
    </div>
  );
}

export default InstallContentsRookCeph;
