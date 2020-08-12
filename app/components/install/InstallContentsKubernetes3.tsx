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
import { rootPath } from 'electron-root-path';
import styles from './InstallContentsKubernetes3.css';
import { AppContext } from '../../containers/HomePage';
import * as Script from '../../utils/common/script';
import * as Common from '../../utils/common/ssh';
import ProgressBar from '../ProgressBar';
import routes from '../../utils/constants/routes.json';
import * as env from '../../utils/common/env';
import CONST from '../../utils/constants/constant';
import * as scp from '../../utils/common/scp';
import Env, { Type } from '../../utils/class/Env';
import * as git from '../../utils/common/git';

const logRef: React.RefObject<HTMLTextAreaElement> = React.createRef();
function InstallContentsKubernetes3(props: any) {
  console.debug(InstallContentsKubernetes3.name, props);
  const { history, match } = props;

  const appContext = useContext(AppContext);
  const { appState } = appContext;

  const nowEnv = env.getEnvByName(match.params.envName);

  // progress bar
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prevProgress =>
        prevProgress >= 100 ? 100 : prevProgress + 1
      );
    }, 5000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  // dialog
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const appendToProgressScreen = (ref: any, data: string) => {
    if (ref) {
      ref.current!.value += data;
      ref.current!.scrollTop = ref.current!.scrollHeight;
    }
  };

  const install = async () => {
    console.debug(nowEnv.nodeList);

    // mainMaster, master, worker로 분리
    const { mainMaster, masterArr, workerArr } = env.getArrSortedByRole(
      nowEnv.nodeList
    );

    if (nowEnv.type === Type.INTERNAL) {
      // 폐쇄망 경우

      // TODO: package file 어떻게 다운 받을지? 현재 ck-ftp에 존재
      // local repository 구축 (각 노드 마다 수행)
      const targetArcName = `archive_20.07.10`;
      const srcPath = `${rootPath}/${targetArcName}/`;
      const destPath = `${targetArcName}/`;

      console.error('scp local repo package file start ######');
      console.debug(`srcPath`, srcPath);
      console.debug(`destPath`, destPath);
      await Promise.all(
        nowEnv.nodeList.map(node => {
          return scp.sendFile(node, srcPath, destPath);
        })
      );
      console.error('scp local repo package file end ######');

      console.error('set local repo start ######');
      await Promise.all(
        nowEnv.nodeList.map(node => {
          node.cmd = Script.setPackageRepository(destPath);
          console.debug(node.cmd);
          return Common.send(node, {
            close: () => {},
            stdout: (data: string) => appendToProgressScreen(logRef, data),
            stderr: (data: string) => appendToProgressScreen(logRef, data)
          });
        })
      );
      console.error('set local repo end ######');

      // git clone
      // TODO: git 어떻게 다운 받을지?
      const repoPath = `https://github.com/tmax-cloud/hypercloud-install-guide.git`;
      const localPath = `${rootPath}/hypercloud-install-guide/`;

      console.error('git clone start ######');
      console.debug(`repoPath`, repoPath);
      console.debug(`localPath`, localPath);
      await git.clone(repoPath, localPath);
      console.error('git clone end ######');

      // hypercloud-install-guide Git project를 clone한 directory를
      // scp를 통해 각 노드에 복사
      // 각각은 동시에, 전체 완료는 대기
      console.error('scp git project start ######');
      await Promise.all(
        nowEnv.nodeList.map(node => {
          return scp.sendFile(node, localPath, `hypercloud-install-guide/`);
        })
      );
      console.error('scp git project end ######');
    }

    let command = '';
    if (appState.kubeinstallState.registry) {
      console.error('set registry start ######');
      command = Script.getImageRegistrySettingScript(
        appState.kubeinstallState.registry,
        nowEnv.type
      );
      mainMaster.cmd = command;
      console.debug(mainMaster.cmd);
      await Common.send(mainMaster, {
        close: () => {},
        stdout: (data: string) => appendToProgressScreen(logRef, data),
        stderr: (data: string) => appendToProgressScreen(logRef, data)
      });
      console.error('set registry end ######');
    }

    if (nowEnv.type === Type.INTERNAL) {
      // 폐쇄망의 경우 이미지 src로 넣어줌
      // TODO: image 어떻게 다운 받을지?
      const srcPath = `${rootPath}/kube_image/`;
      console.error('scp image tar start ######');
      await scp.sendFile(mainMaster, srcPath, `k8s-install/`);
      console.error('scp image tar end ######');
    }

    console.error('mainMaster install start');
    let joinCmd = '';
    command = Script.getK8sMainMasterInstallScript(
      mainMaster,
      appState.kubeinstallState.registry,
      appState.kubeinstallState.version,
      nowEnv.type
    );
    command += Script.getK8sClusterJoinScript();

    mainMaster.cmd = command;
    console.debug(mainMaster.cmd);
    await Common.send(mainMaster, {
      close: () => {
        joinCmd = logRef.current!.value.split('@@@')[1];
      },
      stdout: (data: string) => appendToProgressScreen(logRef, data),
      stderr: (data: string) => appendToProgressScreen(logRef, data)
    });
    console.debug(joinCmd);
    console.error('mainMaster install end');
    setProgress(30);

    console.error('masterArr install start');
    // 각각은 동시에, 전체 완료는 대기
    await Promise.all(
      masterArr.map(master => {
        command = '';
        command += Script.getK8sMasterInstallScript(
          mainMaster,
          master,
          nowEnv.type
        );
        command += joinCmd;
        master.cmd = command;
        console.debug(master.cmd);
        return Common.send(master, {
          close: () => {},
          stdout: (data: string) => appendToProgressScreen(logRef, data),
          stderr: (data: string) => appendToProgressScreen(logRef, data)
        });
      })
    );
    console.error('masterArr install end');
    setProgress(70);

    console.error('workerArr install start');
    // 각각은 동시에, 전체 완료는 대기
    await Promise.all(
      workerArr.map(worker => {
        command = '';
        command += Script.getK8sWorkerInstallScript(
          mainMaster,
          appState.kubeinstallState.registry,
          appState.kubeinstallState.version,
          worker,
          nowEnv.type
        );
        command += `${joinCmd.trim()} --cri-socket=/var/run/crio/crio.sock;`;
        worker.cmd = command;
        console.debug(worker.cmd);
        return Common.send(worker, {
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
    console.error('workerArr install end');
    setProgress(100);
  };

  React.useEffect(() => {
    install();

    return () => {};
  }, []);

  return (
    <div className={[styles.wrap].join(' ')}>
      <div>
        {progress === 100 ? (
          <span>설치가 완료 되었습니다.</span>
        ) : (
          <span>설치 중 입니다 ######.</span>
        )}
      </div>
      <ProgressBar progress={progress} />
      <div>
        <textarea className={styles.log} ref={logRef} disabled />
      </div>
      <div className={['childLeftRightCenter'].join(' ')}>
        {/* <Button
          variant="contained"
          style={{ marginRight: '10px' }}
          className={['blue'].join(' ')}
          size="large"
          onClick={() => {
            // dispatchKubeInstall({
            //   page: 2
            // });
            history.push(
              `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.KUBERNETES.NAME}/step2`
            );
          }}
        >
          &lt; 이전
        </Button> */}
        {progress === 100 ? (
          <Button
            variant="contained"
            className={['white'].join(' ')}
            size="large"
            onClick={() => {
              history.push(
                `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.KUBERNETES.NAME}/step4`
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
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.KUBERNETES.NAME}/step1`
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
