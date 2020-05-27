import React from 'react';
import * as Common from './common';
import styles from './K8sInstallSsh.css';

type Props = {
  page: number;
  setPage: Function;
  nodeCnt: number;
  setSshInfo: Function;
};

export default function K8sInstallSsh(props: Props) {
  const [sshInfo, setSshInfo] = React.useState(() => {
    const temp = [];
    for (let i = 0; i < props.nodeCnt; i += 1) {
      temp.push({
        ip: '',
        port: '22',
        user: '',
        password: '',
        isSuccess: 0,
        isSuccessHTML: ''
      });
    }
    return temp;
  });

  function sshConnTest(e, i) {
    console.log('Test Info', sshInfo[i]);

    sshInfo[i].isSuccessHTML = <span className={styles.connTesting}>Wait...</span>;
    let temp = [].concat(sshInfo);
    setSshInfo(temp);

    let ip = sshInfo[i].ip;
    let port = Number(sshInfo[i].port);
    let user = sshInfo[i].user;
    let password = sshInfo[i].password;

    const ssh2 = require('ssh2');
    const connection = new ssh2();
    connection.on('error', function(err) {
      // Handle the connection error
      console.log('error', err);
      sshInfo[i].isSuccessHTML = <span className={styles.connError}>Error!!!</span>;
      temp = [].concat(sshInfo);
      setSshInfo(temp);
      connection.end();
    });
    connection.on('ready', function() {
      // Work with the connection
      console.log('ready');
      sshInfo[i].isSuccessHTML = <span className={styles.connSuccess}>Success!!!</span>;
      sshInfo[i].isSuccess = 1;
      temp = [].concat(sshInfo);
      setSshInfo(temp);
      connection.end();
    });
    connection.connect({
      host: ip,
      port,
      username: user,
      password
    });
  }

  function onClickNext() {
    let canNext = true;
    for (let i = 0; i < sshInfo.length; i += 1) {
      if (!sshInfo[i].isSuccess) {
        canNext = false;
        break;
      }
    }

    if (!canNext) {
      alert(`모든 노드 테스트 통과 필요`);
    } else {
      props.setSshInfo(sshInfo);
      props.setPage(props.page + 1);
    }
  }

  const items = [];
  for (let i = 0; i < props.nodeCnt; i += 1) {
    items.push(
      <form key={i}>
        [node{i + 1}]
        <br />
        <label htmlFor="ip">
          <span className={styles.title}>IP : </span>
          <input
            type="text"
            id="ip"
            name="ip"
            onChange={function(e) {
              sshInfo[i].ip = e.target.value;
            }}
          />
        </label>
        <br />
        <label htmlFor="port">
          <span className={styles.title}>Port : </span>
          <input
            type="number"
            id="port"
            name="port"
            min="0"
            max="65535"
            value={sshInfo[i].port}
            onChange={function(e) {
              sshInfo[i].port = e.target.value;
              let temp = [].concat(sshInfo);
              setSshInfo(temp);
            }}
          />
        </label>
        <br />
        <label htmlFor="user">
          <span className={styles.title}>User : </span>
          <input
            type="text"
            id="user"
            name="user"
            onChange={function(e) {
              sshInfo[i].user = e.target.value;
            }}
          />
        </label>
        <br />
        <label htmlFor="password">
          <span className={styles.title}>Password : </span>
          <input
            type="password"
            id="password"
            name="password"
            onChange={function(e) {
              sshInfo[i].password = e.target.value;
            }}
          />
        </label>
        <br />
        <span className={styles.title}></span>
        <input
          type="button"
          value="Connection Test"
          onClick={e => {
            sshConnTest(e, i);
          }}
        />
        {sshInfo[i].isSuccessHTML}
        <br />
        <br />
      </form>
    );
  }

  return (
    <div>
      <h1>
        Step
        {props.page}
      </h1>
      <h4>노드의 ssh 정보 입력</h4>
      {items}
      <br />
      <div>
        <button
          type="button"
          onClick={function() {
            props.setPage(props.page - 1);
          }}
        >
          Prev
        </button>
        <button type="button" onClick={onClickNext}>
          Next
        </button>
      </div>
    </div>
  );
}
