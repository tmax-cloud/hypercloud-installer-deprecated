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
  InputAdornment
} from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CONST from '../../utils/constants/constant';
import styles from './EnvContentsAdd.css';
import env from '../../utils/constants/env.json';
import * as Common from '../../utils/common/ssh';

interface Props {
  dispatchEnvPage: Function;
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
        console.debug(target, env[i].name);
        setFunc('중복 된 이름이 존재합니다.');
        return true;
      }
    }

    const nameRegex = /^[a-z0-9-]{2,32}$/;
    if (!nameRegex.test(target)) {
      setFunc(
        '최소 2자 이상, 최대 32 이하의 영문 소문자, 숫자, 특수문자(“-”)만 입력할 수 있습니다.'
      );
      return true;
    }

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

    const ipRegex = /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/;
    if (!ipRegex.test(target)) {
      setFunc('IP 형식을 확인해 주세요.');
      return true;
    }

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

    const portRegex = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;
    if (!portRegex.test(target)) {
      setFunc('0부터 65535 범위 내에서 입력해 주세요.');
      return true;
    }
    // if (Number(target) < 0 || Number(target) > 65535) {
    //   setFunc('0부터 65535 범위 내에서 입력해 주세요.');
    //   return true;
    // }

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
              marginTop: '10px'
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

  const [isShowPassword, setisShowPassword] = useState(true);
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

  return (
    <div className={[styles.wrap, 'childUpDownCenter'].join(' ')}>
      <div className={styles.box}>
        <div className={['childLeftRightRight'].join(' ')}>
          <span>* 필수입력</span>
        </div>
        <div className={[styles.rowBox, 'childLeftRightLeft'].join(' ')}>
          <div className={styles.titleBox}>
            <span>이름 *</span>
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
              className={[styles.input].join(' ')}
              id="outlined-required"
              label="Name"
              variant="outlined"
              size="small"
              value={name}
              onChange={e => {
                setName(e.target.value);
                // hasNameError(e.target.value);
              }}
              onBlur={e => {
                hasNameError(e.target.value);
              }}
              error={nameError.length !== 0}
              helperText={nameError}
            />
            {/* <span className={nameError ? 'visible red' : 'hidden'}>
              {nameError}
            </span> */}
          </div>
        </div>
        <div className={[styles.rowBox, 'childLeftRightLeft'].join(' ')}>
          <div className={styles.titleBox}>
            <span>노드 *</span>
          </div>
          <div>
            {/* <div>
              <span>IP</span>
            </div> */}
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
                className={[styles.input].join(' ')}
                id="outlined-required"
                label="IP"
                variant="outlined"
                size="small"
                value={ip}
                onChange={e => {
                  setIp(e.target.value);
                  // hasIpError(e.target.value);
                }}
                onBlur={e => {
                  hasIpError(e.target.value);
                }}
                error={ipError.length !== 0}
                helperText={ipError}
              />
            </div>
            {/* <div
              className={[
                ipError ? 'visible red' : 'hidden',
                styles.errorBox
              ].join(' ')}
            >
              <span>{ipError}</span>
            </div> */}
          </div>
          <div className="left">
            {/* <div>
              <span>포트</span>
            </div> */}
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
                className={[styles.input].join(' ')}
                id="outlined-required"
                label="Port"
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
            {/* <div
              className={[
                portError ? 'visible red' : 'hidden',
                styles.errorBox
              ].join(' ')}
            >
              <span>{portError}</span>
            </div> */}
          </div>
          <div className="left">
            {/* <div>
              <Tooltip
                title="root 계정 비밀번호를 입력해 주세요."
                placement="top"
              >
                <span>사용자 비밀번호</span>
              </Tooltip>
            </div> */}
            <div className="left">
              {/* <input
                type={isShowPassword ? 'password' : 'text'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  hasPasswordError(e.target.value);
                }}
              /> */}
              <Tooltip
                title="root 계정 비밀번호를 입력해 주세요."
                placement="top"
                arrow
              >
                <TextField
                  required
                  className={[styles.input].join(' ')}
                  type={isShowPassword ? 'password' : 'text'}
                  id="outlined-required"
                  label="Password"
                  variant="outlined"
                  size="small"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    // hasPasswordError(e.target.value);
                  }}
                  onBlur={e => {
                    hasPasswordError(e.target.value);
                  }}
                  error={passwordError.length !== 0}
                  helperText={passwordError}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">
                        {getPasswordVisibility()}
                      </InputAdornment>
                    )
                  }}
                />
              </Tooltip>

              {/* <FormControl
                // className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                size="small"
              >
                <InputLabel htmlFor="outlined-adornment-password">
                  Password *
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={isShowPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    hasPasswordError(e.target.value);
                  }}
                  error={passwordError.length !== 0}
                  helperText={passwordError}
                  endAdornment={(
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={e => {
                          isShowPassword
                            ? setisShowPassword(false)
                            : setisShowPassword(true);
                        }}
                        onMouseDown={e => {
                          isShowPassword
                            ? setisShowPassword(false)
                            : setisShowPassword(true);
                        }}
                        edge="end"
                      >
                        {isShowPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  )}
                  labelWidth={70}
                />
              </FormControl> */}
            </div>
            {/* <div
              className={[
                passwordError ? 'visible red' : 'hidden',
                styles.errorBox
              ].join(' ')}
            >
              <span>{passwordError}</span>
            </div> */}
          </div>
          <div className="left">
            <Button
              className={styles.addRemoveButton}
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                let hasError = false;
                if (hasIpError()) hasError = true;
                if (hasPortError()) hasError = true;
                if (hasPasswordError()) hasError = true;
                if (hasError) return;

                setTotalError('');
                Common.connectionTest({
                  ip,
                  port,
                  password,
                  user: 'root'
                })
                  .then(() => {
                    console.debug('ready');
                    // node.state = State.SUCCESS;
                    // setSshInfo([].concat(sshInfo));
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
                    return null;
                  })
                  .catch(err => {
                    console.debug('error', err);
                    // node.state = State.FAIL;
                    // setSshInfo([].concat(sshInfo));
                    setTotalError(
                      '입력 정보를 확인해주세요. (ssh connection error)'
                    );
                  });
              }}
            >
              <AddIcon />
            </Button>
          </div>
        </div>
        <div
          className={[
            totalError ? 'visible red' : 'hidden',
            styles.errorBox
          ].join(' ')}
        >
          <span>{totalError}</span>
        </div>
        <div className={[styles.table, 'clear'].join(' ')}>
          <TableContainer component={Paper} variant="outlined">
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
                {state.data.map(row => (
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
                      <Button
                        className={styles.addRemoveButton}
                        variant="contained"
                        color="secondary"
                        size="small"
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
                        <RemoveIcon />
                      </Button>
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
            styles.rowBox,
            'childUpDownCenter',
            'childLeftRightCenter'
          ].join(' ')}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              let hasError = false;
              if (hasNameError()) hasError = true;
              if (hasTotalError()) hasError = true;
              if (hasError) return;

              // json 파일 저장
              console.debug(state.data);
              const newEnv = {
                name,
                nodes: [],
                installedProducts: [],
                updatedTime: new Date().getTime()
              };
              for (let i = 0; i < state.data.length; i++) {
                const node = state.data[i];
                // worker
                let role = 1;
                console.debug(node.ip);
                console.debug(selected);
                if (selected.indexOf(node.ip) !== -1) {
                  // master
                  role = 0;
                }
                newEnv.nodes.push({
                  ip: node.ip,
                  password: node.password,
                  port: node.port,
                  user: 'root',
                  role
                });
              }
              env.push(newEnv);
              console.debug('env', env);
              const jsonData = JSON.stringify(env);
              const fs = require('fs');
              fs.writeFile('./app/utils/constants/env.json', jsonData, function(
                err
              ) {
                if (err) {
                  console.debug(err);
                }
              });
              // MANAGE 모드로 변경
              dispatchEnvPage(CONST.ENV.MANAGE);
            }}
          >
            추가
          </Button>
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
