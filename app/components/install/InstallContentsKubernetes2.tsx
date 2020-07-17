import React, { useContext } from 'react';
import {
  Button,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@material-ui/core';
import { KubeInstallContext } from './InstallContentsKubernetes';
import CONST from '../../utils/constants/constant';
import routes from '../../utils/constants/routes.json';
import styles from './InstallContentsKubernetes2.css';

function InstallContentsKubernetes2() {
  const kubeInstallContext = useContext(KubeInstallContext);
  const { kubeInstallState, dispatchKubeInstall } = kubeInstallContext;

  const [version, setVersion] = React.useState(kubeInstallState.version);
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setVersion(event.target.value as string);
  };

  const [registry, setRegistry] = React.useState('');

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
          <span>쿠버네티스 버전</span>
        </div>
        <div>
          <FormControl className={styles.select}>
            {/* <InputLabel htmlFor="age-native-simple">Age</InputLabel> */}
            <Select
              native
              value={version}
              onChange={handleChange}
              inputProps={{
                name: 'age',
                id: 'age-native-simple'
              }}
            >
              {/* <option aria-label="None" value="" /> */}
              <option value="1.17.3">1.17.3</option>
            </Select>
          </FormControl>
        </div>
      </div>
      <div className={['childLeftRightLeft'].join(' ')}>
        <div className={[styles.titleBox].join(' ')}>
          <span>도커 레지스트리 주소</span>
        </div>
        <div>
          <TextField
            id="outlined"
            label="Registry"
            variant="outlined"
            size="small"
            value={registry}
            onChange={e => {
              setRegistry(e.target.value);
              // hasIpError(e.target.value);
            }}
          />
          <div>
            <span>미입력 시, 파드를 생성할 때 Docker Hub에서 이미지를 가져옵니다.</span>
          </div>
        </div>
      </div>
      <div className={['childLeftRightCenter'].join(' ')}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            dispatchKubeInstall({
              version,
              registry,
              page: 3
            });
          }}
        >
          다음
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
            쿠버네티스 설정 화면에서 나가시겠습니까?
            설정 내용은 저장되지 않습니다.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                handleClose();
                dispatchKubeInstall({
                  page: 1
                });
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
  );
}

export default InstallContentsKubernetes2;
