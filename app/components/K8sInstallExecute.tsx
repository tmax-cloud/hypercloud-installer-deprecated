import React from 'react';
import * as Common from './common';
import styles from './K8sInstallExecute.css';
import * as Text from './ssh/installK8S';

type Props = {
  page: number;
  setPage: Function;
  sshInfo: Array;
};

export default function K8sInstallExecute(props: Props) {
  console.log('sshInfo', props.sshInfo);

  // const [log, setLog] = React.useState('');
  const logRef = React.createRef();

  function onClickInstall() {
    logRef.current.value = '';
    for (let i = 0; i < props.sshInfo.length; i += 1) {
      let ip = props.sshInfo[i].ip;
      let port = props.sshInfo[i].port;
      let user = props.sshInfo[i].user;
      let password = props.sshInfo[i].password;
      const ssh = {
        ip,
        port,
        user,
        password
      };
      const cmd = `
        touch install.sh;
        echo "${Text.getK8SInstallScript()}" > install.sh;
        chmod 777 install.sh
        ./install.sh
      `;
      console.log(ssh, cmd);
      Common.send(ssh, cmd, data => {
        logRef.current.value += data;
        logRef.current.scrollTop = logRef.current.scrollHeight;
      });
    }
  }
  return (
    <div>
      <h1>
        Step
        {props.page}
      </h1>
      <h4>설치</h4>
      <button type="button" onClick={onClickInstall}>
        설치
      </button>
      <br />
      <br />
      {/* <textarea className={styles.log} value={log} disabled /> */}
      <textarea className={styles.log} ref={logRef} disabled />
      <div>
        <button
          type="button"
          onClick={function() {
            props.setPage(props.page - 1);
          }}
        >
          Prev
        </button>
        <button type="button" disabled>
          Next
        </button>
      </div>
    </div>
  );
}
