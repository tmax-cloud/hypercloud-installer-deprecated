import React, { useContext } from 'react';
import {
  Button,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton
} from '@material-ui/core';
// import { KubeInstallContext } from './InstallContentsKubernetes';
import CloseIcon from '@material-ui/icons/Close';
import CONST from '../../utils/constants/constant';
import routes from '../../utils/constants/routes.json';
import styles from './InstallContentsKubernetes2.css';
import { AppContext } from '../../containers/HomePage';

function InstallContentsKubernetes2(props: any) {
  console.log('InstallContentsKubernetes2');

  const { history, location, match } = props;
  console.debug(props);

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  // const kubeInstallContext = useContext(KubeInstallContext);
  // const { kubeInstallState, dispatchKubeInstall } = kubeInstallContext;

  const [version, setVersion] = React.useState(
    appState.kubeinstallState.version
  );
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setVersion(event.target.value as string);
  };

  const [registry, setRegistry] = React.useState('');

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className={[styles.wrap].join(' ')}>
      <div className={['childLeftRightLeft'].join(' ')}>
        <div className={[styles.titleBox].join(' ')}>
          <span className={['medium'].join(' ')}>쿠버네티스 버전</span>
        </div>
        <div>
          <FormControl variant="outlined" className={styles.select}>
            {/* <InputLabel htmlFor="age-native-simple">Age</InputLabel> */}
            <Select
              native
              value={version}
              onChange={handleChange}
              inputProps={{
                name: 'age',
                id: 'age-native-simple'
              }}
            >
              {/* <option aria-label="None" value="" /> */}
              <option value="1.17.6">1.17.6</option>
            </Select>
          </FormControl>
        </div>
      </div>
      <div className={['childLeftRightLeft'].join(' ')}>
        <div className={[styles.titleBox].join(' ')}>
          <span className={['medium'].join(' ')}>도커 레지스트리 주소</span>
        </div>
        <div>
          <TextField
            id="outlined"
            className={['long'].join(' ')}
            label="도커 레지스트리 주소"
            placeholder="예:192.168.6.169:5000"
            variant="outlined"
            size="small"
            value={registry}
            onChange={e => {
              setRegistry(e.target.value);
              // hasIpError(e.target.value);
            }}
          />
          <div>
            <span className={['small', 'lightDark'].join(' ')}>
              미입력 시, 파드를 생성할 때 Docker Hub에서 이미지를 가져옵니다.
            </span>
          </div>
        </div>
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
            dispatchAppState({
              type: 'set_kubeinstallState',
              kubeinstallState: {
                version,
                registry
              }
            });
            history.push(
              `${routes.INSTALL.HOME}/${appState.nowEnv.name}/kubernetes/step3`
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
                쿠버네티스 설정 화면에서 나가시겠습니까? 설정 내용은 저장되지
                않습니다.
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
                  `${routes.INSTALL.HOME}/${appState.nowEnv.name}/kubernetes/step1`
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

export default InstallContentsKubernetes2;
