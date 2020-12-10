import React, { useState, useContext } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import CONST from '../../../utils/constants/constant';
import routes from '../../../utils/constants/routes.json';
import styles from '../InstallContents2.css';
import * as env from '../../../utils/common/env';
import * as validation from '../../../utils/common/validation';
import { AppContext } from '../../../containers/AppContext';

function InstallContentsMetalLb2(props: any) {
  console.debug(InstallContentsMetalLb2.name, props);
  const { history, match, state, setState } = props;

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const nowEnv = env.loadEnvByName(match.params.envName);

  const [startIp, setStartIp] = useState('');
  const [startIpError, setStartIpError] = useState('');

  const [endIp, setEndIp] = useState('');
  const [endIpError, setEndIpError] = useState('');

  const hasIpError = (target = '', setFunc: any) => {
    if (target.length === 0) {
      setFunc('IP를 입력해주세요');
      return true;
    }

    if (!validation.checkIpFormat(target)) {
      setFunc('IP 형식을 확인해 주세요.');
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

  const initValue = () => {
    setStartIp('');
    setEndIp('');
  };

  const getRemoveButton = (row: any) => {
    return (
      <IconButton
        aria-label="delete"
        onClick={e => {
          // 마스터 노드 seleted 변경 안되게 하기 위해 이벤트 전파 막음
          e.stopPropagation();
          setState((prevState: any) => {
            const data = [...prevState.data];

            for (let i = 0; i < data.length; i += 1) {
              if (data[i].ip === row.ip) {
                // 삭제
                data.splice(i, 1);
                break;
              }
            }
            return { ...prevState, data };
          });
        }}
      >
        <RemoveIcon />
      </IconButton>
    );
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
          <span className={['medium'].join(' ')}>Address Pool</span>
          <Tooltip title="Kubernetes Service의 External IP 대역으로 사용됩니다.">
            <IconButton>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </div>
        <div>
          <div>
            <TextField
              required
              className={['medium'].join(' ')}
              id="outlined-required"
              label="Start IP"
              placeholder="예: 172.22.8.160"
              variant="outlined"
              size="small"
              value={startIp}
              onChange={e => {
                setStartIp(e.target.value);
                // hasIpError(e.target.value);
              }}
              onBlur={e => {
                hasIpError(e.target.value, setStartIpError);
              }}
              error={startIpError.length !== 0}
              helperText={startIpError}
            />
          </div>
        </div>
        <div>
          <span
            style={{
              margin: '0px 5px 0px 5px'
            }}
            className={['medium'].join(' ')}
          >
            {' '}
            ~{' '}
          </span>
        </div>
        <div>
          <div>
            <TextField
              required
              className={['medium'].join(' ')}
              id="outlined-required"
              label="End IP"
              placeholder="예: 172.22.8.180"
              variant="outlined"
              size="small"
              value={endIp}
              onChange={e => {
                setEndIp(e.target.value);
                // hasIpError(e.target.value);
              }}
              onBlur={e => {
                hasIpError(e.target.value, setEndIpError);
              }}
              error={endIpError.length !== 0}
              helperText={endIpError}
            />
          </div>
        </div>
        <div>
          <Button
            style={{
              marginLeft: '10px'
            }}
            className={['white', 'indicator'].join(' ')}
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              let hasError = false;
              if (hasIpError(startIp, setStartIpError)) hasError = true;
              if (hasIpError(endIp, setEndIpError)) hasError = true;
              if (hasError) return;

              setState((prevState: any) => {
                const data = [...prevState.data];
                console.log(startIp, endIp);
                // 0번째 index에 삽입
                data.splice(0, 0, `${startIp}-${endIp}`);
                return { ...prevState, data };
              });
              // 초기화
              initValue();
            }}
          >
            추가
          </Button>
        </div>
      </div>
      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="simple table">
          <TableHead className={['primary'].join(' ')}>
            <TableRow>
              <TableCell
                align="center"
                style={{ padding: '0px', width: '40%' }}
              >
                <span>IP Range</span>
              </TableCell>
              <TableCell
                align="center"
                style={{ padding: '0px', width: '20%' }}
              >
                <span>제거</span>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.data.map(row => (
              <TableRow key={row}>
                <TableCell
                  align="center"
                  style={{ padding: '0px', width: '40%' }}
                >
                  {row}
                </TableCell>
                <TableCell
                  align="center"
                  style={{ padding: '0px', width: '20%' }}
                >
                  {getRemoveButton(row)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
            if (state.data.length < 1) {
              // TODO: error msg
              return;
            }
            dispatchAppState({
              type: 'set_installing',
              installing: CONST.PRODUCT.METAL_LB.NAME
            });
            history.push(
              `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.METAL_LB.NAME}/step3`
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
                {CONST.PRODUCT.METAL_LB.NAME} 설정 화면에서 나가시겠습니까? 설정
                내용은 저장되지 않습니다.
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
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.METAL_LB.NAME}/step1`
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
          <li>IP가 최소 10개가 보장되어야 합니다.</li>
          <li>HOST IP 대역에서 접근가능한 대역이어야 합니다.</li>
        </ul>
      </div>
    </div>
  );
}

export default InstallContentsMetalLb2;
