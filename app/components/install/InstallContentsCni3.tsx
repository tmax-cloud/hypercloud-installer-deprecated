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
import styles from './InstallContentsCni3.css';
import { ROLE } from '../../utils/class/Node';
import { AppContext } from '../../containers/HomePage';
import * as Script from '../../utils/common/script';
import * as Common from '../../utils/common/ssh';
import ProgressBar from '../ProgressBar';
import routes from '../../utils/constants/routes.json';
import * as env from '../../utils/common/env';
import CONST from '../../utils/constants/constant';
import CniInstaller from '../../utils/class/installer/CniInstaller';
import MetalLbInstaller from '../../utils/class/installer/MetalLbInstaller';

const logRef: React.RefObject<HTMLTextAreaElement> = React.createRef();
function InstallContentsCni3(props: any) {
  console.debug(InstallContentsCni3.name, props);
  const { history, location, match, state, setState } = props;

  // const appContext = useContext(AppContext);
  // const { appState } = appContext;

  const nowEnv = env.loadEnvByName(match.params.envName);

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
    console.debug(`nowEnv`, nowEnv);

    const callback = {
      close: () => {},
      stdout: (data: string) => appendToProgressScreen(logRef, data),
      stderr: (data: string) => appendToProgressScreen(logRef, data)
    };

    // const cniInstaller = CniInstaller.getInstance;
    // cniInstaller.env = nowEnv;

    // await cniInstaller.install({
    //   type: state.type,
    //   version: state.version,
    //   callback,
    //   setProgress
    // });

    const metalLbInstaller = MetalLbInstaller.getInstance;
    metalLbInstaller.env = nowEnv;

    await metalLbInstaller.install({
      callback,
      setProgress
    });
    // await cniInstaller.preWorkInstall(state.registry, state.version, callback);
    // setProgress(60);

    // await cniInstaller.installMainMaster(state.type, state.version, callback);
    // setProgress(100);
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
          <span>설치 중 입니다....</span>
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
              `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.CNI.NAME}/step2`
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
                `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.CNI.NAME}/step4`
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
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.CNI.NAME}/step1`
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

export default InstallContentsCni3;
