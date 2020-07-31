/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';
import { Grid, Paper, Tooltip } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import styles from './InstallContentsMain.css';
import CONST from '../../utils/constants/constant';
import { AppContext } from '../../containers/HomePage';
import routes from '../../utils/constants/routes.json';
import * as env from '../../utils/common/env';
import CloudImage from '../../../resources/assets/ic_logo_hypercloud.svg';
import InstalledImage from '../../../resources/assets/ic_finish.svg';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    paper: {
      height: 220,
      width: 220
    },
    control: {
      padding: theme.spacing(2)
    }
  })
);

function InstallContentsMain(props: any) {
  console.debug('InstallContentsMain');

  const { history, location, match } = props;
  console.debug(props);

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

  const nowEnv = env.getEnvByName(match.params.envName);

  const classes = useStyles();

  const goProductInstallPage = (name: string) => {
    console.log('goProductInstallPage');
    if (name === CONST.PRODUCT.KUBERNETES.NAME) {
      if (env.isInstalled(name, nowEnv)) {
        history.push(
          `${routes.INSTALL.HOME}/${nowEnv.name}/kubernetes/already`
        );
      } else {
        history.push(
          `${routes.INSTALL.HOME}/${nowEnv.name}/kubernetes/step1`
        );
      }
    }
  };

  const getInstalledImage = (productName: string) => {
    if (env.isInstalled(productName, nowEnv)) {
      return (
        <span>
          <img src={InstalledImage} alt="Logo" style={{ marginRight: '5px' }} />
          <span>설치 됨</span>
        </span>
      );
    }
    return '';
  };

  const getInstalledLogo = (productName: string) => {
    const path = `../resources/assets/${productName}_logo.png`;
    return (
      <span>
        <img src={path} alt="Logo" style={{ marginRight: '5px' }} />
      </span>
    );
  };

  return (
    <div className={[styles.wrap].join(' ')}>
      <div className={[styles.textBox].join(' ')}>
        <div className={['childLeftRightCenter', styles.textBoxRow].join(' ')}>
          <img src={CloudImage} alt="Logo" />
          <strong className={[styles.title, 'indicator'].join(' ')}>
            HyperCloud Installer
          </strong>
        </div>
        <div
          className={[
            'childLeftRightCenter',
            styles.textBoxRow,
            'mediun',
            'lightDark'
          ].join(' ')}
        >
          <span>
            HyperCloud Installer는 쿠버네티스 및 다양한 호환 제품 설치를
            제공합니다.
          </span>
        </div>
        <div
          className={[
            'childLeftRightCenter',
            styles.textBoxRow,
            'mediun',
            'lightDark'
          ].join(' ')}
        >
          <br />
          <span>설치할 제품을 선택해 주세요.</span>
        </div>
      </div>
      <div>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={2}>
            {CONST.PRODUCT.REQUIRED.map((P, index) => (
              <Grid key={P.NAME} item>
                {index === 0 ? (
                  <div style={{ height: '25px' }}>
                    <span className={['small', 'thick'].join(' ')}>
                      필수 제품
                    </span>
                  </div>
                ) : (
                  <div style={{ height: '25px' }} />
                )}
                <Paper
                  className={classes.paper}
                  onClick={() => {
                    goProductInstallPage(P.NAME);
                  }}
                  variant="outlined"
                >
                  <div
                    className={[
                      '',
                      'childLeftRightCenter',
                      styles.productBox
                    ].join(' ')}
                  >
                    <div className={[styles.productBoxContents].join(' ')}>
                      <div
                        className={[
                          'childLeftRightRight',
                          styles.installedImageBox
                        ].join(' ')}
                      >
                        {getInstalledImage(P.NAME)}
                      </div>
                      <div>{getInstalledLogo(P.NAME)}</div>
                      <div>
                        <strong>{P.NAME}</strong>
                      </div>
                      <div>
                        <span className={['small', 'lightDark'].join(' ')}>
                          {P.DESC}
                        </span>
                      </div>
                    </div>
                  </div>
                </Paper>
              </Grid>
            ))}
            {CONST.PRODUCT.OPTIONAL.map((P, index) => (
              <Grid key={P.NAME} item>
                {index === 0 ? (
                  <div
                    style={{ height: '25px' }}
                    className={['childUpDownCenter'].join(' ')}
                  >
                    <span className={['small', 'thick'].join(' ')}>
                      호환 제품
                    </span>
                    <Tooltip
                      title="필수제품을 설치하셔야 호환제품을 설치할 수 있습니다."
                      placement="right"
                    >
                      <HelpOutlineIcon fontSize="small" />
                    </Tooltip>
                  </div>
                ) : (
                  <div style={{ height: '25px' }} />
                )}
                <Paper
                  className={classes.paper}
                  onClick={() => {
                    // 필수 제품 모두 설치 된 경우에만 호환 제품 설치 페이지로 이동 가능
                    if (env.isAllRequiredProductInstall(nowEnv)) {
                      goProductInstallPage(P.NAME);
                    }
                  }}
                  variant="outlined"
                >
                  <div
                    style={
                      env.isAllRequiredProductInstall(nowEnv)
                        ? {}
                        : {
                            pointerEvents: 'none',
                            opacity: '0.4'
                          }
                    }
                    className={[
                      '',
                      'childLeftRightCenter',
                      styles.productBox
                    ].join(' ')}
                  >
                    <div className={[styles.productBoxContents].join(' ')}>
                      <div
                        className={[
                          'childLeftRightRight',
                          styles.installedImageBox
                        ].join(' ')}
                      >
                        {getInstalledImage(P.NAME)}
                      </div>
                      <div>{getInstalledLogo(P.NAME)}</div>
                      <div>
                        <strong>{P.NAME}</strong>
                      </div>
                      <div>
                        <span className={['small', 'lightDark'].join(' ')}>
                          {P.DESC}
                        </span>
                      </div>
                    </div>
                  </div>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default InstallContentsMain;
