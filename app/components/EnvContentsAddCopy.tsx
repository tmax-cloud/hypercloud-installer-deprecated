import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {
  Radio,
  Tooltip,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  IconButton,
  InputAdornment
} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import CONST from '../constants/constant';
import styles from './EnvContentsAdd.css';
import env from '../constants/env.json';

interface Props {
  dispatchEnvPage: Function;
}

interface Data {
  ip: string;
  port: string;
  password: string;
}

function EnvContentsAdd(props: Props) {
  const { dispatchEnvPage } = props;

  const [state, setState] = useState({
    data: []
  });

  const [selected, setSelected] = React.useState<string[]>([]);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const hasNameError = (target = name, setFunc = setNameError) => {
    if (target.length === 0) {
      setFunc('이름을 입력해주세요');
      return true;
    }

    for (let i = 0; i < env.length; i += 1) {
      if (target === env[i].name) {
        console.log(target, env[i].name);
        setNameError('중복 된 이름이 존재합니다.');
        return true;
      }
    }

    // TODO: 최소 2자 이상, 최대 32 이하의 영문 소문자, 숫자, 특수문자(“-”)만 입력할 수 있습니다.

    setFunc('');
    return false;
  };

  const [ip, setIp] = useState('');
  const [ipError, setIpError] = useState('');
  const hasIpError = (target = ip, setFunc = setIpError) => {
    if (target.length === 0) {
      setFunc('IP를 입력해주세요');
      return true;
    }

    for (let i = 0; i < state.data.length; i += 1) {
      if (state.data[i].ip === target) {
        setFunc('중복 된 IP가 존재합니다.');
        return true;
      }
    }

    // TODO:IP 형식과 맞지 않은 경우 오류

    setFunc('');
    return false;
  };

  const [port, setPort] = useState('');
  const [portError, setPortError] = useState('');
  const hasPortError = (target = port, setFunc = setPortError) => {
    if (target.length === 0) {
      setFunc('포트를 입력해주세요');
      return true;
    }

    if (Number(target) < 0 || Number(target) > 65535) {
      setFunc('0부터 65535 범위 내에서 입력해 주세요.');
      return true;
    }

    setFunc('');
    return false;
  };

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const hasPasswordError = (target = password, setFunc = setPasswordError) => {
    if (target.length === 0) {
      setFunc('사용자 비밀번호를 입력해주세요');
      return true;
    }

    setFunc('');
    return false;
  };

  const [totalError, setTotalError] = useState('');
  const hasTotalError = (target = state.data, setFunc = setTotalError) => {
    if (target.length === 0) {
      setFunc('노드를 추가해주세요.');
      return true;
    }

    setFunc('');
    return false;
  };

  const [isShowPassword, setisShowPassword] = useState(true);

  const initValue = () => {
    setIp('');
    setPort('');
    setPassword('');
  };

  const getEmptyTableRow = () => {
    if (state.data.length === 0) {
      return (
        <div className="childLeftRightCenter">
          <span
            style={{
              'marginTop': '10px'
            }}
          >
            추가된 노드가 없습니다.
          </span>
        </div>
      );
    }
  };

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const useStyles = makeStyles({
    table: {
      minWidth: 650
    }
  });

  // function createData(
  //   name: string,
  //   calories: number,
  //   fat: number,
  //   carbs: number,
  //   protein: number
  // ) {
  //   return { name, calories, fat, carbs, protein };
  // }

  const rows = [
    // createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    // createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    // createData('Eclair', 262, 16.0, 24, 6.0),
    // createData('Cupcake', 305, 3.7, 67, 4.3),
    // createData('Gingerbread', 356, 16.0, 49, 3.9),
  ];

  const handleClick = (event: React.MouseEvent<unknown>, clickedIp: string) => {
    // TODO: 추후 다중 마스터 선택 가능 시, checkbox로 변경
    // const selectedIndex = selected.indexOf(clickedIp);
    // let newSelected: string[] = [];

    // if (selectedIndex === -1) {
    //   newSelected = newSelected.concat(selected, clickedIp);
    // } else if (selectedIndex === 0) {
    //   newSelected = newSelected.concat(selected.slice(1));
    // } else if (selectedIndex === selected.length - 1) {
    //   newSelected = newSelected.concat(selected.slice(0, -1));
    // } else if (selectedIndex > 0) {
    //   newSelected = newSelected.concat(
    //     selected.slice(0, selectedIndex),
    //     selected.slice(selectedIndex + 1)
    //   );
    // }
    // setSelected(newSelected);
    setSelected([clickedIp]);
  };

  const isSelected = (clickedIp: string) => {
    return selected.indexOf(clickedIp) !== -1;
  };

  const getPasswordVisibility = () => {
    return isShowPassword ? (
      <VisibilityOffIcon
        className={styles.icon}
        onClick={() => {
          setisShowPassword(false);
        }}
      />
    ) : (
      <VisibilityIcon
        className={styles.icon}
        onClick={() => {
          setisShowPassword(true);
        }}
      />
    );
  };

  const classes = useStyles();

  const [values, setValues] = React.useState<State>({
    amount: '',
    password: '',
    weight: '',
    weightRange: '',
    showPassword: false
  });

  const handleChange = (prop: keyof State) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <div className={[styles.wrap, 'childUpDownCenter'].join(' ')}>
      <div className={styles.box}>
        <div className={[styles.rowBox, 'childUpDownCenter'].join(' ')}>
          <div>
            <span>이름</span>
          </div>
          <div>
            {/* <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                hasNameError(e.target.value);
              }}
            /> */}
            <TextField
              required
              id="outlined-required"
              label="Name"
              variant="outlined"
              size="small"
            />
            <span className={nameError ? 'visible red' : 'hidden'}>
              {nameError}
            </span>
          </div>
        </div>
        <div className={[styles.rowBox, 'childUpDownCenter'].join(' ')}>
          <div className={['left', 'childUpDownCenter'].join(' ')}>
            <span>노드</span>
          </div>
          <div className="left">
            <div>
              <span>IP</span>
            </div>
            <div>
              {/* <input
                type="text"
                value={ip}
                onChange={e => {
                  setIp(e.target.value);
                  hasIpError(e.target.value);
                }}
              /> */}
              <TextField
                required
                id="outlined-required"
                label="IP"
                variant="outlined"
                size="small"
              />
            </div>
            <div
              className={[
                ipError ? 'visible red' : 'hidden',
                styles.errorBox
              ].join(' ')}
            >
              <span>{ipError}</span>
            </div>
          </div>
          <div className="left">
            <div>
              <span>포트</span>
            </div>
            <div>
              {/* <input
                type="number"
                min="0"
                max="65535"
                value={port}
                onChange={e => {
                  setPort(e.target.value);
                  hasPortError(e.target.value);
                }}
              /> */}
              <TextField
                required
                id="outlined-required"
                label="Port"
                variant="outlined"
                size="small"
              />
            </div>
            <div
              className={[
                portError ? 'visible red' : 'hidden',
                styles.errorBox
              ].join(' ')}
            >
              <span>{portError}</span>
            </div>
          </div>
          <div className="left">
            <div>
              <Tooltip
                title="root 계정 비밀번호를 입력해 주세요."
                placement="top"
              >
                <span>사용자 비밀번호</span>
              </Tooltip>
            </div>
            <div className="childUpDownDown">
              {/* <input
                type={isShowPassword ? 'password' : 'text'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  hasPasswordError(e.target.value);
                }}
              />
              {getPasswordVisibility()} */}
              <FormControl
                // className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                size="small"
              >
                <InputLabel htmlFor="outlined-adornment-password">
                  Password
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={values.showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={handleChange('password')}
                  endAdornment={(
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {values.showPassword ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    </InputAdornment>
                  )}
                  labelWidth={70}
                />
              </FormControl>
            </div>
            <div
              className={[
                passwordError ? 'visible red' : 'hidden',
                styles.errorBox
              ].join(' ')}
            >
              <span>{passwordError}</span>
            </div>
          </div>
          <div>
            {/* <button
              type="button"
              onClick={() => {
                let hasError = false;
                if (hasIpError()) hasError = true;
                if (hasPortError()) hasError = true;
                if (hasPasswordError()) hasError = true;
                if (hasError) return;

                // TODO:연결테스트 진행

                // 첫번째 추가 시, 마스터 노드로 설정
                if (state.data.length === 0) {
                  setSelected([ip]);
                }

                setState(prevState => {
                  const data = [...prevState.data];

                  // 0번째 index에 삽입
                  data.splice(0, 0, {
                    ip,
                    port,
                    password
                  });
                  return { ...prevState, data };
                });

                // 초기화
                initValue();

                setTotalError('');
              }}
            >
              추가
            </button> */}
            <Button variant="contained" color="primary" size="small">
              추가
            </Button>
          </div>
        </div>
        <div className={[styles.table].join(' ')}>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    style={{ padding: '0px', width: '20%' }}
                  >
                    마스터 노드
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ padding: '0px', width: '40%' }}
                  >
                    IP
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ padding: '0px', width: '20%' }}
                  >
                    포트
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ padding: '0px', width: '20%' }}
                  >
                    제거
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {state.data.map((row, index) => (
                  <TableRow
                    key={row.ip}
                    onClick={event => handleClick(event, row.ip)}
                  >
                    <TableCell
                      align="center"
                      component="th"
                      scope="row"
                      style={{ padding: '0px', width: '20%' }}
                    >
                      <Radio checked={isSelected(row.ip)} />
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ padding: '0px', width: '40%' }}
                    >
                      {row.ip}
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ padding: '0px', width: '20%' }}
                    >
                      {row.port}
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ padding: '0px', width: '20%' }}
                    >
                      <button
                        type="button"
                        onClick={e => {
                          // 마스터 노드 seleted 변경 안되게 하기 위해 이벤트 전파 막음
                          e.stopPropagation();

                          // 제거한 노드가 마스터 노드라면
                          // 첫번째 노드로 마스터 노드 변경
                          if (selected[0] === row.ip) {
                            if (state.data.length > 0) {
                              setSelected([state.data[0].ip]);
                            } else {
                              setSelected([]);
                            }
                          }

                          setState(prevState => {
                            const data = [...prevState.data];

                            for (let i = 0; i < data.length; i += 1) {
                              if (data[i].ip === row.ip) {
                                data.splice(i, 1);
                                break;
                              }
                            }
                            return { ...prevState, data };
                          });
                        }}
                      >
                        -
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {getEmptyTableRow()}
        </div>
        <div
          className={[
            totalError ? 'visible red' : 'hidden',
            styles.errorBox
          ].join(' ')}
        >
          <span>{totalError}</span>
        </div>
        <div
          className={[
            styles.rowBox,
            'childUpDownCenter',
            'childLeftRightCenter'
          ].join(' ')}
        >
          {/* <button
            type="button"
            onClick={() => {
              let hasError = false;
              if (hasNameError()) hasError = true;
              if (hasTotalError()) hasError = true;
              if (hasError) return;

              // json 파일 저장
              console.log(state.data);
              const newEnv = {
                installedCnt: 0,
                name,
                nodes: [],
                updatedTime: new Date().getTime()
              };
              // TODO: 마스터, 워커노드 변수 추가 해야 할 듯
              state.data.forEach(node => {
                newEnv.nodes.push({
                  ip: node.ip,
                  password: node.password,
                  port: node.port,
                  user: 'root'
                });
              });
              env.push(newEnv);
              console.log('env', env);
              const jsonData = JSON.stringify(env);
              const fs = require('fs');
              fs.writeFile('./app/constants/env.json', jsonData, function(err) {
                if (err) {
                  console.log(err);
                }
              });
              // MANAGE 모드로 변경
              dispatchEnvPage(CONST.ENV.MANAGE);
            }}
          >
            추가
          </button> */}
          <Button variant="contained" color="primary" size="small">
            추가
          </Button>
          {/* <button
            type="button"
            onClick={() => {
              handleClickOpen();
            }}
          >
            취소
          </button> */}
          <Button
            variant="contained"
            color="secondary"
            size="small"
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
            <DialogTitle id="alert-dialog-title">나가기</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                환경 추가 화면에서 나가시겠습니까? 설정 내용은 저장되지
                않습니다.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  handleClose();
                  dispatchEnvPage(CONST.ENV.MANAGE);
                }}
                color="primary"
              >
                나가기
              </Button>
              <Button onClick={handleClose} color="primary" autoFocus>
                취소
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default EnvContentsAdd;
