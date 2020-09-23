import React from 'react';
import {
  Button,
  Select,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CONST from '../../../utils/constants/constant';
import routes from '../../../utils/constants/routes.json';
import styles from '../InstallContents2.css';
import * as env from '../../../utils/common/env';
import { NETWORK_TYPE } from '../../../utils/class/Env';

function InstallContentsKubernetes2(props: any) {
  console.debug(InstallContentsKubernetes2.name, props);
  const { history, location, match, state, setState } = props;

  const nowEnv = env.loadEnvByName(match.params.envName);

  const handleChangeVersion = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setState({
      version: event.target.value as string
    });
    // setVersion(event.target.value as string);
  };

  const [registryType, setRegistryType] = React.useState(() => {
    if (nowEnv.networkType === NETWORK_TYPE.INTERNAL) {
      return 'private';
    }
    if (nowEnv.networkType === NETWORK_TYPE.EXTERNAL) {
      return 'public';
    }
  });
  const handleChangeRegistryType = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRegistryType((event.target as HTMLInputElement).value);
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
          <span className={['medium'].join(' ')}>Version</span>
        </div>
        <div>
          <span className={['medium', 'lightDark'].join(' ')}>
            {state.version}
          </span>
        </div>
      </div>
      <div className={['childLeftRightLeft'].join(' ')}>
        <div className={[styles.titleBox].join(' ')}>
          <span className={['medium'].join(' ')}>Image Registry 설정</span>
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
          <FormControl
            component="fieldset"
            disabled={nowEnv.networkType === NETWORK_TYPE.INTERNAL}
          >
            {/* <FormLabel component="legend">Gender</FormLabel> */}
            <RadioGroup
              aria-label="gender"
              name="gender1"
              value={registryType}
              onChange={handleChangeRegistryType}
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
              Private 선택 시, Master 노드 한 곳에 Docker Image Registry를
              구축하여 사용합니다.
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
            let registry = '';
            if (registryType === 'private') {
              const { mainMaster } = nowEnv.getNodesSortedByRole();
              registry = `${mainMaster.ip}:5000`;
            }
            setState({
              version: state.version,
              registry
            });
            history.push(
              `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.KUBERNETES.NAME}/step3`
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
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.KUBERNETES.NAME}/step1`
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
