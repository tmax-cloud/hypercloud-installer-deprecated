import React, { useContext } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton
} from '@material-ui/core';
import MuiBox from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import styles from './InstallContentsKubernetes1.css';
import { AppContext } from '../../containers/HomePage';
import CONST from '../../utils/constants/constant';
import KubernetesImage from '../../../resources/assets/Kubernetes_logo.png';
import FinishImage from '../../../resources/assets/img_finish.svg';

function InstallContentsKubernetesAlready() {
  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const getVersion = () => {
    for (let i = 0; i < appState.env.installedProducts.length; i += 1) {
      const target = appState.env.installedProducts[i];
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

  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
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
