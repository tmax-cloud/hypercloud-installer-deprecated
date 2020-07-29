/* eslint-disable no-console */
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

  // progress bar
  const [progress, setProgress] = React.useState(0);

  // dialog
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const installKubernetes = async () => {
    console.log(appState.nowEnv.nodes);
    const nodeInfo = appState.nowEnv.nodes;

    // mainMaster, master, worker로 분리
    let mainMaster: any = null;
    const masterArr: any[] = [];
    const workerArr: any[] = [];
    for (let i = 0; i < nodeInfo.length; i += 1) {
      if (nodeInfo[i].role === Role.MASTER) {
        if (mainMaster === null) {
          mainMaster = nodeInfo[i];
        } else {
          masterArr.push(nodeInfo[i]);
        }
      } else if (nodeInfo[i].role === Role.WORKER) {
        workerArr.push(nodeInfo[i]);
      }
    }

    console.error('mainMaster install start');
    let joinCmd = '';
    let command = '';
    command += Script.getK8sMainMasterInstallScript(mainMaster, 0);
    command += Script.getK8sClusterJoinScript(mainMaster.ip);
    mainMaster.cmd = command;
    console.error(mainMaster.cmd);
    await Common.send(mainMaster, {
      close: () => {
        joinCmd = logRef.current!.value.split('@@@')[1];
      },
      stdout: (data: string) => {
        // if (String(data).split('%%%')[1]) {
        //   setProgress(Number(String(data).split('%%%')[1]));
        // }
        logRef.current!.value += data;
        logRef.current!.scrollTop = logRef.current!.scrollHeight;
      },
      stderr: (data: string) => {
        logRef.current!.value += data;
        logRef.current!.scrollTop = logRef.current!.scrollHeight;
      }
    });
    console.error('mainMaster install end');

    console.error('masterArr install start');
    await Promise.all(
      masterArr.map(async (master, index) => {
        command = '';
        command += Script.getK8sMasterInstallScript(master, index + 1);
        command += joinCmd;
        master.cmd = command;
        console.error(master.cmd);
        await Common.send(master, {
          close: () => {},
          stdout: (data: string) => {
            logRef.current!.value += data;
            logRef.current!.scrollTop = logRef.current!.scrollHeight;
          },
          stderr: (data: string) => {
            logRef.current!.value += data;
            logRef.current!.scrollTop = logRef.current!.scrollHeight;
          }
        });
      })
    );
    console.error('masterArr install end');

    console.error('workerArr install start');
    workerArr.map((worker, index) => {
      command = '';
      command += Script.getK8sWorkerInstallScript(
        mainMaster,
        worker,
        index + 1
      );
      command += joinCmd;
      worker.cmd = command;
      console.error(worker.cmd);
      Common.send(worker, {
        close: () => {},
        stdout: (data: string) => {
          logRef.current!.value += data;
          logRef.current!.scrollTop = logRef.current!.scrollHeight;
        },
        stderr: (data: string) => {
          logRef.current!.value += data;
          logRef.current!.scrollTop = logRef.current!.scrollHeight;
        }
      });
    });
    console.error('workerArr install end');

    setProgress(100);
  };

  React.useEffect(() => {
    installKubernetes();

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
