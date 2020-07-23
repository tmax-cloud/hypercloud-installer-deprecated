import React, { useState, useContext } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
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
  InputAdornment,
  CircularProgress,
  IconButton,
} from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { green } from '@material-ui/core/colors';
import clsx from 'clsx';
import CloseIcon from '@material-ui/icons/Close';
import styles from './EnvContentsAdd.css';
import * as env from '../../utils/common/env';
import * as Common from '../../utils/common/ssh';
import routes from '../../utils/constants/routes.json';
import { Role } from '../../utils/class/Node';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center'
    },
    wrapper: {
      margin: theme.spacing(1),
      position: 'relative'
    },
    buttonSuccess: {
      backgroundColor: green[500],
      '&:hover': {
        backgroundColor: green[700]
      }
    },
    fabProgress: {
      color: green[500],
      position: 'absolute',
      top: -6,
      left: -6,
      zIndex: 1
    },
    buttonProgress: {
      color: green[500],
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12
    }
  })
);

function EnvContentsAdd(props: any) {
  console.debug('EnvContentsAdd');

  const { history, location, match } = props;


  const classes = useStyles();
  const [loading, setLoading] = React.useState(false);
  const timer = React.useRef<number>();
  const handleButtonClick = () => {
    if (!loading) {
      // setSuccess(false);
      setLoading(true);
      // timer.current = setTimeout(() => {
      //   // setSuccess(true);
      //   setLoading(false);
      // }, 2000);
    }
  };
  const buttonClassname = clsx({
    // [classes.buttonSuccess]: success
  });

  const editTargetEnv = env.getEnvByName(match.params.envName);
  const [state, setState] = useState(() => {
    // edit page
    if (editTargetEnv) {
      return {
        data: editTargetEnv.nodes
      };
    }

    // add page
    return {
      data: []
    };
  });

  const [selected, setSelected] = React.useState<string[]>(() => {
    // edit page
    if (editTargetEnv) {
      const result = [];
      for (let i = 0; i < editTargetEnv.nodes.length; i += 1) {
        if (editTargetEnv.nodes[i].role === Role.MASTER) {
          result.push(editTargetEnv.nodes[i].ip);
        }
      }
      return result;
    }

    // add page
    return [];
  });

  const [name, setName] = useState(() => {
    if (editTargetEnv) {
      return editTargetEnv.name;
    }
    return '';
  });
  const [nameError, setNameError] = useState('');
  const hasNameError = (target = name, setFunc = setNameError) => {
    if (target.length === 0) {
      setFunc('이름을 입력해주세요');
      return true;
    }

    if (editTargetEnv) {
      if (target !== editTargetEnv.name) {
        const envList = env.loadEnv();
        for (let i = 0; i < envList.length; i += 1) {
          if (target === envList[i].name) {
            console.debug(target, envList[i].name);
            setFunc('중복 된 이름이 존재합니다.');
            return true;
          }
        }
      }
    } else {
      const envList = env.loadEnv();
      for (let i = 0; i < envList.length; i += 1) {
        if (target === envList[i].name) {
          console.debug(target, envList[i].name);
          setFunc('중복 된 이름이 존재합니다.');
          return true;
        }
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

  // const useStyles = makeStyles({
  //   table: {
  //     minWidth: 650
  //   }
  // });
  // const classes = useStyles();

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
    if (!editTargetEnv) {
      setSelected([clickedIp]);
    }
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

  return (
    <div className={[styles.wrap, 'childUpDownCenter'].join(' ')}>
      <div className={styles.box}>
        <div className={['childLeftRightRight'].join(' ')}>
          <span className={['dark', 'medium'].join(' ')}>
            <span style={{ color: 'red' }}>*</span>
            <span>필수입력</span>
          </span>
        </div>
        <div className={[styles.rowBox, 'childLeftRightLeft'].join(' ')}>
          <div className={styles.titleBox}>
            <span className={['dark', 'medium'].join(' ')}>이름</span>
            <span style={{ color: 'red' }}>*</span>
          </div>
          <div>
            <TextField
              required
              className={['long'].join(' ')}
              id="outlined-required"
              label="Name"
              placeholder="최소 2자, 최대 32자, 영문 소문자, 숫자, 특수문자(“-”)"
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
          </div>
        </div>
        <div className={[styles.rowBox, 'childLeftRightLeft'].join(' ')}>
          <div className={styles.titleBox}>
            <span className={['dark', 'medium'].join(' ')}>노드</span>
            <span style={{ color: 'red' }}>*</span>
          </div>
          <div>
            <div>
              <TextField
                required
                className={['medium'].join(' ')}
                id="outlined-required"
                label="IP"
                placeholder="예: 192.168.32.128"
                variant="outlined"
                size="small"
                disabled={loading}
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
          </div>
          <div className="left">
            <div>
              <TextField
                required
                className={['medium'].join(' ')}
                id="outlined-required"
                label="Port"
                placeholder="0~65535"
                variant="outlined"
                size="small"
                disabled={loading}
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
          <div className="left">
            <div className="left">
              <Tooltip
                title="root 계정 비밀번호를 입력해 주세요."
                placement="top"
                arrow
              >
                <TextField
                  required
                  className={['medium'].join(' ')}
                  type={isShowPassword ? 'password' : 'text'}
                  id="outlined-required"
                  label="사용자 비밀번호"
                  placeholder="Text"
                  variant="outlined"
                  size="small"
                  disabled={loading}
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
            </div>
          </div>
          <div>
            <Button
              className={['white', 'indicator'].join(' ')}
              variant="contained"
              color="primary"
              size="small"
              disabled={loading}
              startIcon={<AddIcon />}
              onClick={() => {
                let hasError = false;
                if (hasIpError()) hasError = true;
                if (hasPortError()) hasError = true;
                if (hasPasswordError()) hasError = true;
                if (hasError) return;

                handleButtonClick();
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
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
            >
              추가
            </Button>
            {loading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
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
            <Table aria-label="simple table">
              <TableHead className={['primaryTableHeader'].join(' ')}>
                <TableRow>
                  <TableCell
                    align="center"
                    style={{ padding: '0px', width: '20%' }}
                  >
                    <span>마스터 노드</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ padding: '0px', width: '40%' }}
                  >
                    <span>IP</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ padding: '0px', width: '20%' }}
                  >
                    <span>포트</span>
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
                      <Radio checked={isSelected(row.ip)}
                        disabled={editTargetEnv ? true : false}
                      />
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
                      <IconButton
                        aria-label="delete"
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
                      </IconButton>
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
            style={{marginRight: '10px'}}
            className={['pink'].join(' ')}
            size="large"
            onClick={() => {
              let hasError = false;
              if (hasNameError()) hasError = true;
              if (hasTotalError()) hasError = true;
              if (hasError) return;

              // json 파일 저장
              if (editTargetEnv) {
                // 수정
                const newEnv = {
                  name,
                  nodes: [],
                  installedProducts: editTargetEnv.installedProducts,
                  updatedTime: new Date().getTime()
                };
                for (let i = 0; i < state.data.length; i += 1) {
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
                // 삭제 후 추가
                env.deleteEnvByName(editTargetEnv.name);
                env.appendEnv(newEnv);
              } else {
                // 추가
                const newEnv = {
                  name,
                  nodes: [],
                  installedProducts: [],
                  updatedTime: new Date().getTime()
                };
                for (let i = 0; i < state.data.length; i += 1) {
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
                env.appendEnv(newEnv);
              }
              history.push(routes.ENV.EXIST);
            }}
          >
            {editTargetEnv ? '저장' : '추가'}
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
              {editTargetEnv ? (
                <DialogContentText id="alert-dialog-description">
                  <span className={['dark', 'medium'].join(' ')}>
                    환경 수정 화면에서 나가시겠습니까? 설정 내용은 저장되지
                    않습니다.
                  </span>
                </DialogContentText>
              ) : (
                <DialogContentText id="alert-dialog-description">
                  <span className={['dark', 'medium'].join(' ')}>
                    환경 추가 화면에서 나가시겠습니까? 설정 내용은 저장되지
                    않습니다.
                  </span>
                </DialogContentText>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                className={['blue'].join(' ')}
                size="small"
                onClick={() => {
                  handleClose();
                  if (!env.isEmpty()) {
                    history.push(routes.ENV.EXIST);
                  } else {
                    history.push(routes.ENV.NOT_EXIST);
                  }
                }}
              >
                나가기
              </Button>
              <Button
                className={['white'].join(' ')}
                size="small"
                onClick={handleClose}
                autoFocus
              >
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
