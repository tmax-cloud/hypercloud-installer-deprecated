import React, { useContext } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import MuiBox from '@material-ui/core/Box';
import styles from './InstallContentsKubernetes1.css';
import { AppContext } from '../../containers/HomePage';
import CONST from '../../utils/constants/constant';

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
              className="childUpDownCenter"
              borderRadius="50%"
              {...defaultProps}
            >
              <div>
                <div>
                  <span>[이미지]</span>
                  <span>Kubernetes</span>
                </div>
                <span>
                  컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스
                </span>
              </div>
            </MuiBox>
          </div>
          <div>
            <div>버전</div>
            <div>{getVersion()}</div>
          </div>
          <div>
            <span>더 이상 사용하지 않는다면?</span>
          </div>
          <div>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                handleClickOpen();
              }}
            >
              삭제
            </Button>
            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">삭제</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                쿠버네티스를 삭제하시겠습니까?
                삭제 시, 호환 제품의 기능도 모두 삭제됩니다.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    handleClose();
                    // TODO:delete kubernetes
                  }}
                  color="primary"
                >
                  삭제
                </Button>
                <Button onClick={handleClose} color="primary" autoFocus>
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
