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
import HyperCloudOperatorInstaller from '../../../utils/class/installer/HyperCloudOperatorInstaller';
import HyperCloudConsoleInstaller from '../../../utils/class/installer/HyperCloudConsoleInstaller';
import HyperCloudWebhookInstaller from '../../../utils/class/installer/HyperCloudWebhookInstaller';
import HyperAuthInstaller from '../../../utils/class/installer/HyperAuthInstaller';

const logRef: React.RefObject<HTMLTextAreaElement> = React.createRef();
function InstallContentsHyperCloud3(props: any) {
  console.debug(InstallContentsHyperCloud3.name, props);
  const { history, match, state } = props;

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

  if (progress === 100) {
    nowEnv.deleteProductByName(CONST.PRODUCT.HYPERCLOUD.NAME);
    nowEnv.addProduct({
      name: CONST.PRODUCT.HYPERCLOUD.NAME,
      operator_version: state.operator_version,
      webhook_version: state.webhook_version,
      console_version: state.console_version
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

    const hyperCloudOperatorInstaller = HyperCloudOperatorInstaller.getInstance;
    hyperCloudOperatorInstaller.env = nowEnv;

    const hyperCloudWebhookInstaller = HyperCloudWebhookInstaller.getInstance;
    hyperCloudWebhookInstaller.env = nowEnv;

    const hyperCloudConsoleInstaller = HyperCloudConsoleInstaller.getInstance;
    hyperCloudConsoleInstaller.env = nowEnv;

    const hyperAuthInstaller = HyperAuthInstaller.getInstance;
    hyperAuthInstaller.env = nowEnv;

    try {
      // operator install
      await hyperCloudOperatorInstaller.install({
        callback,
        setProgress
      });
      setProgress(30);

      // webhook install
      await hyperCloudWebhookInstaller.install({
        callback,
        setProgress
      });
      setProgress(60);

      // console install
      await hyperCloudConsoleInstaller.install({
        callback,
        setProgress
      });
      setProgress(90);

      // realm import
      await hyperAuthInstaller.realmImport({
        callback,
        setProgress
      });
      setProgress(100);
    } catch (error) {
      console.error(error);

      await hyperCloudConsoleInstaller.remove();
      await hyperCloudWebhookInstaller.remove();
      await hyperCloudOperatorInstaller.remove();
      await hyperCloudWebhookInstaller.rollbackApiServerYaml();
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
          className={['primary'].join(' ')}
          size="large"
          onClick={() => {
            // dispatchKubeInstall({
            //   page: 2
            // });
            history.push(
              `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.HYPERCLOUD.NAME}/step2`
            );
          }}
        >
          &lt; 이전
        </Button> */}
        {progress === 100 ? (
          <Button
            variant="contained"
            className={['secondary'].join(' ')}
            size="large"
            onClick={() => {
              history.push(
                `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.HYPERCLOUD.NAME}/step4`
              );
            }}
          >
            완료
          </Button>
        ) : (
          <Button
            variant="contained"
            className={['secondary'].join(' ')}
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
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.HYPERCLOUD.NAME}/step1`
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

export default InstallContentsHyperCloud3;
