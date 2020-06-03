import React from 'react';
import * as Common from './common';
import styles from './K8sInstallExecute.css';
import * as Script from './ssh/script';

interface SshInfo {
  ip: string;
  port: string;
  user: string;
  password: string;
}

interface Props {
  page: number;
  setPage: Function;
  sshInfo: Array<SshInfo>;
}

export default function K8sInstallExecute({ page, setPage, sshInfo }: Props) {
  console.log('sshInfo', sshInfo);

  // const [log, setLog] = React.useState('');
  const logRef: React.RefObject<HTMLTextAreaElement> = React.createRef();

  function onClickInstall() {
    logRef.current!.value = '';
    const master = sshInfo[0];
    const masterSsh = {
      ip: master.ip,
      port: master.port,
      user: master.user,
      password: master.password
    };
    // install docker
    // init cluster
    // install CNI
    // get cluster join command
    let cmd = Script.runScriptAsFile(Script.getDockerInstallScript());
    cmd += Script.runScriptAsFile(Script.getK8sClusterInitScript());
    cmd += Script.getCniInstallScript();
    cmd += Script.getK8sClusterJoinScript(master.ip);
    console.log('===== master cmd to execute =====', cmd);
    Common.send(masterSsh, cmd, {
      close: () => {
        // console.log('close!!');
        const joinCmd = logRef.current!.value.split('@@@')[1];

        for (let i = 1; i < sshInfo.length; i += 1) {
          const worker = sshInfo[i];
          const workerSsh = {
            ip: worker.ip,
            port: worker.port,
            user: worker.user,
            password: worker.password
          };
          // install docker
          // install kubelet, kubectl, kubeadm
          // join cluster
          cmd = Script.runScriptAsFile(Script.getDockerInstallScript());
          cmd += Script.getK8sToolsInstallScript();
          cmd += joinCmd;
          console.log('===== worker cmd to execute =====', cmd);
          Common.send(workerSsh, cmd, {
            close: () => {},
            stdout: () => {},
            stderr: () => {}
          });
        }
      },
      stdout: (data: string) => {
        // console.log('stdout!!');
        logRef.current!.value += data;
        logRef.current!.scrollTop = logRef.current!.scrollHeight;
      },
      stderr: (data: string) => {
        // console.log('stderr!!');
        logRef.current!.value += data;
        logRef.current!.scrollTop = logRef.current!.scrollHeight;
      }
    });
  }
  return (
    <div>
      <h1>
        Step
        {page}
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
            setPage(page - 1);
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
