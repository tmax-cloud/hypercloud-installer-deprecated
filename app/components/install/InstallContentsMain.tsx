/* eslint-disable import/no-cycle */
import React, { useContext, useState } from 'react';
import { Grid, Paper, TextField, Tooltip } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { History, Location } from 'history';
import * as router from 'react-router';
import styles from './InstallContentsMain.css';
import CONST from '../../utils/constants/constant';
import { AppContext } from '../../containers/HomePage';
import routes from '../../utils/constants/routes.json';
import * as env from '../../utils/common/env';
import * as product from '../../utils/common/product';
import CloudImage from '../../../resources/assets/ic_logo_hypercloud_blue.svg';
// import CloudImage from '../../../resources/assets/ic_logo_hypercloud_mint.svg';
import KubernetesImage from '../../../resources/assets/Kubernetes_logo.png';
import CniImage from '../../../resources/assets/cni_logo.png';
import MetalLbImage from '../../../resources/assets/MetalLb_logo.png';
import RookCephImage from '../../../resources/assets/Rook ceph_logo.png';
import PrometheusImage from '../../../resources/assets/Prometheus_logo.png';
import HyperCloudOperatorImage from '../../../resources/assets/HyperCloud Operator_logo.png';
import TektonImage from '../../../resources/assets/Tekton_logo.png';
// import InstalledImage from '../../../resources/assets/ic_finish_mint.svg';
import InstalledImage from '../../../resources/assets/ic_finish_blue.svg';

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

type Props = {
  history: History;
  match: router.match;
  location: Location;
  setClicked: Function;
};

function InstallContentsMain({ history, location, match, setClicked }: Props) {
  console.debug(InstallContentsMain.name);

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

  const nowEnv = env.loadEnvByName(match.params.envName);

  const [searchText, setSearchText] = useState('');

  let requiredProduct = product.getRequiredProduct();
  let optionalProduct = product.getOptionalProduct();

  if (searchText) {
    searchText.toLocaleLowerCase();
    requiredProduct = requiredProduct.filter(P => {
      if (P.NAME.toLocaleLowerCase().indexOf(searchText) !== -1) {
        return true;
      }
      return false;
    });
    optionalProduct = optionalProduct.filter(P => {
      if (P.NAME.toLocaleLowerCase().indexOf(searchText) !== -1) {
        return true;
      }
      return false;
    });
  }

  const classes = useStyles();

  // const goProductInstallPage = (name: string) => {
  //   console.debug('goProductInstallPage');
  //   if (name === CONST.PRODUCT.KUBERNETES.NAME) {
  //     if (env.isInstalled(name, nowEnv)) {
  //       history.push(
  //         `${routes.INSTALL.HOME}/${nowEnv.name}/kubernetes/already`
  //       );
  //     } else {
  //       history.push(
  //       `${routes.INSTALL.HOME}/${nowEnv.name}/kubernetes/step1`
  //       );
  //     }
  //   }
  // };

  const getInstalledImage = (productName: string) => {
    if (nowEnv.isInstalled(productName)) {
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
    let image = null;
    if (productName === CONST.PRODUCT.KUBERNETES.NAME) {
      image = KubernetesImage;
    } else if (productName === CONST.PRODUCT.CNI.NAME) {
      image = CniImage;
    } else if (productName === CONST.PRODUCT.METAL_LB.NAME) {
      image = MetalLbImage;
    } else if (productName === CONST.PRODUCT.HYPERAUTH.NAME) {
      image = HyperCloudOperatorImage;
    } else if (productName === CONST.PRODUCT.HYPERCLOUD.NAME) {
      image = HyperCloudOperatorImage;
    } else if (productName === CONST.PRODUCT.ROOK_CEPH.NAME) {
      image = RookCephImage;
    } else if (productName === CONST.PRODUCT.PROMETHEUS.NAME) {
      image = PrometheusImage;
    } else if (productName === CONST.PRODUCT.CATALOG_CONTROLLER.NAME) {
      image = HyperCloudOperatorImage;
    } else if (productName === CONST.PRODUCT.TEKTON.NAME) {
      image = TektonImage;
    }
    return (
      <span>
        <img src={image} alt="Logo" style={{ marginRight: '5px' }} />
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
            HyperCloud Installer는 {CONST.PRODUCT.KUBERNETES.NAME} 및 다양한
            호환 제품 설치를 제공합니다.
          </span>
        </div>
        <div
          className={[
            'childLeftRightCenter',
            styles.textBoxRow,
            'medium',
            'lightDark'
          ].join(' ')}
        >
          <br />
          <span>설치할 제품을 선택해 주세요.</span>
        </div>
      </div>
      <div className="childLeftRightRight">
        <TextField
          required
          className={['medium'].join(' ')}
          id="outlined-required"
          label="검색"
          placeholder="제품명"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value);
            // hasIpError(e.target.value);
          }}
          onBlur={e => {
            // hasUserError(e.target.value);
          }}
          // error={userError.length !== 0}
          // helperText={userError}
        />
      </div>
      <div>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={2}>
            {requiredProduct.map((P, index) => {
              // Kubernetes 이외 제품은
              // Kubernetes 가 설치되어야만 설치 가능
              let disabled = false;
              if (P.NAME !== CONST.PRODUCT.KUBERNETES.NAME) {
                if (!nowEnv.isInstalled(CONST.PRODUCT.KUBERNETES.NAME)) {
                  disabled = true;
                }
              }
              return (
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
                      // kubernetes 미설치시, 설치페이지 이동 불가
                      // XXX:disabled 상태 없이 진행 (수동으로 환경에 직접 설치 시, 인스톨러에서 설치 여부 판단 어려움)
                      // if (!disabled) {
                      //   product.goProductInstallPage(P.NAME, nowEnv, history);
                      // }
                      product.goProductInstallPage(P.NAME, nowEnv, history);
                      setClicked(P.NAME);
                    }}
                    variant="outlined"
                  >
                    <div
                      // kubernetes 미설치시, disabled
                      // style={
                      //   !disabled
                      //     ? {}
                      //     : {
                      //         pointerEvents: 'none',
                      //         opacity: '0.4'
                      //       }
                      // }
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
              );
            })}
            {optionalProduct.map((P, index) => (
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
                    // XXX:disabled 상태 없이 진행 (수동으로 환경에 직접 설치 시, 인스톨러에서 설치 여부 판단 어려움)
                    // if (nowEnv.isAllRequiredProductInstall()) {
                    //   product.goProductInstallPage(P.NAME, nowEnv, history);
                    // }
                    product.goProductInstallPage(P.NAME, nowEnv, history);
                    setClicked(P.NAME);
                  }}
                  variant="outlined"
                >
                  <div
                    // style={
                    //   nowEnv.isAllRequiredProductInstall()
                    //     ? {}
                    //     : {
                    //         pointerEvents: 'none',
                    //         opacity: '0.4'
                    //       }
                    // }
                    className={[
                      '',
                      'childLeftRightCenter',
                      styles['productBox--second']
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
