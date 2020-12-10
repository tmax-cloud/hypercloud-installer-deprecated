import React, { useContext, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  createStyles,
  makeStyles,
  Theme,
  Checkbox,
  FormControlLabel,
  TextField
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CONST from '../../../utils/constants/constant';
import routes from '../../../utils/constants/routes.json';
import styles from '../InstallContents2.css';
import * as env from '../../../utils/common/env';
import RookCephInstaller from '../../../utils/class/installer/RookCephInstaller';
import * as Common from '../../../utils/common/common';
import { AppContext } from '../../../containers/AppContext';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%'
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular
    }
  })
);

function InstallContentsRookCeph2(props: any) {
  console.debug(InstallContentsRookCeph2.name, props);
  const { history, match, state, setOption } = props;

  const classes = useStyles();

  // loading 창 표현 위함
  const appContext = useContext(AppContext);
  const { dispatchAppState } = appContext;

  const nowEnv = env.loadEnvByName(match.params.envName);

  // disk 후보군을 보여주는 state
  const [osdDiskList, setOsdDiskList] = React.useState({});
  const getDiskListPossibleOsd = async () => {
    const rookCephInstaller = RookCephInstaller.getInstance;
    rookCephInstaller.env = nowEnv;
    const possibleOsdDiskList: any = await rookCephInstaller.getDiskListPossibleOsd();

    const temp: any = {};
    const hostName = Object.keys(possibleOsdDiskList);
    for (let i = 0; i < hostName.length; i += 1) {
      const targetHostName = hostName[i];
      temp[targetHostName] = [];
      for (let j = 0; j < possibleOsdDiskList[targetHostName].length; j += 1) {
        const { disk, size } = possibleOsdDiskList[targetHostName][j];
        temp[targetHostName].push({
          diskName: disk,
          diskSize: size,
          checked: false
        });
      }
    }
    console.error(temp);
    setOsdDiskList(temp);
  };

  // 선택된 disk를 나타내는 state
  const [diskError, setDiskError] = useState(false);
  const [selectedOsdDisk, setSelectedOsdDisk] = useState({});
  const addSelectedOsdDisk = (
    hostName: string,
    diskName: string,
    diskSize: any
  ) => {
    if (hostName in selectedOsdDisk) {
      selectedOsdDisk[hostName].push({
        diskName,
        diskSize
      });
    } else {
      selectedOsdDisk[hostName] = [
        {
          diskName,
          diskSize
        }
      ];
    }
    setSelectedOsdDisk(selectedOsdDisk);
    setDiskError(false);
    console.debug(selectedOsdDisk);
  };
  const deleteSelectedOsdDisk = (hostName: string, diskName: string) => {
    let idx = -1;
    for (let i = 0; i < selectedOsdDisk[hostName].length; i += 1) {
      if (selectedOsdDisk[hostName][i].diskName === diskName) {
        idx = i;
        break;
      }
    }

    if (idx !== -1) selectedOsdDisk[hostName].splice(idx, 1);
    if (selectedOsdDisk[hostName].length === 0) {
      delete selectedOsdDisk[hostName];
      setSelectedOsdDisk(selectedOsdDisk);
    }
    console.debug(selectedOsdDisk);
  };

  React.useEffect(() => {
    (async () => {
      try {
        dispatchAppState({
          type: 'set_loading',
          loading: true
        });
        await getDiskListPossibleOsd();
        console.log(osdDiskList);
      } catch (error) {
        console.error(error);
      } finally {
        dispatchAppState({
          type: 'set_loading',
          loading: false
        });
      }
    })();
    return () => {};
  }, []);

  const OSD_CPU_MIN_VALUE = 2;
  const [osdCpu, setOsdCpu] = useState(OSD_CPU_MIN_VALUE);
  const [osdCpuError, setOsdCpuError] = useState('');
  const hasOsdCpuError = (target = osdCpu, setFunc = setOsdCpuError) => {
    if (!target) {
      setFunc('입력해주세요');
      return true;
    }

    if (target < OSD_CPU_MIN_VALUE) {
      setFunc(`최소값은  ${OSD_CPU_MIN_VALUE} 입니다.`);
      return true;
    }

    setFunc('');
    return false;
  };
  const OSD_MEMORY_MIN_VALUE = 2;
  const [osdMemory, setOsdMemory] = useState(OSD_MEMORY_MIN_VALUE);
  const [osdMemoryError, setOsdMemoryError] = useState('');
  const hasOsdMemoryError = (
    target = osdMemory,
    setFunc = setOsdMemoryError
  ) => {
    if (!target) {
      setFunc('입력해주세요');
      return true;
    }

    if (Number(target) < OSD_MEMORY_MIN_VALUE) {
      setFunc(`최소값은  ${OSD_MEMORY_MIN_VALUE} 입니다.`);
      return true;
    }

    setFunc('');
    return false;
  };

  const MON_CPU_MIN_VALUE = 1;
  const [monCpu, setMonCpu] = useState(MON_CPU_MIN_VALUE);
  const [monCpuError, setMonCpuError] = useState('');
  const hasMonCpuError = (target = monCpu, setFunc = setMonCpuError) => {
    if (!target) {
      setFunc('입력해주세요');
      return true;
    }

    if (Number(target) < MON_CPU_MIN_VALUE) {
      setFunc(`최소값은  ${MON_CPU_MIN_VALUE} 입니다.`);
      return true;
    }

    setFunc('');
    return false;
  };
  const MON_MEMORY_MIN_VALUE = 2;
  const [monMemory, setMonMemory] = useState(MON_MEMORY_MIN_VALUE);
  const [monMemoryError, setMonMemoryError] = useState('');
  const hasMonMemoryError = (
    target = monMemory,
    setFunc = setMonMemoryError
  ) => {
    if (!target) {
      setFunc('입력해주세요');
      return true;
    }

    if (Number(target) < MON_MEMORY_MIN_VALUE) {
      setFunc(`최소값은  ${MON_MEMORY_MIN_VALUE} 입니다.`);
      return true;
    }

    setFunc('');
    return false;
  };

  const MGR_CPU_MIN_VALUE = 1;
  const [mgrCpu, setMgrCpu] = useState(MGR_CPU_MIN_VALUE);
  const [mgrCpuError, setMgrCpuError] = useState('');
  const hasMgrCpuError = (target = mgrCpu, setFunc = setMgrCpuError) => {
    if (!target) {
      setFunc('입력해주세요');
      return true;
    }

    if (Number(target) < MGR_CPU_MIN_VALUE) {
      setFunc(`최소값은  ${MGR_CPU_MIN_VALUE} 입니다.`);
      return true;
    }

    setFunc('');
    return false;
  };
  const MGR_MEMORY_MIN_VALUE = 1;
  const [mgrMemory, setMgrMemory] = useState(MGR_MEMORY_MIN_VALUE);
  const [mgrMemoryError, setMgrMemoryError] = useState('');
  const hasMgrMemoryError = (
    target = mgrMemory,
    setFunc = setMgrMemoryError
  ) => {
    if (!target) {
      setFunc('입력해주세요');
      return true;
    }

    if (Number(target) < MGR_MEMORY_MIN_VALUE) {
      setFunc(`최소값은  ${MGR_MEMORY_MIN_VALUE} 입니다.`);
      return true;
    }

    setFunc('');
    return false;
  };

  const MDS_CPU_MIN_VALUE = 4;
  const [mdsCpu, setMdsCpu] = useState(MDS_CPU_MIN_VALUE);
  const [mdsCpuError, setMdsCpuError] = useState('');
  const hasMdsCpuError = (target = mdsCpu, setFunc = setMdsCpuError) => {
    if (!target) {
      setFunc('입력해주세요');
      return true;
    }

    if (Number(target) < MDS_CPU_MIN_VALUE) {
      setFunc(`최소값은  ${MDS_CPU_MIN_VALUE} 입니다.`);
      return true;
    }

    setFunc('');
    return false;
  };
  const MDS_MEMORY_MIN_VALUE = 4;
  const [mdsMemory, setMdsMemory] = useState(MDS_MEMORY_MIN_VALUE);
  const [mdsMemoryError, setMdsMemoryError] = useState('');
  const hasMdsMemoryError = (
    target = mdsMemory,
    setFunc = setMdsMemoryError
  ) => {
    if (!target) {
      setFunc('입력해주세요');
      return true;
    }

    if (Number(target) < MDS_MEMORY_MIN_VALUE) {
      setFunc(`최소값은  ${MDS_MEMORY_MIN_VALUE} 입니다.`);
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
      <>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography className={classes.heading}>고급 설정</Typography>
          </AccordionSummary>
          <AccordionDetails
            style={{
              display: `block`
            }}
          >
            <div>오브젝트 스토리지 데몬 (OSD)</div>
            <div className={['childLeftRightLeft'].join(' ')}>
              <div className={styles.titleBox}>
                <span className={['dark', 'medium'].join(' ')}> - CPU</span>
                <span style={{ color: 'red' }}>*</span>
              </div>
              <div>
                <TextField
                  required
                  type="number"
                  className={['short'].join(' ')}
                  id="outlined-required"
                  variant="outlined"
                  size="small"
                  value={osdCpu}
                  onChange={e => {
                    setOsdCpu(e.target.value);
                  }}
                  onBlur={e => {
                    hasOsdCpuError(e.target.value);
                  }}
                  error={osdCpuError.length !== 0}
                  helperText={osdCpuError}
                />
              </div>
              <span>개</span>
            </div>
            <div className={['childLeftRightLeft'].join(' ')}>
              <div className={styles.titleBox}>
                <span className={['dark', 'medium'].join(' ')}> - 메모리</span>
                <span style={{ color: 'red' }}>*</span>
              </div>
              <div>
                <TextField
                  required
                  type="number"
                  className={['short'].join(' ')}
                  id="outlined-required"
                  variant="outlined"
                  size="small"
                  value={osdMemory}
                  onChange={e => {
                    setOsdMemory(e.target.value);
                  }}
                  onBlur={e => {
                    hasOsdMemoryError(e.target.value);
                  }}
                  error={osdMemoryError.length !== 0}
                  helperText={osdMemoryError}
                />
              </div>
              <span>GB</span>
            </div>
            <div>모니터 (MON)</div>
            <div className={['childLeftRightLeft'].join(' ')}>
              <div className={styles.titleBox}>
                <span className={['dark', 'medium'].join(' ')}> - CPU</span>
                <span style={{ color: 'red' }}>*</span>
              </div>
              <div>
                <TextField
                  required
                  type="number"
                  className={['short'].join(' ')}
                  id="outlined-required"
                  variant="outlined"
                  size="small"
                  value={monCpu}
                  onChange={e => {
                    setMonCpu(e.target.value);
                  }}
                  onBlur={e => {
                    hasMonCpuError(e.target.value);
                  }}
                  error={monCpuError.length !== 0}
                  helperText={monCpuError}
                />
              </div>
              <span>개</span>
            </div>
            <div className={['childLeftRightLeft'].join(' ')}>
              <div className={styles.titleBox}>
                <span className={['dark', 'medium'].join(' ')}> - 메모리</span>
                <span style={{ color: 'red' }}>*</span>
              </div>
              <div>
                <TextField
                  required
                  type="number"
                  className={['short'].join(' ')}
                  id="outlined-required"
                  variant="outlined"
                  size="small"
                  value={monMemory}
                  onChange={e => {
                    setMonMemory(e.target.value);
                  }}
                  onBlur={e => {
                    hasMonMemoryError(e.target.value);
                  }}
                  error={monMemoryError.length !== 0}
                  helperText={monMemoryError}
                />
              </div>
              <span>GB</span>
            </div>
            <div>매니저 (MGR)</div>
            <div className={['childLeftRightLeft'].join(' ')}>
              <div className={styles.titleBox}>
                <span className={['dark', 'medium'].join(' ')}> - CPU</span>
                <span style={{ color: 'red' }}>*</span>
              </div>
              <div>
                <TextField
                  required
                  type="number"
                  className={['short'].join(' ')}
                  id="outlined-required"
                  variant="outlined"
                  size="small"
                  value={mgrCpu}
                  onChange={e => {
                    setMgrCpu(e.target.value);
                  }}
                  onBlur={e => {
                    hasMgrCpuError(e.target.value);
                  }}
                  error={mgrCpuError.length !== 0}
                  helperText={mgrCpuError}
                />
              </div>
              <span>개</span>
            </div>
            <div className={['childLeftRightLeft'].join(' ')}>
              <div className={styles.titleBox}>
                <span className={['dark', 'medium'].join(' ')}> - 메모리</span>
                <span style={{ color: 'red' }}>*</span>
              </div>
              <div>
                <TextField
                  required
                  type="number"
                  className={['short'].join(' ')}
                  id="outlined-required"
                  variant="outlined"
                  size="small"
                  value={mgrMemory}
                  onChange={e => {
                    setMgrMemory(e.target.value);
                  }}
                  onBlur={e => {
                    hasMgrMemoryError(e.target.value);
                  }}
                  error={mgrMemoryError.length !== 0}
                  helperText={mgrMemoryError}
                />
              </div>
              <span>GB</span>
            </div>
            <div>메타데이터 서버 (MDS)</div>
            <div className={['childLeftRightLeft'].join(' ')}>
              <div className={styles.titleBox}>
                <span className={['dark', 'medium'].join(' ')}> - CPU</span>
                <span style={{ color: 'red' }}>*</span>
              </div>
              <div>
                <TextField
                  required
                  type="number"
                  className={['short'].join(' ')}
                  id="outlined-required"
                  variant="outlined"
                  size="small"
                  value={mdsCpu}
                  onChange={e => {
                    setMdsCpu(e.target.value);
                  }}
                  onBlur={e => {
                    hasMdsCpuError(e.target.value);
                  }}
                  error={mdsCpuError.length !== 0}
                  helperText={mdsCpuError}
                />
              </div>
              <span>개</span>
            </div>
            <div className={['childLeftRightLeft'].join(' ')}>
              <div className={styles.titleBox}>
                <span className={['dark', 'medium'].join(' ')}> - 메모리</span>
                <span style={{ color: 'red' }}>*</span>
              </div>
              <div>
                <TextField
                  required
                  type="number"
                  className={['short'].join(' ')}
                  id="outlined-required"
                  variant="outlined"
                  size="small"
                  value={mdsMemory}
                  onChange={e => {
                    setMdsMemory(e.target.value);
                  }}
                  onBlur={e => {
                    hasMdsMemoryError(e.target.value);
                  }}
                  error={mdsMemoryError.length !== 0}
                  helperText={mdsMemoryError}
                />
              </div>
              <span>GB</span>
            </div>
            {Object.keys(osdDiskList).map(hostName => {
              return (
                <div
                  style={{
                    border: `1px solid black`,
                    margin: `5px`,
                    padding: `10px`
                  }}
                  key={hostName}
                >
                  <div>{hostName}</div>
                  <div>
                    {osdDiskList[hostName].length > 0 ? (
                      osdDiskList[hostName].map(disk => {
                        return (
                          <FormControlLabel
                            key={disk.diskName}
                            control={
                              <Checkbox
                                // checked={disk.checked}
                                name={disk.diskName}
                                onChange={e => {
                                  if (e.target.checked) {
                                    addSelectedOsdDisk(
                                      hostName,
                                      disk.diskName,
                                      disk.diskSize
                                    );
                                  } else {
                                    deleteSelectedOsdDisk(
                                      hostName,
                                      disk.diskName
                                    );
                                  }
                                }}
                              />
                            }
                            label={`${
                              disk.diskName
                            } ${Common.ChangeByteToGigaByte(disk.diskSize)}GB`}
                          />
                        );
                      })
                    ) : (
                      <div
                        style={{
                          height: `50px`
                        }}
                      >
                        Not Exist Disk
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {diskError ? <span>disk를 선택해주세요</span> : ''}
          </AccordionDetails>
        </Accordion>
      </>
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
            if (hasOsdCpuError()) hasError = true;
            if (hasOsdMemoryError()) hasError = true;
            if (hasMonCpuError()) hasError = true;
            if (hasMonMemoryError()) hasError = true;
            if (hasMgrCpuError()) hasError = true;
            if (hasMgrMemoryError()) hasError = true;
            if (hasMdsCpuError()) hasError = true;
            if (hasMdsMemoryError()) hasError = true;
            if (Object.keys(selectedOsdDisk).length === 0) {
              setDiskError(true);
              hasError = true;
            }
            if (hasError) return;
            setOption((prev: any) => {
              return {
                ...prev,
                disk: selectedOsdDisk,
                osdCpu,
                osdMemory,
                monCpu,
                monMemory,
                mgrCpu,
                mgrMemory,
                mdsCpu,
                mdsMemory
              };
            });
            dispatchAppState({
              type: 'set_installing',
              installing: CONST.PRODUCT.ROOK_CEPH.NAME
            });
            history.push(
              `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.ROOK_CEPH.NAME}/step3`
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
                {CONST.PRODUCT.ROOK_CEPH.NAME} 설정 화면에서 나가시겠습니까?
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
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.ROOK_CEPH.NAME}/step1`
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

export default InstallContentsRookCeph2;
