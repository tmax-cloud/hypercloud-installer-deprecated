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
import TektonPipelineInstaller from '../../../utils/class/installer/TektonPipelineInstaller';
import TektonApprovalInstaller from '../../../utils/class/installer/TektonApprovalInstaller';
import TektonCiCdTemplatesInstaller from '../../../utils/class/installer/TektonCiCdTemplatesInstaller';
import TektonMailNotifierInstaller from '../../../utils/class/installer/TektonMailNotifierInstaller';
import TektonTriggerInstaller from '../../../utils/class/installer/TektonTriggerInstaller';

const logRef: React.RefObject<HTMLTextAreaElement> = React.createRef();
function InstallContentsTekton3(props: any) {
  console.debug(InstallContentsTekton3.name, props);
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
    nowEnv.deleteProductByName(CONST.PRODUCT.TEKTON.NAME);
    nowEnv.addProduct({
      name: CONST.PRODUCT.TEKTON.NAME,
      pipeline_version: state.pipeline_version,
      trigger_version: state.trigger_version,
      approval_version: state.approval_version,
      mailNotifier_version: state.mailNotifier_version,
      cicdTemplates_version: state.cicdTemplates_version
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

    const tektonPipelineInstaller = TektonPipelineInstaller.getInstance;
    const tektonTriggerInstaller = TektonTriggerInstaller.getInstance;
    const tektonApprovalInstaller = TektonApprovalInstaller.getInstance;
    const tektonMailNotifierInstaller = TektonMailNotifierInstaller.getInstance;
    const tektonCiCdTemplatesInstaller = TektonCiCdTemplatesInstaller.getInstance;

    tektonPipelineInstaller.env = nowEnv;
    tektonTriggerInstaller.env = nowEnv;
    tektonApprovalInstaller.env = nowEnv;
    tektonMailNotifierInstaller.env = nowEnv;
    tektonCiCdTemplatesInstaller.env = nowEnv;

    try {
      // tektonPipelineInstaller install
      await tektonPipelineInstaller.install({
        callback,
        setProgress
      });
      setProgress(20);

      // tektonTriggerInstaller install
      await tektonTriggerInstaller.install({
        callback,
        setProgress
      });
      setProgress(40);

      // tektonApprovalInstaller install
      await tektonApprovalInstaller.install({
        callback,
        setProgress
      });
      setProgress(60);

      // tektonMailNotifierInstaller install
      await tektonMailNotifierInstaller.install({
        callback,
        setProgress
      });
      setProgress(80);

      // tektonCiCdTemplatesInstaller install
      await tektonCiCdTemplatesInstaller.install({
        callback,
        setProgress
      });
      setProgress(100);
    } catch (error) {
      console.error(error);

      await tektonPipelineInstaller.remove();
      await tektonTriggerInstaller.remove();
      await tektonApprovalInstaller.remove();
      await tektonMailNotifierInstaller.remove();
      await tektonCiCdTemplatesInstaller.remove();
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
              `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.TEKTON.NAME}/step2`
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
                `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.TEKTON.NAME}/step4`
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
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.TEKTON.NAME}/step1`
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

export default InstallContentsTekton3;