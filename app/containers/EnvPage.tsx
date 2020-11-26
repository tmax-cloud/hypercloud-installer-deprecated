import React from 'react';
import EnvHeader from '../components/env/EnvHeader';
import EnvContents from '../components/env/EnvContents';

function EnvPage({ history, location, match }: any) {
  console.debug(EnvPage.name);

  return (
    <>
      <EnvHeader history={history} location={location} match={match} />
      <EnvContents history={history} location={location} match={match} />
    </>
  );
}

export default EnvPage;
