import React, { useContext } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton
} from '@material-ui/core';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import MuiBox from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import styles from '../InstallContents1.css';
import { AppContext } from '../../../containers/AppContext';
import CONST from '../../../utils/constants/constant';
import productImage from '../../../../resources/assets/Rook ceph_logo.png';
// import FinishImage from '../../../../resources/assets/img_finish_mint.svg';
import FinishImage from '../../../../resources/assets/img_finish_blue.svg';
import * as env from '../../../utils/common/env';
import routes from '../../../utils/constants/routes.json';
import RookCephInstaller from '../../../utils/class/installer/RookCephInstaller';
import * as Common from '../../../utils/common/common';

function InstallContentsRookCephAlready(props: any) {
  console.debug(InstallContentsRookCephAlready.name, props);
  const { history, match } = props;

  const appContext = useContext(AppContext);
  const { dispatchAppState } = appContext;

  const nowEnv = env.loadEnvByName(match.params.envName);
  const nowProduct = CONST.PRODUCT.ROOK_CEPH;
  const product = nowEnv.isInstalled(nowProduct.NAME);

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

    const rookCephInstaller = RookCephInstaller.getInstance;
    rookCephInstaller.env = nowEnv;

    await rookCephInstaller.remove(
      rookCephInstaller.env.getProductByName(CONST.PRODUCT.ROOK_CEPH.NAME).disk
    );
  };

  const getDiskJSX = disk => {
    const jsx = Object.keys(disk).map(hostName => {
      return (
        <Accordion key={hostName}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>{hostName}</Typography>
          </AccordionSummary>
          <AccordionDetails
            style={{
              display: `block`
            }}
          >
            {disk[hostName].map((d: any) => {
              const { diskName, diskSize } = d;
              return (
                <li key={diskName}>
                  <span>
                    {diskName} /{Common.ChangeByteToGigaByte(diskSize)}
                    GB
                  </span>
                </li>
              );
            })}
          </AccordionDetails>
        </Accordion>
      );
    });
    return jsx;
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
              <span className={['medium', 'thick'].join(' ')}>Version</span>
            </div>
            <div>
              <span className={['medium', 'lightDark'].join(' ')}>
                {product.version}
              </span>
            </div>
          </div>
          <div>
            <div>
              <span className={['medium', 'thick'].join(' ')}>Disk</span>
            </div>
            <div>
              <span className={['lightDark'].join(' ')}>
                {getDiskJSX(product.disk)}
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
                    {CONST.PRODUCT.ROOK_CEPH.NAME} 를 삭제하시겠습니까?
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

export default InstallContentsRookCephAlready;
