/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';
import { Grid, Paper } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import styles from './InstallContentsMain.css';
import CONST from '../../utils/constants/constant';
import { AppContext } from '../../containers/HomePage';
import routes from '../../utils/constants/routes.json';
import * as env from '../../utils/common/env';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    paper: {
      height: 200,
      width: 200
    },
    control: {
      padding: theme.spacing(2)
    }
  })
);

function InstallContentsMain(props: any) {
  console.debug('InstallContentsMain');

  const { history, location, match } = props;

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const classes = useStyles();

  const goProductInstallPage = (name) => {
    console.log('goProductInstallPage');
    if (name === CONST.PRODUCT.KUBERNETES_TXT) {
      history.push(`${routes.INSTALL.HOME}/${appState.env.name}/kubernetes`);
    }
  };

  return (
    <div className={[styles.wrap].join(' ')}>
      <div className={[styles.textBox].join(' ')}>
        <div className={['childLeftRightCenter', styles.textBoxRow].join(' ')}>
          <strong className={[styles.title].join(' ')}>HyperCloud Installer</strong>
        </div>
        <div className={['childLeftRightCenter', styles.textBoxRow].join(' ')}>
          <span>
            HyperCloud Installer는 쿠버네티스 및 다양한 호환 제품 설치를
            제공합니다.
          </span>
        </div>
        <div className={['childLeftRightCenter', styles.textBoxRow].join(' ')}>
          <br />
          <span>설치할 제품을 선택해 주세요.</span>
        </div>
      </div>
      <div>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={2}>
            {CONST.PRODUCT.REQUIRED.map(P => (
              <Grid key={P.NAME} item>
                <Paper
                  className={classes.paper}
                  onClick={() => {
                    goProductInstallPage(P.NAME);
                  }}
                  variant="outlined"
                >
                  <div className={['childUpDownCenter', 'childLeftRightCenter', styles.productBox].join(' ')}>
                    <div>
                      <div>
                        <strong>{P.NAME}</strong>
                      </div>
                      <div>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </Paper>
              </Grid>
            ))}
            {CONST.PRODUCT.OPTIONAL.map(P => (
              <Grid key={P.NAME} item>
                <Paper
                  className={classes.paper}
                  onClick={() => {
                    // 필수 제품 모두 설치 된 경우에만 호환 제품 설치 페이지로 이동 가능
                    if (env.isAllRequiredProductInstall(appState.env)) {
                      goProductInstallPage(P.NAME);
                    }
                  }}
                  variant="outlined"
                >
                  <div style={{
                    'pointer-events': 'none',
                    'opacity': '0.4'
                  }} className={['childUpDownCenter', 'childLeftRightCenter', styles.productBox].join(' ')}>
                    <div>
                      <div>
                        <strong>{P.NAME}</strong>
                      </div>
                      <div>
                        <span></span>
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
