import React, { useContext } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@material-ui/core';
// import { InstallPageContext } from '../../containers/InstallPage';
import styles from './InstallContentsKubernetes3.css';
import { Role } from '../../utils/class/Node';
import { AppContext } from '../../containers/HomePage';
import * as Script from '../../utils/common/script';
import * as Common from '../../utils/common/ssh';
import ProgressBar from '../ProgressBar';
import routes from '../../utils/constants/routes.json';

const logRef: React.RefObject<HTMLTextAreaElement> = React.createRef();
function InstallContentsKubernetes3(props: any) {
  console.log('InstallContentsKubernetes3');

  const { history } = props;
  console.debug(props);

  const appContext = useContext(AppContext);
  const { appState } = appContext;

  const [progress, setProgress] = React.useState(0);

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const install = async () => {
    console.log(appState.nowEnv.nodes);
    const nodeInfo = appState.nowEnv.nodes;

    // master, worker로 분리
    const masterArr = [];
    const workerArr = [];
    for (let i = 0; i < nodeInfo.length; i += 1) {
      if (nodeInfo[i].role === Role.MASTER) {
        masterArr.push(nodeInfo[i]);
      } else if (nodeInfo[i].role === Role.WORKER) {
        workerArr.push(nodeInfo[i]);
      }
    }
    await Promise.all(
      masterArr.map((master, index) => {
        if (index === 0) {
          // TODO: image registry 분기 처리
        }

        let command = '';
        command += `echo %%%10%%%;`;
        command += Script.getK8sMasterInstallScript(master, index + 1);
        command += `echo %%%30%%%;`;
        command += Script.getK8sClusterJoinScript(master.ip);
        command += `echo %%%100%%%;`;
        master.cmd = command;
        console.log(master.cmd);
        return Common.send(master, {
          close: () => {},
          stdout: (data: string) => {
            console.log('stdout!!');
            logRef.current!.value += data;
            logRef.current!.scrollTop = logRef.current!.scrollHeight;
            if (String(data).split('%%%')[1]) {
              setProgress(Number(String(data).split('%%%')[1]));

              // 완료 버튼 표기
              if (String(data).split('%%%')[1] === '100') {
                // dispatchKubeInstall({
                //   page: 4
                // });
                // history.push(
                //   `${routes.INSTALL.HOME}/${appState.nowEnv.name}/kubernetes/step4`
                // );
              }
            }
          },
          stderr: (data: string) => {
            console.log('stderr!!');
            console.log(logRef.current!);
            logRef.current!.value += data;
            logRef.current!.scrollTop = logRef.current!.scrollHeight;
          }
        });
      })
    );
    // TODO:
    // workerArr.map((worker, index) => {
    //   const joinCmd = logRef.current!.value.split('@@@')[1];
    //   for (let j = 0; j < nodeInfo.length; j += 1) {
    //     if (nodeInfo[j].role === Role.WORKER) {
    //       const worker = nodeInfo[j];
    //       console.log('worker!!!', worker);
    //       // install docker
    //       // install kubelet, kubectl, kubeadm
    //       // join cluster
    //       command = Script.runScriptAsFile(Script.getDockerInstallScript());
    //       command += Script.getK8sToolsInstallScript();
    //       command += joinCmd;
    //       worker.cmd = command;
    //       Common.send(worker, {
    //         close: () => {},
    //         stdout: () => {},
    //         stderr: () => {}
    //       });
    //     }
    //   }
    // });
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
          style={{ marginRight: '10px' }}
          className={['blue'].join(' ')}
          size="large"
          onClick={() => {
            // dispatchKubeInstall({
            //   page: 2
            // });
            history.push(
              `${routes.INSTALL.HOME}/${appState.nowEnv.name}/kubernetes/step2`
            );
          }}
        >
          &lt; 이전
        </Button>
        {progress === 100 ? (
          <Button
            variant="contained"
            className={['white'].join(' ')}
            size="large"
            onClick={() => {
              history.push(
                `${routes.INSTALL.HOME}/${appState.nowEnv.name}/kubernetes/step4`
              );
            }}
          >
            완료
          </Button>
        ) : (
          <Button
            variant="contained"
            className={['white'].join(' ')}
            size="large"
            onClick={() => {
              handleClickOpen();
            }}
          >
            취소
          </Button>
        )}

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">나가기</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              설치를 종료하시겠습니까? 설정 내용은 저장되지 않습니다.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                handleClose();
                // dispatchKubeInstall({
                //   page: 1
                // });
                history.push(
                  `${routes.INSTALL.HOME}/${appState.nowEnv.name}/kubernetes/step1`
                );
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
