import React, { useContext } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  CircularProgress,
  makeStyles,
  Theme,
  createStyles
} from '@material-ui/core';
import MuiBox from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import styles from './InstallContentsKubernetes1.css';
import { AppContext } from '../../containers/HomePage';
import * as Script from '../../utils/common/script';
import CONST from '../../utils/constants/constant';
import KubernetesImage from '../../../resources/assets/Kubernetes_logo.png';
import FinishImage from '../../../resources/assets/img_finish.svg';
import * as env from '../../utils/common/env';
import routes from '../../utils/constants/routes.json';
import { Role } from '../../utils/class/Node';
import * as Common from '../../utils/common/ssh';
import { green } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    buttonSuccess: {
      backgroundColor: green[500],
      '&:hover': {
        backgroundColor: green[700]
      }
    }
  })
);

function InstallContentsKubernetesAlready(props: any) {
  console.log('InstallContentsKubernetesAlready');

  const { history, location, match } = props;
  console.debug(props);

  const classes = useStyles();

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const [loading, setLoading] = React.useState(false);

  const getVersion = () => {
    for (let i = 0; i < appState.nowEnv.installedProducts.length; i += 1) {
      const target = appState.nowEnv.installedProducts[i];
      if (target.name === CONST.PRODUCT.KUBERNETES_TXT) {
        return target.version;
      }
    }
  };

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const defaultProps = {
    bgcolor: 'background.paper',
    borderColor: 'text.primary',
    m: 1,
    border: 1,
    style: { width: '20rem', height: '20rem' }
  };

  const remove = async () => {
    setLoading(true);
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
        command += Script.getK8sMasterRemoveScript();
        master.cmd = command;
        console.log(master.cmd);
        return Common.send(master, {
          close: () => {},
          stdout: (data: string) => {
            console.log('stdout!!');
          },
          stderr: (data: string) => {
            console.log('stderr!!');
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
    setLoading(false);
  };
  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
      <div>
        <div className={styles.contents}>
          <div className="childLeftRightCenter">
            <MuiBox
              className={['childUpDownCenter', styles.installedCircle].join(
                ' '
              )}
              borderRadius="50%"
              {...defaultProps}
            >
              <div className={[styles.insideCircle].join(' ')}>
                <img
                  style={{
                    heigh: '50px',
                    width: '50px',
                    position: 'relative',
                    left: '-125px'
                  }}
                  src={FinishImage}
                  alt="Logo"
                />
                <div>
                  <img src={KubernetesImage} alt="Logo" />
                </div>
                <div>
                  <span className={['large', 'thick'].join(' ')}>
                    Kubernetes
                  </span>
                </div>
                <div>
                  <span className={['small', 'lightDark'].join(' ')}>
                    컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스
                  </span>
                </div>
              </div>
            </MuiBox>
          </div>
          <div>
            <div>
              <span className={['medium', 'thick'].join(' ')}>버전</span>
            </div>
            <div>
              <span className={['medium', 'lightDark'].join(' ')}>
                {getVersion()}
              </span>
            </div>
          </div>
          <div>
            <span
              style={{ marginRight: '5px' }}
              className={['small', 'lightDark'].join(' ')}
            >
              더 이상 사용하지 않는다면?
            </span>
            <span className={['small', 'indicator'].join(' ')}>
              <a
                onClick={() => {
                  handleClickOpen();
                }}
              >
                삭제
              </a>
            </span>
          </div>
          <div>
            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                삭제
                <IconButton
                  style={{
                    position: 'absolute',
                    right: '5px',
                    top: '5px'
                  }}
                  aria-label="close"
                  onClick={handleClose}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  <span className={['lightDark', 'small'].join(' ')}>
                    쿠버네티스를 삭제하시겠습니까? 삭제 시, 호환 제품의 기능도
                    모두 삭제됩니다.
                  </span>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  className={['blue'].join(' ')}
                  onClick={() => {
                    handleClose();
                    // TODO:delete kubernetes
                    env.deleteProductByName(
                      appState.nowEnv.name,
                      CONST.PRODUCT.KUBERNETES_TXT
                    );
                    remove();
                    history.push(
                      `${routes.INSTALL.HOME}/${appState.nowEnv.name}/main`
                    );
                  }}
                >
                  삭제
                </Button>
                <Button
                  className={['white'].join(' ')}
                  onClick={handleClose}
                  autoFocus
                >
                  취소
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>
        {/* <button
          type="button"
          onClick={() => {
            abc();
          }}
        >
          test
        </button>
        <span>{cnt}</span>
        <textarea value={stdout} disabled />
        <textarea value={stderr} disabled />
        <LinearProgressWithLabel value={progress} /> */}
      </div>
    </div>
  );
}

export default InstallContentsKubernetesAlready;
