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
import styles from './InstallContents2.css';
import { AppContext } from '../../containers/HomePage';
import * as env from '../../utils/common/env';

function InstallContentsCni2(props: any) {
  console.debug(InstallContentsCni2.name, props);
  const { history, location, match, state, setState } = props;

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

  const nowEnv = env.loadEnvByName(match.params.envName);

  // const kubeInstallContext = useContext(KubeInstallContext);
  // const { kubeInstallState, dispatchKubeInstall } = kubeInstallContext;

  // const [version, setVersion] = React.useState(state.version);
  const handleChangeVersion = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setState((prevState: any) => {
      return { ...prevState, version: event.target.value as string };
    });
    // setVersion(event.target.value as string);
  };

  // const [type, setType] = React.useState(state.type);
  const handleChangeType = (event: React.ChangeEvent<{ value: unknown }>) => {
    setState((prevState: any) => {
      return { ...prevState, type: event.target.value as string };
    });
    // setType(event.target.value as string);
  };

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
          <span className={['medium'].join(' ')}>CNI</span>
        </div>
        <div>
          <FormControl variant="outlined" className={styles.select}>
            {/* <InputLabel htmlFor="age-native-simple">Age</InputLabel> */}
            <Select
              native
              value={state.type}
              onChange={handleChangeType}
              inputProps={{
                name: 'age',
                id: 'age-native-simple'
              }}
            >
              {CONST.PRODUCT.CNI.SUPPORTED_TYPE.map(v => {
                return (
                  <option key={v} value={v}>
                    {v}
                  </option>
                );
              })}
            </Select>
          </FormControl>
        </div>
      </div>
      <div className={['childLeftRightLeft'].join(' ')}>
        <div className={[styles.titleBox].join(' ')}>
          <span className={['medium'].join(' ')}>Version</span>
        </div>
        <div>
          <FormControl variant="outlined" className={styles.select}>
            {/* <InputLabel htmlFor="age-native-simple">Age</InputLabel> */}
            <Select
              native
              value={state.version}
              onChange={handleChangeVersion}
              inputProps={{
                name: 'age',
                id: 'age-native-simple'
              }}
            >
              {CONST.PRODUCT.CNI.SUPPORTED_VERSION.map(v => {
                return (
                  <option key={v} value={v}>
                    {v}
                  </option>
                );
              })}
            </Select>
          </FormControl>
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
            setState({
              version: state.version,
              type: state.type
            });
            history.push(
              `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.CNI.NAME}/step3`
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
                {CONST.PRODUCT.CNI.NAME} 설정 화면에서 나가시겠습니까? 설정
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
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.CNI.NAME}/step1`
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

export default InstallContentsCni2;
