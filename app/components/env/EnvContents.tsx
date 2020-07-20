/* eslint-disable import/no-cycle */
import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import * as env from '../../utils/common/env';
import EnvContentsExist from './EnvContentsExist';
import EnvContentsNotExist from './EnvContentsNotExist';
import EnvContentsAdd from './EnvContentsAdd';
import styles from './EnvContents.css';
import routes from '../../utils/constants/routes.json';

function EnvContents(props: any) {
  console.debug('EnvContents');

  const { history } = props;

  useEffect(() => {
    if (!env.isEmpty()) {
      history.push(routes.ENV.EXIST);
    } else {
      history.push(routes.ENV.NOT_EXIST);
    }
  }, []);

  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      <Switch>
        <Route path={routes.ENV.EXIST} component={EnvContentsExist} />
        <Route path={routes.ENV.NOT_EXIST} component={EnvContentsNotExist} />
        <Route path={routes.ENV.ADD} component={EnvContentsAdd} />
        <Route
          path={`${routes.ENV.EDIT}/:envName`}
          component={EnvContentsAdd}
        />
      </Switch>
    </div>
  );
}

export default EnvContents;
