import React, { useContext } from 'react';
import styles from './InstallContents.css';
import InstallContentsMain from './InstallContentsMain';
import { InstallPageContext } from '../containers/InstallPage';
import CONST from '../constants/constant';
import InstallContentsKubernetes from './InstallContentsKubernetes';
import InstallContentsKubernetes2 from './InstallContentsKubernetes2';
import InstallContentsKubernetes3 from './InstallContentsKubernetes3';
import InstallContentsKubernetes4 from './InstallContentsKubernetes4';
import { Switch, Route } from 'react-router';
import InstallContentsKubernetes1 from './InstallContentsKubernetes1';

function InstallContents() {
  const installPageContext = useContext(InstallPageContext);
  const { installPageState, dispatchInstallPage } = installPageContext;

  const getComponent = () => {
    let component;
    if (installPageState.mode === CONST.INSTALL.MAIN) {
      component = <InstallContentsMain />;
    } else if (installPageState.mode === CONST.INSTALL.KUBERNETES) {
      component = <InstallContentsKubernetes />;
    }

    return component;
  };

  return (
    <div className={[styles.wrap, 'left'].join(' ')}>{getComponent()}</div>
  );
}

export default InstallContents;
