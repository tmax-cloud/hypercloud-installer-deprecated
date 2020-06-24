/* eslint-disable no-console */
/* eslint-disable new-cap */
/* eslint-disable global-require */
/* eslint-disable no-alert */
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './K8sInstallSsh.css';
import Node, { State, Role } from './class/Node';
import * as Common from './common';
import { mapStateToProps, mapDispatchToProps } from '../actions/env';

interface Props {
  nodeCnt: number;
  setNodeInfo: Function;
}

function K8sInstallSsh(props: Props) {
  console.log('K8sInstallSsh props : ', props);
  const { setEnv } = props;
  const [sshInfo, setSshInfo] = React.useState(() => {
    // const temp = [];
    // for (let i = 0; i < nodeCnt; i += 1) {
    //   if (i === 0) {
    //     temp.push(new Node('', 22, '', '', '', State.INIT, Role.MASTER));
    //   } else {
    //     temp.push(new Node('', 22, '', '', '', State.INIT, Role.WORKER));
    //   }
    // }
    // console.log('Node list init', temp);
    // return temp;
  });

  function getConnectionTestHtml(state: State): any {
    let html = null;
    if (state === State.WAIT) {
      html = <span className={styles.connTesting}>Wait...</span>;
    } else if (state === State.FAIL) {
      html = <span className={styles.connError}>Error!!!</span>;
    } else if (state === State.SUCCESS) {
      html = <span className={styles.connSuccess}>Success!!!</span>;
    }
    return html;
  }

  function sshConnTest(i: number) {
    const node = sshInfo[i];
    console.log('Test node', node);

    node.state = State.WAIT;
    setSshInfo([].concat(sshInfo));

    Common.connectionTest(node)
      .then(() => {
        console.log('ready');
        node.state = State.SUCCESS;
        setSshInfo([].concat(sshInfo));
        return null;
      })
      .catch(err => {
        console.log('error', err);
        node.state = State.FAIL;
        setSshInfo([].concat(sshInfo));
      });
  }

  function onClickNext() {
    let canNext = true;
    for (let i = 0; i < sshInfo.length; i += 1) {
      const node = sshInfo[i];
      if (node.state === State.FAIL) {
        canNext = false;
        break;
      }
    }

    if (!canNext) {
      alert(`모든 노드 테스트 통과 필요`);
    } else {
      setNodeInfo(sshInfo);
      setPage(page + 1);
    }
  }

  const items = [];
  // for (let i = 0; i < nodeCnt; i += 1) {
  //   const node = sshInfo[i];
  //   items.push(
  //     <form key={i}>
  //       [node
  //       {i + 1}
  //       ]
  //       <br />
  //       <label htmlFor="ip">
  //         <span className={styles.title}>IP : </span>
  //         <input
  //           type="text"
  //           id="ip"
  //           name="ip"
  //           onChange={e => {
  //             node.ip = e.target.value;
  //           }}
  //         />
  //       </label>
  //       <br />
  //       <label htmlFor="port">
  //         <span className={styles.title}>Port : </span>
  //         <input
  //           type="number"
  //           id="port"
  //           name="port"
  //           min="0"
  //           max="65535"
  //           value={node.port}
  //           onChange={e => {
  //             node.port = Number(e.target.value);
  //             setNodeInfo([].concat(sshInfo));
  //           }}
  //         />
  //       </label>
  //       <br />
  //       <label htmlFor="user">
  //         <span className={styles.title}>User : </span>
  //         <input
  //           type="text"
  //           id="user"
  //           name="user"
  //           onChange={e => {
  //             node.user = e.target.value;
  //           }}
  //         />
  //       </label>
  //       <br />
  //       <label htmlFor="password">
  //         <span className={styles.title}>Password : </span>
  //         <input
  //           type="password"
  //           id="password"
  //           name="password"
  //           onChange={e => {
  //             node.password = e.target.value;
  //           }}
  //         />
  //       </label>
  //       <br />
  //       <span className={styles.title} />
  //       <input
  //         type="button"
  //         value="Connection Test"
  //         onClick={e => {
  //           sshConnTest(i);
  //         }}
  //       />
  //       {getConnectionTestHtml(node.state)}
  //       <br />
  //       <br />
  //     </form>
  //   );
  // }

  return (
    <div>
      <h1>Step 2</h1>
      <h4>노드의 ssh 정보 입력</h4>
      {/* {items} */}
      <br />
      <div>
        <button type="button">
          <Link to={routes.K8S_INSTALL_ENV}>Prev</Link>
        </button>
        <button type="button" onClick={onClickNext}>
          Next
        </button>
      </div>
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(K8sInstallSsh);
