import React, { useContext } from 'react';
import { KubeInstallContext } from './InstallContentsKubernetes';
import { InstallPageContext } from '../containers/InstallPage';
import LinearProgress from '@material-ui/core/LinearProgress/LinearProgress';
import styles from './InstallContentsKubernetes3.css';
import { Button } from '@material-ui/core';
import Node, { Role } from './class/Node';
import * as Script from './ssh/script';
import * as Common from './common';

function InstallContentsKubernetes3() {
  const installPageContext = useContext(InstallPageContext);
  const { installPageState, dispatchInstallPage } = installPageContext;

  const kubeInstallContext = useContext(KubeInstallContext);
  const { kubeInstallState, dispatchKubeInstall } = kubeInstallContext;

  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    console.log(installPageState.node.nodes);
    const nodeInfo = installPageState.node.nodes;
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
            console.log('stdout!!');
            logRef.current!.value += data;
            logRef.current!.scrollTop = logRef.current!.scrollHeight;
          },
          stderr: (data: string) => {
            console.log('stderr!!');
            logRef.current!.value += data;
            logRef.current!.scrollTop = logRef.current!.scrollHeight;
          }
        });
      }
    }

    return () => {
      clearInterval(timer);
    };
  }, []);

  const logRef: React.RefObject<HTMLTextAreaElement> = React.createRef();

  return (
    <div>
      <div>
        <span>설치 중 입니다....</span>
      </div>
      <div>
        <LinearProgress variant="determinate" value={progress} />
      </div>
      <div>
        <textarea className={styles.log} ref={logRef} disabled />
      </div>
      <div>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            dispatchKubeInstall({
              page: 2
            });
          }}
        >
          이전
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => {
            dispatchKubeInstall({
              page: 1
            });
          }}
        >
          취소
        </Button>
      </div>
    </div>
  );
}

export default InstallContentsKubernetes3;
