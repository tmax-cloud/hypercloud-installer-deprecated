import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './utils/constants/routes.json';
import App from './containers/App';
import CounterPage from './containers/CounterPage';
import HomePage from './containers/HomePage';

export default function Routes() {
  return (
    <App>
      <Switch>
        {/* <Route path={routes.COUNTER} component={CounterPage} /> */}
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
