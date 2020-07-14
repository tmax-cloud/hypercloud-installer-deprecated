import React, { useContext } from 'react';
import { Grid, Paper } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import styles from './InstallContentsMain.css';
import CONST from '../constants/constant';
import { InstallPageContext } from '../containers/InstallPage';

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

function InstallContentsMain() {
  const installPageContext = useContext(InstallPageContext);
  const { installPageState, dispatchInstallPage } = installPageContext;

  const classes = useStyles();

  const products = CONST.PRODUCT.REQUIRED.concat(CONST.PRODUCT.OPTIONAL);

  const goProductInstallPage = (name) => {
    console.log('goProductInstallPage');
    if (name === 'Kubernetes') {
      dispatchInstallPage({
        type: 'SET_MODE',
        data: {
          mode: CONST.INSTALL.KUBERNETES
        }
      });
    }
  };

  return (
    <div className={[styles.wrap].join(' ')}>
      <div>
        <div className="childLeftRightCenter">
          <strong>HyperCloud Installer</strong>
        </div>
        <div className="childLeftRightCenter">
          <span>
            HyperCloud Installer는 쿠버네티스 및 다양한 호환 제품 설치를
            제공합니다.
          </span>
        </div>
        <div className="childLeftRightCenter">
          <br />
          <span>설치할 제품을 선택해 주세요.</span>
        </div>
      </div>
      <div>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={2}>
            {products.map(P => (
              <Grid key={P.NAME} item>
                <Paper
                  className={classes.paper}
                  onClick={() => {
                    goProductInstallPage(P.NAME);
                  }}
                >
                  <span>{P.NAME}</span>
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
