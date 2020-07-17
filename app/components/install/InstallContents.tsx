import React, { useContext } from 'react';
import styles from './InstallContents.css';
import InstallContentsMain from './InstallContentsMain';
import { InstallPageContext } from '../../containers/InstallPage';
import CONST from '../../utils/constants/constant';
import InstallContentsKubernetes from './InstallContentsKubernetes';
import InstallContentsHeader from './InstallContentsHeader';

function InstallContents() {
  const installPageContext = useContext(InstallPageContext);
  const { installPageState } = installPageContext;

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
    <div className={[styles.wrap, 'left'].join(' ')}>
      <InstallContentsHeader />
      {getComponent()}
    </div>
  );
}

export default InstallContents;
