import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton
} from '@material-ui/core';
// import { KubeInstallContext } from './InstallContentsKubernetes';
import CloseIcon from '@material-ui/icons/Close';
import CONST from '../../../utils/constants/constant';
import routes from '../../../utils/constants/routes.json';
import styles from '../InstallContents2.css';
import * as env from '../../../utils/common/env';

function InstallContentsPrometheus2(props: any) {
  console.debug(InstallContentsPrometheus2.name, props);
  const { history, match, state, setState } = props;

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

  const nowEnv = env.loadEnvByName(match.params.envName);

  // const kubeInstallContext = useContext(KubeInstallContext);
  // const { kubeInstallState, dispatchKubeInstall } = kubeInstallContext;

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className={[styles.wrap].join(' ')}>
      {/* <div className={['childLeftRightLeft'].join(' ')}>
        <div className={[styles.titleBox].join(' ')}>
          <span className={['medium'].join(' ')}>PROMETHEUS</span>
        </div>
        <div>
          <FormControl variant="outlined" className={styles.select}>
            <InputLabel htmlFor="age-native-simple">Age</InputLabel>
            <Select
              native
              value={state.type}
              onChange={handleChangeType}
              inputProps={{
                name: 'age',
                id: 'age-native-simple'
              }}
            >
              {CONST.PRODUCT.PROMETHEUS.SUPPORTED_TYPE.map(v => {
                return (
                  <option key={v} value={v}>
                    {v}
                  </option>
                );
              })}
            </Select>
          </FormControl>
        </div>
      </div> */}
      {/* <div className={['childLeftRightLeft'].join(' ')}>
        <div className={[styles.titleBox].join(' ')}>
          <span className={['medium'].join(' ')}>Version</span>
        </div>
        <div>
          <FormControl variant="outlined" className={styles.select}>
            <InputLabel htmlFor="age-native-simple">Age</InputLabel>
            <Select
              native
              value={state.version}
              onChange={handleChangeVersion}
              inputProps={{
                name: 'age',
                id: 'age-native-simple'
              }}
            >
              {CONST.PRODUCT.PROMETHEUS.SUPPORTED_VERSION.map(v => {
                return (
                  <option key={v} value={v}>
                    {v}
                  </option>
                );
              })}
            </Select>
          </FormControl>
        </div>
      </div> */}
      <div>
        <span className={['medium', 'lightDark'].join(' ')}>{CONST.PRODUCT.PROMETHEUS.NAME} 를 환경에 설치 하시겠습니까?</span>
      </div>
      <div
        style={{ marginTop: '50px' }}
        className={['childLeftRightCenter'].join(' ')}
      >
        <Button
          variant="contained"
          style={{ marginRight: '10px' }}
          className={['pink'].join(' ')}
          size="large"
          onClick={() => {
            setState({
              version: state.version,
              type: state.type
            });
            history.push(
              `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.PROMETHEUS.NAME}/step3`
            );
          }}
        >
          설치
        </Button>
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
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            나가기
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
                {CONST.PRODUCT.PROMETHEUS.NAME} 설정 화면에서 나가시겠습니까? 설정
                내용은 저장되지 않습니다.
              </span>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              className={['blue'].join(' ')}
              size="small"
              onClick={() => {
                handleClose();
                history.push(
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.PROMETHEUS.NAME}/step1`
                );
              }}
            >
              나가기
            </Button>
            <Button
              className={['white'].join(' ')}
              onClick={handleClose}
              color="primary"
              size="small"
              autoFocus
            >
              취소
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default InstallContentsPrometheus2;
