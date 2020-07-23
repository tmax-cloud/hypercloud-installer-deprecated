import React, { useContext } from 'react';
import styles from './InstallContentsHeader.css';
// import { InstallPageContext } from '../../containers/InstallPage';
import CONST from '../../utils/constants/constant';
import { AppContext } from '../../containers/HomePage';
import routes from '../../utils/constants/routes.json';

function InstallContentsHeader(props: any) {
  // const installPageContext = useContext(InstallPageContext);
  // const { installPageState } = installPageContext;
  const { history, location, match } = props;

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const getComponent = () => {
    let component;
    console.log(location.pathname);
    if (location.pathname.indexOf('main') !== -1) {
      component = <div />;
    } else if (location.pathname.indexOf('kubernetes') !== -1) {
      component = (
        <div className={[styles.wrap, 'large', 'lightDark'].join(' ')}>
          <strong>쿠버네티스</strong>
        </div>
      );
    }

    return component;
  };
  return <>{getComponent()}</>;
}

export default InstallContentsHeader;
