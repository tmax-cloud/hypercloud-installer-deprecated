/* eslint-disable no-console */
import React, { useContext } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  CircularProgress,
  makeStyles,
  Theme,
  createStyles
} from '@material-ui/core';
import MuiBox from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import { green } from '@material-ui/core/colors';
import styles from './InstallContentsKubernetes1.css';
import { AppContext } from '../../containers/HomePage';
import * as Script from '../../utils/common/script';
import CONST from '../../utils/constants/constant';
import productImage from '../../../resources/assets/Cni_logo.png';
import FinishImage from '../../../resources/assets/img_finish.svg';
import * as env from '../../utils/common/env';
import routes from '../../utils/constants/routes.json';
import { Role } from '../../utils/class/Node';
import * as Common from '../../utils/common/ssh';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    // buttonSuccess: {
    //   backgroundColor: green[500],
    //   '&:hover': {
    //     backgroundColor: green[700]
    //   }
    // },
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -40,
      marginLeft: -40
    }
  })
);

function InstallContentsCniAlready(props: any) {
  console.debug(InstallContentsCniAlready.name, props);
  const { history, location, match } = props;

  const classes = useStyles();

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const nowEnv = env.getEnvByName(match.params.envName);

  const nowProduct = CONST.PRODUCT.CNI;

  // loading bar
  // const [loading, setLoading] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const defaultProps = {
    bgcolor: 'background.paper',
    borderColor: 'text.primary',
    m: 1,
    border: 1,
    style: { width: '20rem', height: '20rem' }
  };

  const remove = async () => {
    dispatchAppState({
      type: 'set_loading',
      loading: true
    });
    // setLoading(true);
    console.debug(nowEnv.nodeList);

    // mainMaster, master, worker로 분리
    const { mainMaster, masterArr, workerArr } = env.getArrSortedByRole(
      nowEnv.nodeList
    );

    const { version } = env.isInstalled(CONST.PRODUCT.CNI.NAME, nowEnv);

    console.error('mainMaster remove start');
    let command = '';
    command += Script.getCniRemoveScript(version);
    mainMaster.cmd = command;
    console.error(mainMaster.cmd);
    await Common.send(mainMaster, {
      close: () => {},
      stdout: (data: string) => {},
      stderr: (data: string) => {}
    });
    console.error('mainMaster remove end');

    // setLoading(false);
    dispatchAppState({
      type: 'set_loading',
      loading: false
    });
    history.push(`${routes.INSTALL.HOME}/${nowEnv.name}/main`);
  };

  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      {/* {loading && (
        <CircularProgress
          color="secondary"
          size={40}
          className={classes.buttonProgress}
        />
      )} */}
      <div>
        <div className={styles.contents}>
          <div className="childLeftRightCenter">
            <MuiBox
              className={[
                'childUpDownCenter',
                'childLeftRightCenter',
                styles.installedCircle
              ].join(' ')}
              borderRadius="50%"
              {...defaultProps}
            >
              <div className={[styles.insideCircle].join(' ')}>
                <img
                  style={{
                    heigh: '50px',
                    width: '50px',
                    position: 'relative',
                    left: '-125px'
                  }}
                  src={FinishImage}
                  alt="Logo"
                />
                <div>
                  <img src={productImage} alt="Logo" />
                </div>
                <div>
                  <span className={['large', 'thick'].join(' ')}>
                    {nowProduct.NAME}
                  </span>
                </div>
                <div>
                  <span className={['small', 'lightDark'].join(' ')}>
                    {nowProduct.DESC}
                  </span>
                </div>
              </div>
            </MuiBox>
          </div>
          <div>
            <div>
              <span className={['medium', 'thick'].join(' ')}>타입</span>
            </div>
            <div>
              <span className={['medium', 'lightDark'].join(' ')}>
                {env.isInstalled(nowProduct.NAME, nowEnv).type}
              </span>
            </div>
          </div>
          <div>
            <div>
              <span className={['medium', 'thick'].join(' ')}>버전</span>
            </div>
            <div>
              <span className={['medium', 'lightDark'].join(' ')}>
                {env.isInstalled(nowProduct.NAME, nowEnv).version}
              </span>
            </div>
          </div>
          <div>
            <span
              style={{ marginRight: '5px' }}
              className={['small', 'lightDark'].join(' ')}
            >
              더 이상 사용하지 않는다면?
            </span>
            <span className={['small', 'indicator'].join(' ')}>
              <a
                onClick={() => {
                  handleClickOpen();
                }}
              >
                삭제
              </a>
            </span>
          </div>
        </div>
        <div>
          <div>
            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                삭제
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
                    {CONST.PRODUCT.CNI.NAME} 를 삭제하시겠습니까?
                  </span>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  className={['blue'].join(' ')}
                  onClick={() => {
                    handleClose();
                    // TODO:delete kubernetes
                    env.deleteProductByName(nowEnv.name, nowProduct.NAME);
                    remove();
                  }}
                >
                  삭제
                </Button>
                <Button
                  className={['white'].join(' ')}
                  onClick={handleClose}
                  autoFocus
                >
                  취소
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>
        {/* <button
          type="button"
          onClick={() => {
            abc();
          }}
        >
          test
        </button>
        <span>{cnt}</span>
        <textarea value={stdout} disabled />
        <textarea value={stderr} disabled />
        <LinearProgressWithLabel value={progress} /> */}
      </div>
    </div>
  );
}

export default InstallContentsCniAlready;
