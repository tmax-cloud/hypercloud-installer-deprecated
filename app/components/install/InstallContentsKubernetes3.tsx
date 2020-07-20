import React, { useContext } from 'react';
import { KubeInstallContext } from './InstallContentsKubernetes';
// import { InstallPageContext } from '../../containers/InstallPage';
import LinearProgress from '@material-ui/core/LinearProgress/LinearProgress';
import styles from './InstallContentsKubernetes3.css';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import Node, { Role } from '../../utils/class/Node';
import { AppContext } from '../../containers/HomePage';
import * as Script from '../../utils/common/script';
import * as Common from '../../utils/common/ssh';
import ProgressBar from '../ProgressBar';

const logRef: React.RefObject<HTMLTextAreaElement> = React.createRef();
function InstallContentsKubernetes3() {
  // const installPageContext = useContext(InstallPageContext);
  // const { installPageState, dispatchInstallPage } = installPageContext;
  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const kubeInstallContext = useContext(KubeInstallContext);
  const { kubeInstallState, dispatchKubeInstall } = kubeInstallContext;

  const [progress, setProgress] = React.useState(0);

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const install = () => {
    console.log(installPageState.env.nodes);
    const nodeInfo = installPageState.env.nodes;
    // logRef.current!.value = '';
    for (let i = 0; i < nodeInfo.length; i += 1) {
      if (nodeInfo[i].role === Role.MASTER) {
        const master = nodeInfo[i];
        console.log('master!!!', master);
        // install docker
        // init cluster
        // install CNI
        // get cluster join command
        let command = Script.runScriptAsFile(Script.getDockerInstallScript());
        command += `echo %%%30%%%`;
        command += Script.runScriptAsFile(Script.getK8sClusterInitScript());
        command += `echo %%%60%%%`;
        command += Script.getCniInstallScript();
        command += Script.getK8sClusterJoinScript(master.ip);
        command += `echo %%%100%%%`;
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
            // setLog(pre => {
            //   return pre + data;
            // });
            logRef.current!.value += data;
            logRef.current!.scrollTop = logRef.current!.scrollHeight;
            if (String(data).split('%%%')[1]) {
              setProgress(String(data).split('%%%')[1]);

              // 완료 후 3초 뒤, 페이지 이동
              setTimeout(()=>{
                if (String(data).split('%%%')[1] === '100') {
                  dispatchKubeInstall({
                    page: 4
                  });
                }
              }, 3000);
            }
          },
          stderr: (data: string) => {
            console.log('stderr!!');
            // setLog(pre => {
            //   return pre + data;
            // });
            console.log(logRef.current!);
            logRef.current!.value += data;
            logRef.current!.scrollTop = logRef.current!.scrollHeight;
          }
        });
      }
    }
  };

  React.useEffect(() => {
    install();

    return () => {};
  }, []);

  return (
    <div className={[styles.wrap].join(' ')}>
      <div>
        <span>설치 중 입니다....</span>
      </div>
      <ProgressBar progress={progress} />
      <div>
        <textarea className={styles.log} ref={logRef} disabled />
      </div>
      <div className={['childLeftRightCenter'].join(' ')}>
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
            handleClickOpen();
          }}
        >
          취소
        </Button>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">나가기</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
            설치를 종료하시겠습니까?
            설정 내용은 저장되지 않습니다.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                handleClose();
                dispatchKubeInstall({
                  page: 1
                });
              }}
              color="primary"
            >
              종료
            </Button>
            <Button onClick={handleClose} color="primary" autoFocus>
              취소
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default InstallContentsKubernetes3;
