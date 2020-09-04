import React, { useContext } from 'react';
import styles from './InstallContentsHeader.css';
// import { InstallPageContext } from '../../containers/InstallPage';
import CONST from '../../utils/constants/constant';
import { AppContext } from '../../containers/HomePage';
import routes from '../../utils/constants/routes.json';

function InstallContentsHeader(props: any) {
  console.debug(InstallContentsHeader.name, props);
  // const installPageContext = useContext(InstallPageContext);
  // const { installPageState } = installPageContext;
  const { history, location, match } = props;

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

  const getComponent = () => {
    let component;
    if (
      location.pathname.indexOf('main') !== -1 ||
      location.pathname.indexOf('installKubePlease') !== -1
    ) {
      component = <div />;
    } else {
      component = (
        <div className={[styles.wrap, 'large', 'lightDark'].join(' ')}>
          <strong>{location.pathname.split('/')[3]}</strong>
        </div>
      );
    }

    return component;
  };
  return <>{getComponent()}</>;
}

export default InstallContentsHeader;
