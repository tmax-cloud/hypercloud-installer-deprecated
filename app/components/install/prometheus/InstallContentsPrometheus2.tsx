import React, { useState, useContext } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Tooltip
} from '@material-ui/core';
// import { KubeInstallContext } from './InstallContentsKubernetes';
import CloseIcon from '@material-ui/icons/Close';
import CONST from '../../../utils/constants/constant';
import routes from '../../../utils/constants/routes.json';
import styles from '../InstallContents2.css';
import * as env from '../../../utils/common/env';
import { AppContext } from '../../../containers/AppContext';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

function InstallContentsPrometheus2(props: any) {
  console.debug(InstallContentsPrometheus2.name, props);
  const { history, match, state, setState } = props;

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const nowEnv = env.loadEnvByName(match.params.envName);

  // whether to use PVC
  const [isUsePvc, setIsUsePvc] = React.useState('true');
  const handleChangeIsUsePvc = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsUsePvc((event.target as HTMLInputElement).value);
  };

  // service type
  const [serviceType, setServiceType] = React.useState('NodePort');
  const handleChangeServiceType = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setServiceType(event.target.value as string);
  };

  // port
  const [port, setPort] = useState('');
  const [portError, setPortError] = useState('');
  const hasPortError = (target = port, setFunc = setPortError) => {
    if (target.length === 0) {
      setFunc('포트를 입력해주세요');
      return true;
    }

    const portRegex = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;
    if (!portRegex.test(target)) {
      setFunc('0부터 65535 범위 내에서 입력해 주세요.');
      return true;
    }

    setFunc('');
    return false;
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
      <div
        style={{
          margin: '0px'
        }}
        className={['childLeftRightLeft', 'childUpDownCenter'].join(' ')}
      >
        <div className={[styles.titleBox].join(' ')}>
          <span className={['medium'].join(' ')}>
            퍼시스턴츠 볼륨 클레임 (PVC)
          </span>
        </div>
        <div>
          <FormControl component="fieldset">
            {/* <FormLabel component="legend">Gender</FormLabel> */}
            <RadioGroup
              aria-label="gender"
              name="gender1"
              value={isUsePvc}
              onChange={handleChangeIsUsePvc}
            >
              <div className={['childLeftRightLeft'].join(' ')}>
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="사용함"
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="사용 안함"
                />
              </div>
            </RadioGroup>
          </FormControl>
        </div>
      </div>
      <div className={['childLeftRightLeft'].join(' ')}>
        <div className={[styles.titleBox].join(' ')} />
        <div>
          {isUsePvc === 'false' ? (
            <span>
              프로메테우스 파드가 재시작 될 경우, 현재 데이터는 저장되지
              않습니다.
            </span>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className={[''].join(' ')}>
        <div className={[styles.titleBox].join(' ')}>
          <span className={['medium'].join(' ')}>서비스</span>
        </div>
        <div
          style={{
            marginBottom: '10px'
          }}
          className={['childLeftRightLeft'].join(' ')}
        >
          <div className={[styles.titleBox].join(' ')}>
            <span className={['medium'].join(' ')}> - 유형</span>
          </div>
          <div>
            <FormControl variant="outlined">
              <InputLabel id="demo-simple-select-outlined-label">
                Service Type
              </InputLabel>
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={serviceType}
                onChange={handleChangeServiceType}
                label="Service Type"
              >
                <MenuItem value="NodePort">NodePort</MenuItem>
                <MenuItem value="ClusterIP">ClusterIP</MenuItem>
                <MenuItem value="LoadBalancer">LoadBalancer</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
        <div className={['childLeftRightLeft'].join(' ')}>
          <div className={[styles.titleBox].join(' ')}>
            <span className={['medium'].join(' ')}> - 포트</span>
            <span style={{ color: 'red' }}>*</span>
            <Tooltip title="Prometheus Service의 포트로 사용됩니다.">
              <IconButton>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </div>
          <div>
            <TextField
              required
              className={['short'].join(' ')}
              id="outlined-required"
              label="포트"
              placeholder="0~65535"
              variant="outlined"
              size="small"
              value={port}
              onChange={e => {
                setPort(e.target.value);
                // hasPortError(e.target.value);
              }}
              onBlur={e => {
                hasPortError(e.target.value);
              }}
              error={portError.length !== 0}
              helperText={portError}
            />
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
          className={['primary'].join(' ')}
          size="large"
          onClick={() => {
            let hasError = false;
            if (hasPortError()) hasError = true;
            if (hasError) return;

            setState({
              version: state.version,
              isUsePvc: isUsePvc === 'true',
              serviceType,
              port
            });
            dispatchAppState({
              type: 'set_installing',
              installing: CONST.PRODUCT.PROMETHEUS.NAME
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
          className={['secondary'].join(' ')}
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
                {CONST.PRODUCT.PROMETHEUS.NAME} 설정 화면에서 나가시겠습니까?
                설정 내용은 저장되지 않습니다.
              </span>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              className={['primary'].join(' ')}
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
              className={['secondary'].join(' ')}
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
      <div>
        <ul className={['small', 'indicator'].join(' ')}>
          <li>사용가능한 포트를 입력하세요.</li>
        </ul>
      </div>
    </div>
  );
}

export default InstallContentsPrometheus2;
