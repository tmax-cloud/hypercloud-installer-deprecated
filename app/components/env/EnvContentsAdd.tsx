/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable no-console */
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
  FormControl,
  RadioGroup,
  FormControlLabel,
  Checkbox
} from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { green } from '@material-ui/core/colors';
import CloseIcon from '@material-ui/icons/Close';
import * as Common from '../../utils/common/common';
import * as Script from '../../utils/common/script';
import styles from './EnvContentsAdd.css';
import * as env from '../../utils/common/env';
import * as ssh from '../../utils/common/ssh';
import routes from '../../utils/constants/routes.json';
import Node, { ROLE } from '../../utils/class/Node';
import Env, { NETWORK_TYPE } from '../../utils/class/Env';
import CONST from '../../utils/constants/constant';
import { AppContext } from '../../containers/HomePage';
import { OS_TYPE } from '../../utils/class/os/AbstractOs';
import CentOS from '../../utils/class/os/CentOS';
import Ubuntu from '../../utils/class/os/Ubuntu';
import KubernetesInstaller from '../../utils/class/installer/KubernetesInstaller';
import * as validation from '../../utils/common/validation';

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
    // buttonSuccess: {
    //   backgroundColor: green[500],
    //   '&:hover': {
    //     backgroundColor: green[700]
    //   }
    // },
    fabProgress: {
      color: green[500],
      position: 'absolute',
      top: -6,
      left: -6,
      zIndex: 1
    },
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -40,
      marginLeft: -40
    }
  })
);

function EnvContentsAdd(props: any) {
  console.debug(EnvContentsAdd.name, props);

  const { history, match } = props;

  const classes = useStyles();

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  // ssh connection에 loading bar 표현
  // const [loading, setLoading] = React.useState(false);
  const handleButtonClick = () => {
    if (!appState.loading) {
      dispatchAppState({
        type: 'set_loading',
        loading: true
      });
    }
  };

  // 수정화면에서 envBeforeEdit에 수정 전 데이터를 저장해 놓음
  const envBeforeEdit = env.loadEnvByName(match.params.envName);

  // state.data에 테이블에 표현될 노드들 데이터를 담음
  const [state, setState] = useState(() => {
    // edit page에서는 해당 환경 데이터로 초기화 해줌
    if (envBeforeEdit) {
      return {
        data: envBeforeEdit.nodeList
      };
    }

    // add page에서는 초기에 추가되어 있는 노드 없음
    return {
      data: []
    };
  });

  // 테이블에서 선택된 것들
  const [selected, setSelected] = React.useState<string[]>(() => {
    // edit page에서는 기존 마스터 노드들 선택되도록
    if (envBeforeEdit) {
      const result = [];
      for (let i = 0; i < envBeforeEdit.nodeList.length; i += 1) {
        if (
          envBeforeEdit.nodeList[i].role === ROLE.MASTER ||
          envBeforeEdit.nodeList[i].role === ROLE.MAIN_MASTER
        ) {
          result.push(envBeforeEdit.nodeList[i].ip);
        }
      }
      return result;
    }

    // add page
    return [];
  });
  // 선택되어 있는 지 여부 리턴해주는 함수
  const isSelected = (clickedIp: string) => {
    return selected.indexOf(clickedIp) !== -1;
  };
  // table row click
  const handleClick = (event: React.MouseEvent<unknown>, clickedIp: string) => {
    if (envBeforeEdit) {
      // edit page에서 수정 불가능
      return;
    }
    // TODO: 추후 다중 마스터 선택 가능 시, checkbox로 변경해야 함
    const selectedIndex = selected.indexOf(clickedIp);
    let newSelected: string[] = [];
    console.debug(selectedIndex);
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, clickedIp);
    } else if (selectedIndex === 0) {
      if (selected.length === 1) {
        newSelected = selected;
      } else {
        newSelected = newSelected.concat(selected.slice(1));
      }
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    console.debug('newSelected', newSelected);
    setSelected(newSelected);
    // if (!envBeforeEdit) {
    //   setSelected([clickedIp]);
    // }
  };

  const [name, setName] = useState(() => {
    if (envBeforeEdit) {
      return envBeforeEdit.name;
    }
    return '';
  });
  const [nameError, setNameError] = useState('');
  const hasNameError = (target = name, setFunc = setNameError) => {
    if (target.length === 0) {
      setFunc('이름을 입력해주세요');
      return true;
    }

    // edit page에서는 기존 이름과 다른 경우에만 validation check 진행
    const envList = env.loadEnvList();
    if (envBeforeEdit) {
      if (target !== envBeforeEdit.name) {
        for (let i = 0; i < envList.length; i += 1) {
          if (target === envList[i].name) {
            console.debug(target, envList[i].name);
            setFunc('중복 된 이름이 존재합니다.');
            return true;
          }
        }
      }
    } else {
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

    if (!validation.checkIpFormat(target)) {
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

  // dialog
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  // password visible off, on
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

  const getRemoveButton = row => {
    // 수정 페이지, 마스터면 제거 버튼 없음
    if (envBeforeEdit && isSelected(row.ip)) {
      return null;
    }
    return (
      <IconButton
        aria-label="delete"
        onClick={e => {
          // 마스터 노드 seleted 변경 안되게 하기 위해 이벤트 전파 막음
          e.stopPropagation();

          // 제거한 노드가 마스터 노드라면
          // 첫번째 노드로 마스터 노드 변경
          if (selected[0] === row.ip) {
            if (state.data.length > 0) {
              // 테이블에 남아 있는 노드 있는 경우
              setSelected([state.data[0].ip]);
            } else {
              // 테이블에 남아 있는 노드 없는 경우
              setSelected([]);
            }
          }

          setState(prevState => {
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

  const [type, setType] = React.useState(() => {
    if (envBeforeEdit) {
      return envBeforeEdit.networkType;
    }
    return NETWORK_TYPE.EXTERNAL;
  });
  const handleChangeType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setType((event.target as HTMLInputElement).value);
  };

  return (
    <div className={[styles.wrap].join(' ')}>
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
            <span className={['dark', 'medium'].join(' ')}>노드 네트워크</span>
            <span style={{ color: 'red' }}>*</span>
          </div>
          <div>
            <FormControl
              component="fieldset"
              disabled
              //  disabled={envBeforeEdit !== null}
            >
              {/* <FormLabel component="legend">Gender</FormLabel> */}
              <RadioGroup
                aria-label="gender"
                name="gender1"
                value={type}
                onChange={handleChangeType}
              >
                <div>
                  <FormControlLabel
                    value={NETWORK_TYPE.INTERNAL}
                    control={<Radio />}
                    label="내부망 (인터넷 접속 불가)"
                  />
                  <FormControlLabel
                    value={NETWORK_TYPE.EXTERNAL}
                    control={<Radio />}
                    label="외부망 (인터넷 접속 가능)"
                  />
                </div>
              </RadioGroup>
            </FormControl>
          </div>
        </div>
        <div style={{ border: '' }}>
          <div
            style={{ marginTop: '50px' }}
            className={[styles.rowBox, 'childLeftRightLeft'].join(' ')}
          >
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
              {/* {loading && (
              <CircularProgress
                color="secondary"
                size={40}
                className={classes.buttonProgress}
              />
            )} */}
              <Button
                className={['secondary', styles.nodeAddButton].join(' ')}
                variant="contained"
                color="primary"
                size="small"
                // startIcon={<AddIcon />}
                onClick={() => {
                  let hasError = false;
                  if (hasIpError()) hasError = true;
                  if (hasPortError()) hasError = true;
                  if (hasPasswordError()) hasError = true;
                  if (hasError) return;

                  handleButtonClick();
                  setTotalError('');

                  ssh
                    .connectionTest({
                      ip,
                      port,
                      password,
                      user: 'root'
                    })
                    .then(async () => {
                      console.debug('ready');

                      let os;
                      await ssh.send(
                        {
                          ip,
                          port,
                          password,
                          user: 'root',
                          cmd: `awk -F= '/^NAME/{print $2}' /etc/os-release`
                        },
                        {
                          close: () => {},
                          stdout: (data: string) => {
                            const osType = data
                              .toString()
                              .replace(/"/gi, '')
                              .replace('\n', '');

                            if (osType === OS_TYPE.CENTOS) {
                              os = new CentOS();
                            } else {
                              os = new Ubuntu();
                            }
                          },
                          stderr: () => {}
                        }
                      );
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
                          password,
                          os
                        });
                        return { ...prevState, data };
                      });

                      // 초기화
                      initValue();

                      setTotalError('');
                    })
                    .catch(err => {
                      console.debug('error', err);
                      setTotalError(
                        '입력 정보를 확인해주세요. (ssh connection error)'
                      );
                    })
                    .finally(() => {
                      dispatchAppState({
                        type: 'set_loading',
                        loading: false
                      });
                    });
                }}
              >
                + 추가
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
              <Table aria-label="simple table">
                <TableHead className={['primary'].join(' ')}>
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
                        <Checkbox
                          checked={isSelected(row.ip)}
                          disabled={envBeforeEdit !== null}
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
                        {getRemoveButton(row)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {getEmptyTableRow()}
          </div>
        </div>
        <div
          style={{ marginTop: '50px' }}
          className={[
            styles.rowBox,
            'childUpDownCenter',
            'childLeftRightRight'
          ].join(' ')}
        >
          <Button
            variant="contained"
            style={{ marginRight: '10px' }}
            className={['primary'].join(' ')}
            size="large"
            onClick={async () => {
              let hasError = false;
              if (hasNameError()) hasError = true;
              if (hasTotalError()) hasError = true;
              if (hasError) return;

              // json 파일 저장
              if (envBeforeEdit) {
                // 수정
                // master들은 변경 못함
                // 그대로 넣어줌
                const {
                  mainMaster,
                  masterArr,
                  workerArr
                } = envBeforeEdit.getNodesSortedByRole();
                masterArr.push(mainMaster);

                // 수정된 worker들 넣어줌
                const modifiedWorkerArr = [];
                for (let i = 0; i < state.data.length; i += 1) {
                  const node = state.data[i];
                  if (selected.indexOf(node.ip) === -1) {
                    // worker
                    // modifiedWorkerArr.push({
                    //   ip: node.ip,
                    //   port: node.port,
                    //   user: 'root',
                    //   password: node.password,
                    //   role: ROLE.WORKER,
                    //   hostName: Common.getRandomString()
                    // });
                    modifiedWorkerArr.push(
                      new Node(
                        node.ip,
                        node.port,
                        'root',
                        node.password,
                        node.os,
                        ROLE.WORKER,
                        Common.getRandomString()
                      )
                    );
                  }
                }
                // const newEnv = {
                //   name,
                //   nodeList: masterArr.concat(modifiedWorkerArr),
                //   productList: envBeforeEdit.productList,
                //   updatedTime: new Date()
                // };
                const newEnv = new Env(
                  name,
                  envBeforeEdit.networkType,
                  envBeforeEdit.registry,
                  masterArr.concat(modifiedWorkerArr),
                  envBeforeEdit.productList,
                  new Date()
                );

                // kubernetes 설치 되어 있으면, 실제로 워커노드 추가, 삭제 스크립트 실행
                // 추가된 워커노드 구함
                const kubernetesInfo = envBeforeEdit.isInstalled(
                  CONST.PRODUCT.KUBERNETES.NAME
                );
                if (kubernetesInfo) {
                  dispatchAppState({
                    type: 'set_loading',
                    loading: true
                  });

                  const addedWorker = [];
                  for (let i = 0; i < modifiedWorkerArr.length; i += 1) {
                    let isAdded = true;
                    for (let j = 0; j < workerArr.length; j += 1) {
                      if (modifiedWorkerArr[i].ip === workerArr[j].ip) {
                        isAdded = false;
                        break;
                      }
                    }
                    if (isAdded) {
                      addedWorker.push(modifiedWorkerArr[i]);
                    }
                  }
                  console.debug('Added worker nodeList : ', addedWorker);

                  // 삭제된 워커 노드 구함
                  const deletedWorker = [];
                  for (let i = 0; i < workerArr.length; i += 1) {
                    let isDeleted = true;
                    for (let j = 0; j < modifiedWorkerArr.length; j += 1) {
                      if (workerArr[i].ip === modifiedWorkerArr[j].ip) {
                        isDeleted = false;
                        break;
                      }
                    }
                    if (isDeleted) {
                      deletedWorker.push(workerArr[i]);
                    }
                  }
                  console.debug('Deleted worker nodeList', deletedWorker);

                  const kubernetesInstaller = KubernetesInstaller.getInstance;
                  // 새로 추가된 노드에 install script 돌려야 함
                  const tempAddEnv = new Env(
                    name,
                    envBeforeEdit.networkType,
                    envBeforeEdit.registry,
                    masterArr.concat(addedWorker),
                    envBeforeEdit.productList,
                    new Date()
                  );
                  kubernetesInstaller.env = tempAddEnv;
                  await kubernetesInstaller.addWorker(
                    tempAddEnv.registry,
                    kubernetesInfo.version
                  );
                  // await tempAddEnv?.installWorker(
                  //   tempAddEnv.registry,
                  //   kubernetesInfo.version
                  // );

                  // 삭제 된 노드에 마스터 노드에서 kubectl delete 명령어 날림
                  const tempDeleteEnv = new Env(
                    name,
                    envBeforeEdit.networkType,
                    envBeforeEdit.registry,
                    masterArr.concat(deletedWorker),
                    envBeforeEdit.productList,
                    new Date()
                  );
                  kubernetesInstaller.env = tempDeleteEnv;
                  await kubernetesInstaller.deleteWorker();
                }

                // 기존 데이터 삭제 후 수정 된 환경 데이터 추가
                env.updateEnv(envBeforeEdit.name, newEnv);

                dispatchAppState({
                  type: 'set_loading',
                  loading: false
                });
                history.push(routes.ENV.EXIST);
              } else {
                // 추가
                // const newEnv = {
                //   name,
                //   nodeList: [] as any,
                //   productList: [],
                //   updatedTime: new Date()
                // };
                const newEnv = new Env(name, type, '', [], [], new Date());
                let isSetMainMaster = false;
                for (let i = 0; i < state.data.length; i += 1) {
                  const node = state.data[i];
                  // worker
                  let role = ROLE.WORKER;
                  console.debug(node.ip);
                  console.debug(selected);
                  if (selected.indexOf(node.ip) !== -1) {
                    // master
                    if (!isSetMainMaster) {
                      role = ROLE.MAIN_MASTER;
                      isSetMainMaster = true;
                    } else {
                      role = ROLE.MASTER;
                    }
                  }
                  // newEnv.nodeList.push({
                  //   ip: node.ip,
                  //   port: node.port,
                  //   user: 'root',
                  //   password: node.password,
                  //   role,
                  //   hostName: Common.getRandomString()
                  // });
                  newEnv.nodeList.push(
                    new Node(
                      node.ip,
                      node.port,
                      'root',
                      node.password,
                      node.os,
                      role,
                      Common.getRandomString()
                    )
                  );
                }
                env.createEnv(newEnv);
                history.push(routes.ENV.EXIST);
              }
            }}
          >
            {envBeforeEdit ? '저장' : '추가'}
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
              {envBeforeEdit ? (
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
                className={['primary'].join(' ')}
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
                className={['secondary'].join(' ')}
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
