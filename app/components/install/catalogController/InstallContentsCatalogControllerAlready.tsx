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
  makeStyles,
  Theme,
  createStyles
} from '@material-ui/core';
import MuiBox from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import styles from '../InstallContents1.css';
import { AppContext } from '../../../containers/HomePage';
import CONST from '../../../utils/constants/constant';
import productImage from '../../../../resources/assets/HyperCloud Operator_logo.png';
// import FinishImage from '../../../../resources/assets/img_finish_mint.svg';
import FinishImage from '../../../../resources/assets/img_finish_blue.svg';
import * as env from '../../../utils/common/env';
import routes from '../../../utils/constants/routes.json';
import HyperCloudOperatorInstaller from '../../../utils/class/installer/HyperCloudOperatorInstaller';
import HyperCloudConsoleInstaller from '../../../utils/class/installer/HyperCloudConsoleInstaller';
import HyperCloudWebhookInstaller from '../../../utils/class/installer/HyperCloudWebhookInstaller';
import CatalogControllerInstaller from '../../../utils/class/installer/CatalogControllerInstaller';

const useStyles = makeStyles(() =>
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

function InstallContentsCatalogControllerAlready(props: any) {
  console.debug(InstallContentsCatalogControllerAlready.name, props);
  const { history, match } = props;

  const appContext = useContext(AppContext);
  const { dispatchAppState } = appContext;

  const nowEnv = env.loadEnvByName(match.params.envName);

  const nowProduct = CONST.PRODUCT.CATALOG_CONTROLLER;

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
    console.debug(`nowEnv`, nowEnv);

    const { version, type } = nowEnv.isInstalled(CONST.PRODUCT.CATALOG_CONTROLLER.NAME);

    const catalogControllerInstaller = CatalogControllerInstaller.getInstance;
    catalogControllerInstaller.env = nowEnv;
    await catalogControllerInstaller.remove();
  };

  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
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
              <img
                className={[styles.installedImage].join(' ')}
                src={FinishImage}
                alt="Logo"
              />
              <div className={[styles.insideCircle].join(' ')}>
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
              <span className={['medium', 'thick'].join(' ')}>
                Version
              </span>
            </div>
            <div>
              <span className={['medium', 'lightDark'].join(' ')}>
                {nowEnv.isInstalled(nowProduct.NAME).version}
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
                    {CONST.PRODUCT.CATALOG_CONTROLLER.NAME} 를 삭제하시겠습니까?
                  </span>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  className={['primary'].join(' ')}
                  onClick={async () => {
                    try {
                      dispatchAppState({
                        type: 'set_loading',
                        loading: true
                      });
                      handleClose();
                      await remove();
                      nowEnv.deleteProductByName(nowProduct.NAME);
                      env.updateEnv(nowEnv.name, nowEnv);
                      history.push(
                        `${routes.INSTALL.HOME}/${nowEnv.name}/main`
                      );
                    } catch (error) {
                      console.error(error);
                    } finally {
                      dispatchAppState({
                        type: 'set_loading',
                        loading: false
                      });
                    }
                  }}
                >
                  삭제
                </Button>
                <Button
                  className={['secondary'].join(' ')}
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
    </div>
  );
}

export default InstallContentsCatalogControllerAlready;
