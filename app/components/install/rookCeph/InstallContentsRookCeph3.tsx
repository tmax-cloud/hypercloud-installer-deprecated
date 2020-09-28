/* eslint-disable no-console */
import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@material-ui/core';
// import { InstallPageContext } from '../../containers/InstallPage';
import styles from '../InstallContents3.css';
import ProgressBar from '../../ProgressBar';
import routes from '../../../utils/constants/routes.json';
import * as env from '../../../utils/common/env';
import CONST from '../../../utils/constants/constant';
import RookCephInstaller from '../../../utils/class/installer/RookCephInstaller';

const logRef: React.RefObject<HTMLTextAreaElement> = React.createRef();
function InstallContentsRookCeph3(props: any) {
  console.debug(InstallContentsRookCeph3.name, props);
  const { history, match, state } = props;

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
    }, 10000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  if (progress === 100) {
    nowEnv.deleteProductByName(CONST.PRODUCT.ROOK_CEPH.NAME);
    nowEnv.addProduct({
      name: CONST.PRODUCT.ROOK_CEPH.NAME,
      version: state.version
    });
    // json 파일 저장
    env.updateEnv(nowEnv.name, nowEnv);
  }

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

    const rookCephInstaller = RookCephInstaller.getInstance;
    rookCephInstaller.env = nowEnv;

    try {
      await rookCephInstaller.install({
        isCdi: false,
        callback,
        setProgress
      });
    } catch (error) {
      console.error(error);

      await rookCephInstaller.remove();
    } finally {
      console.log();
    }
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
              `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.ROOK_CEPH.NAME}/step2`
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
                `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.ROOK_CEPH.NAME}/step4`
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
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.ROOK_CEPH.NAME}/step1`
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

export default InstallContentsRookCeph3;