import React from 'react';
import styles from './InstallContentsHeader.css';

function InstallContentsHeader(props: any) {
  console.debug(InstallContentsHeader.name, props);
  const { location } = props;

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
