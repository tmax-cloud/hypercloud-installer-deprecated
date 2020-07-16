/* eslint-disable no-console */
import React from 'react';
import * as Common from '../../utils/common/ssh';
import styles from './K8sInstallExecute.css';
import * as Script from '../../utils/common/script';
import Node, { Role } from '../../utils/class/Node';

interface Props {
  nodeInfo: Array<Node>;
}

export default function K8sInstallExecute({ nodeInfo }: Props) {
  console.log('nodeInfo', nodeInfo);

  const logRef: React.RefObject<HTMLTextAreaElement> = React.createRef();

  function onClickInstall() {
    logRef.current!.value = '';
    for (let i = 0; i < nodeInfo.length; i += 1) {
      if (nodeInfo[i].role === Role.MASTER) {
        const master = nodeInfo[i];
        console.log('master!!!', master);
        // install docker
        // init cluster
        // install CNI
        // get cluster join command
        let command = Script.runScriptAsFile(Script.getDockerInstallScript());
        command += Script.runScriptAsFile(Script.getK8sClusterInitScript());
        command += Script.getCniInstallScript();
        command += Script.getK8sClusterJoinScript(master.ip);
        master.cmd = command;
        Common.send(master, {
          close: () => {
            // console.log('close!!');
            // TODO: 마스터 개수만큼 돌았을 때 워커 실행 해야 함..??
            // if 문 추가??
            const joinCmd = logRef.current!.value.split('@@@')[1];
            for (let j = 0; j < nodeInfo.length; j += 1) {
              if (nodeInfo[j].role === Role.WORKER) {
                const worker = nodeInfo[j];
                console.log('worker!!!', worker);
                // install docker
                // install kubelet, kubectl, kubeadm
                // join cluster
                command = Script.runScriptAsFile(
                  Script.getDockerInstallScript()
                );
                command += Script.getK8sToolsInstallScript();
                command += joinCmd;
                worker.cmd = command;
                Common.send(worker, {
                  close: () => {},
                  stdout: () => {},
                  stderr: () => {}
                });
              }
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
    }
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
