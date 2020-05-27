import React from 'react';
import K8sInstall from './K8sInstall';
import TestInstall from './TestInstall';
import styles from './Content.css';

type Props = {
  menu: string;
};

export default function Content(props: Props) {
  function getContents(): JSX.Element | null {
    let obj = null;
    if (props.menu === 'k8s') {
      obj = <K8sInstall />;
    } else if (props.menu === 'test') {
      obj = <TestInstall />;
    }
    return obj;
  }

  return (
    <div className={styles.content}>
      <div className={[styles.wrap, styles.scroll].join(' ')}>{getContents()}</div>
    </div>
  );
}
