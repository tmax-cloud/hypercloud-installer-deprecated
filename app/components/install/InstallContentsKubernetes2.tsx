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
  IconButton,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@material-ui/core';
// import { KubeInstallContext } from './InstallContentsKubernetes';
import CloseIcon from '@material-ui/icons/Close';
import CONST from '../../utils/constants/constant';
import routes from '../../utils/constants/routes.json';
import styles from './InstallContentsKubernetes2.css';
import { AppContext } from '../../containers/HomePage';
import * as env from '../../utils/common/env';

function InstallContentsKubernetes2(props: any) {
  console.log('InstallContentsKubernetes2');

  const { history, location, match } = props;
  console.debug(props);

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const nowEnv = env.getEnvByName(match.params.envName);

  // const kubeInstallContext = useContext(KubeInstallContext);
  // const { kubeInstallState, dispatchKubeInstall } = kubeInstallContext;

  const [version, setVersion] = React.useState(
    appState.kubeinstallState.version
  );
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setVersion(event.target.value as string);
  };

  const [registry, setRegistry] = React.useState('public');
  const handleChangeRegistry = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRegistry((event.target as HTMLInputElement).value);
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
          <span className={['medium'].join(' ')}>
            {CONST.PRODUCT.KUBERNETES.NAME} 버전
          </span>
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
          <span className={['medium'].join(' ')}>Docker Registry 설정</span>
        </div>
        <div>
          {/* <TextField
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
          /> */}
          <FormControl component="fieldset">
            {/* <FormLabel component="legend">Gender</FormLabel> */}
            <RadioGroup
              aria-label="gender"
              name="gender1"
              value={registry}
              onChange={handleChangeRegistry}
            >
              <div>
                <FormControlLabel
                  value="public"
                  control={<Radio />}
                  label="Public"
                />
                <FormControlLabel
                  value="private"
                  control={<Radio />}
                  label="Private"
                />
              </div>
            </RadioGroup>
          </FormControl>
          <div>
            {/* <span className={['small', 'lightDark'].join(' ')}>
              미입력 시, 파드를 생성할 때 Docker Hub에서 이미지를 가져옵니다.
            </span> */}
            <span className={['verySmall', 'lightDark'].join(' ')}>
              Public 선택 시, Docker Hub를 Image Registry로 사용합니다.
            </span>
            <br />
            <span className={['verySmall', 'lightDark'].join(' ')}>
              Private 선택 시, Master 노드 한 곳에 Image Registry를 구축하여 사용합니다.
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
            let registryAddr = '';
            if (registry === 'public') {
              registryAddr = '';
            } else if (registry === 'private') {
              const { mainMaster } = env.getArrSortedByRole(nowEnv.nodeList);
              registryAddr = `${mainMaster.ip}:5000`;
            }

            dispatchAppState({
              type: 'set_kubeinstallState',
              kubeinstallState: {
                version,
                registry: registryAddr
              }
            });
            history.push(
              `${routes.INSTALL.HOME}/${nowEnv.name}/kubernetes/step3`
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
                {CONST.PRODUCT.KUBERNETES.NAME} 설정 화면에서 나가시겠습니까?
                설정 내용은 저장되지 않습니다.
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
                  `${routes.INSTALL.HOME}/${nowEnv.name}/kubernetes/step1`
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
