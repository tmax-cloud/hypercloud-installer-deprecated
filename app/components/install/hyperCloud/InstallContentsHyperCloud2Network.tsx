import React from 'react';
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
  Checkbox
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CONST from '../../../utils/constants/constant';
import routes from '../../../utils/constants/routes.json';
import styles from '../InstallContents2.css';
import * as env from '../../../utils/common/env';

function InstallContentsHyperCloud2Network(props: any) {
  console.debug(InstallContentsHyperCloud2Network.name, props);
  const { history, match, state, setState } = props;

  const nowEnv = env.loadEnvByName(match.params.envName);

  const [isUseIngress, setIsUseIngress] = React.useState(true);
  const handleChangeIsUseIngress = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsUseIngress(JSON.parse(event.target.value));
  };

  const [stateIngress, setStateIngress] = React.useState({
    sharedIngress: true,
    systemIngress: true
  });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStateIngress({
      ...stateIngress,
      [event.target.name]: event.target.checked
    });
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
      <div
        style={{
          margin: '0px'
        }}
        className={['childLeftRightLeft', 'childUpDownCenter'].join(' ')}
      >
        <div className={[styles.titleBox].join(' ')}>
          <span className={['medium'].join(' ')}>인그레스</span>
        </div>
        <div>
          <FormControl component="fieldset">
            {/* <FormLabel component="legend">Gender</FormLabel> */}
            <RadioGroup
              aria-label="gender"
              name="gender1"
              value={isUseIngress}
              onChange={handleChangeIsUseIngress}
            >
              <div className={['childLeftRightLeft'].join(' ')}>
                <FormControlLabel value control={<Radio />} label="사용함" />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="사용 안함"
                />
              </div>
            </RadioGroup>
          </FormControl>
        </div>
      </div>
      {isUseIngress === true ? (
        <div className={['childLeftRightLeft', 'childUpDownCenter'].join(' ')}>
          <div className={[styles.titleBox].join(' ')}>
            <span className={['medium'].join(' ')}> - 인그레스 컨트롤러</span>
          </div>
          <div>
            <FormControlLabel
              control={(
                <Checkbox
                  checked={stateIngress.sharedIngress}
                  onChange={handleChange}
                  name="sharedIngress"
                />
              )}
              label="사용자 공용"
            />
            <FormControlLabel
              control={(
                <Checkbox
                  checked={stateIngress.systemIngress}
                  onChange={handleChange}
                  name="systemIngress"
                />
              )}
              label="시스템"
            />
          </div>
        </div>
      ) : (
        ''
      )}

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
            setState({
              ...state,
              isUseIngress,
              sharedIngress: stateIngress.sharedIngress,
              systemIngress: stateIngress.systemIngress
            });
            history.push(
              `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.HYPERCLOUD.NAME}/step2-admin`
            );
          }}
        >
          다음
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

export default InstallContentsHyperCloud2Network;
