import React from 'react';
import styles from './InstallContents.css';
import { Grid, Paper } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      height: 200,
      width: 200,
    },
    control: {
      padding: theme.spacing(2),
    },
  }),
);

function InstallContents() {
  const classes = useStyles();
  return (
    <div className={[styles.wrap, 'left'].join(' ')}>
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
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <Grid key={value} item>
                <Paper className={classes.paper} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </div>
      {/* <div className={[styles.wrap, 'left'].join(' ')}>
        <span>Install Contents</span>
        <div className={[styles.box, 'left'].join(' ')}>
          컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스
        </div>
        <div className={[styles.box, 'left'].join(' ')}>
          컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스
        </div>
        <div className={[styles.box, 'left'].join(' ')}>
          컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스
        </div>
        <div className={[styles.box, 'left'].join(' ')}>
          컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스
        </div>
        <div className={[styles.box, 'left'].join(' ')}>
          컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스
        </div>
        <div className={[styles.box, 'left'].join(' ')}>
          컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스
        </div>
        <div className={[styles.box, 'left'].join(' ')}>
          컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스
        </div>
        <div className={[styles.box, 'left'].join(' ')}>
          컨테이너화된 앱을 자동 배포하고 스케일링, 관리하는 서비스
        </div>
      </div> */}
    </div>
  );
}

export default InstallContents;
