import React, { useContext } from 'react';
import styles from './InstallContentsHeader.css';
import { InstallPageContext } from '../../containers/InstallPage';
import CONST from '../../utils/constants/constant';

function InstallContentsHeader() {
  const installPageContext = useContext(InstallPageContext);
  const { installPageState } = installPageContext;

  const getComponent = () => {
    let component;
    if (installPageState.mode === CONST.INSTALL.MAIN) {
      component = <div></div>;
    } else if (installPageState.mode === CONST.INSTALL.KUBERNETES) {
      component = <strong>쿠버네티스</strong>;
    }

    return component;
  };
  return (
    <div className={[styles.wrap].join(' ')}>
      <pre>{installPageState.env.name}</pre>
      {getComponent()}
    </div>
  );
}

export default InstallContentsHeader;
