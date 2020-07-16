import React from 'react';
import styles from './InstallContentsHeader.css';

function InstallContentsHeader() {
  return (
    <div className={[styles.wrap].join(' ')}>
      <pre>Cloud_1</pre>
      <strong>쿠버네티스</strong>
    </div>
  );
}

export default InstallContentsHeader;
