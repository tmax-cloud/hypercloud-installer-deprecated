import React, { useState, useContext } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  TextField
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CONST from '../../../utils/constants/constant';
import routes from '../../../utils/constants/routes.json';
import styles from '../InstallContents2.css';
import * as env from '../../../utils/common/env';
import * as validation from '../../../utils/common/validation';
import { AppContext } from '../../../containers/AppContext';

function InstallContentsHyperCloud2Admin(props: any) {
  console.debug(InstallContentsHyperCloud2Admin.name, props);
  const { history, match, state, setState } = props;

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const nowEnv = env.loadEnvByName(match.params.envName);

  console.log(state);

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const hasEmailError = (target = email, setFunc = setEmailError) => {
    if (target.length === 0) {
      setFunc('이메일을 입력해주세요');
      return true;
    }

    if (!validation.checkEmailFormat(target)) {
      setFunc('이메일 형식을 확인해 주세요.');
      return true;
    }

    setFunc('');
    return false;
  };

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const hasPasswordError = (target = password, setFunc = setPasswordError) => {
    if (target.length === 0) {
      setFunc('비밀번호를 입력해주세요.');
      return true;
    }

    if (target.length < 9 || target.length > 20) {
      setFunc('입력 가능한 비밀번호는 최소 9자, 최대 20자 입니다.');
      return true;
    }

    if (!validation.checkHaveUppercase(target)) {
      setFunc('대문자가 포함되어야 합니다.');
      return true;
    }

    if (!validation.checkHaveLowercase(target)) {
      setFunc('소문자가 포함되어야 합니다.');
      return true;
    }

    if (!validation.checkHaveNumber(target)) {
      setFunc('숫자가 포함되어야 합니다.');
      return true;
    }

    if (!validation.checkHaveSpecialCharacter(target)) {
      setFunc('특수문자가 포함되어야 합니다.');
      return true;
    }

    setFunc('');
    return false;
  };

  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const hasPasswordConfirmError = (
    target = passwordConfirm,
    setFunc = setPasswordConfirmError
  ) => {
    if (target.length === 0) {
      setFunc('비밀번호 확인을 위해 비밀번호를 다시 입력해 주세요.');
      return true;
    }

    if (password !== target) {
      setFunc(
        '입력한 비밀번호와 재입력한 비밀번호가 일치하지 않습니다. 다시 확인해 주세요'
      );
      return true;
    }

    setFunc('');
    return false;
  };

  return (
    <div className={[styles.wrap].join(' ')}>
      <div
        style={{
          margin: '0px'
        }}
        className={['childLeftRightLeft', 'childUpDownUp'].join(' ')}
      >
        <div className={[styles.titleBox].join(' ')}>
          <span className={['medium'].join(' ')}>이메일</span>
          <span style={{ color: 'red' }}>*</span>
        </div>
        <div>
          <TextField
            required
            className={['long'].join(' ')}
            id="outlined-required"
            label="E-mail"
            placeholder=""
            variant="outlined"
            size="small"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              // hasIpError(e.target.value);
            }}
            onBlur={e => {
              hasEmailError(e.target.value);
            }}
            error={emailError.length !== 0}
            helperText={emailError}
          />
        </div>
      </div>
      <div className={['childLeftRightLeft', 'childUpDownCenter'].join(' ')}>
        <div className={[styles.titleBox].join(' ')} />
        <div>
          추후 비밀번호를 찾거나 변경하려면 유효한 계정을 입력해야 합니다.
        </div>
      </div>
      <div
        style={{
          marginBottom: '10px'
        }}
        className={['childLeftRightLeft', 'childUpDownUp'].join(' ')}
      >
        <div className={[styles.titleBox].join(' ')}>
          <span className={['medium'].join(' ')}>비밀번호</span>
          <span style={{ color: 'red' }}>*</span>
        </div>
        <div>
          <TextField
            required
            type="password"
            className={['long'].join(' ')}
            id="outlined-required"
            label="Password"
            placeholder=""
            variant="outlined"
            size="small"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              // hasIpError(e.target.value);
            }}
            onBlur={e => {
              hasPasswordError(e.target.value);
            }}
            error={passwordError.length !== 0}
            helperText={passwordError}
          />
        </div>
      </div>
      <div className={['childLeftRightLeft', 'childUpDownCenter'].join(' ')}>
        <div className={[styles.titleBox].join(' ')}>
          <span className={['medium'].join(' ')} />
        </div>
        <div>
          <TextField
            required
            type="password"
            className={['long'].join(' ')}
            id="outlined-required"
            label="Password Confirm"
            placeholder=""
            variant="outlined"
            size="small"
            value={passwordConfirm}
            onChange={e => {
              setPasswordConfirm(e.target.value);
              // hasIpError(e.target.value);
            }}
            onBlur={e => {
              hasPasswordConfirmError(e.target.value);
            }}
            error={passwordConfirmError.length !== 0}
            helperText={passwordConfirmError}
          />
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
            if (hasEmailError()) hasError = true;
            if (hasPasswordError()) hasError = true;
            if (hasPasswordConfirmError()) hasError = true;
            if (hasError) return;
            setState({
              ...state,
              email,
              password
            });
            dispatchAppState({
              type: 'set_installing',
              installing: CONST.PRODUCT.HYPERCLOUD.NAME
            });
            history.push(
              `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.HYPERCLOUD.NAME}/step3`
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
                {CONST.PRODUCT.HYPERCLOUD.NAME} 설정 화면에서 나가시겠습니까?
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
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.HYPERCLOUD.NAME}/step1`
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
    </div>
  );
}

export default InstallContentsHyperCloud2Admin;
