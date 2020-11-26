import React from 'react';
import InstallLnb from '../components/install/InstallLnb';
import InstallContents from '../components/install/InstallContents';
import layout from './InstallPage.css';

function InstallPage({ history, location, match }: any) {
  console.debug(InstallPage.name);

  const [clicked, setClicked] = React.useState('');

  return (
    <div className={[layout.wrap].join(' ')}>
      <InstallLnb
        history={history}
        location={location}
        match={match}
        clicked={clicked}
        setClicked={setClicked}
      />
      <InstallContents
        history={history}
        location={location}
        match={match}
        clicked={clicked}
        setClicked={setClicked}
      />
    </div>
  );
}

export default InstallPage;
