/* eslint-disable import/no-cycle */
import React from 'react';
import EnvHeader from '../components/env/EnvHeader';
import EnvContents from '../components/env/EnvContents';

function EnvPage(props: any) {
  console.debug('EnvPage');

  const { history, location, match } = props;
  console.debug(props);

  return (
    <>
      <EnvHeader history={history} location={location} match={match} />
      <EnvContents history={history} location={location} match={match} />
    </>
  );
}

export default EnvPage;
