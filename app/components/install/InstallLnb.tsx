/* eslint-disable import/no-cycle */
import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import { Select, Tooltip } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import { Link } from 'react-router-dom';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import { History, Location } from 'history';
import * as router from 'react-router';
import styles from './InstallLnb.css';
// import { InstallPageContext } from '../../containers/InstallPage';
import CONST from '../../utils/constants/constant';
import * as env from '../../utils/common/env';
import routes from '../../utils/constants/routes.json';
// import InstalledImage from '../../../resources/assets/ic_finish_mint.svg';
import InstalledImage from '../../../resources/assets/ic_finish_blue.svg';
import * as product from '../../utils/common/product';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
      // maxWidth: 360,
      display: 'none'
    },
    nested: {
      paddingLeft: theme.spacing(4)
    },
    stepLabel_primary: {
      cursor: 'pointer !important'
    },
    stepper_primary: {
      backgroundColor: '#28384F'
    }
  })
);

type Props = {
  history: History;
  match: router.match;
  location: Location;
  clicked: string;
  setClicked: Function;
};

function InstallLnb({ history, match, location, clicked, setClicked }: Props) {
  console.debug(InstallLnb.name);

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

  let nowEnv = env.loadEnvByName(match.params.envName);

  const requiredProduct = product.getRequiredProduct();
  const optionalProduct = product.getOptionalProduct();

  const classes = useStyles();

  // const [clicked, setClicked] = React.useState('');

  const [open] = React.useState(true);
  const handleClick = () => {
    // setOpen(!open);
  };

  const handleChange = e => {
    history.push(`${routes.INSTALL.HOME}/${e.target.value}`);
  };

  const getItem = (productName: string, disabled: boolean) => {
    // Kubernetes가 설치 되지 않으면 disabled === true
    if (disabled) {
      return (
        <div className={['childLeftRightLeft', 'childUpDownCenter'].join(' ')}>
          <div>
            <ListItemText primary={productName} />
          </div>
          {/* <Tooltip
            title="Kubernetes를 설치하셔야 설치할 수 있습니다."
            placement="right"
          >
            <HelpOutlineIcon fontSize="small" />
          </Tooltip> */}
          <div />
        </div>
      );
    }
    return <ListItemText primary={productName} />;
  };

  // 설치 여부 이미지 표시 해주는 함수
  const getInstalledImage = (productName: string) => {
    if (nowEnv.isInstalled(productName)) {
      return (
        <img src={InstalledImage} alt="Logo" style={{ marginRight: '5px' }} />
      );
    }
    return '';
  };

  // stepper 관련
  function getSteps() {
    const result = requiredProduct.map(p => {
      return p.NAME;
    });
    return result;
  }


  const steps = getSteps();

  const getcompleted = productName => {
    if (nowEnv.isInstalled(productName)) {
      return true;
    }
    return false;
  };

  const getClassName = label => {
    if (getcompleted(label)) {
      if (clicked === label) {
        return styles.clicked;
      }
      return styles.installed;
    }

    if (clicked === label) {
      return styles.clicked;
    }
  };
  return (
    <div className={[styles.wrap].join(' ')}>
      <div className={[styles.selectBox, 'childLeftRightCenter'].join(' ')}>
        <Select native value={nowEnv.name} onChange={handleChange}>
          {env.loadEnvList().map((e: any) => {
            return (
              <option style={{ color: 'black' }} key={e.name} value={e.name}>
                {e.name}
              </option>
            );
          })}
        </Select>
        <Link to={routes.HOME}>
          <SettingsIcon />
        </Link>
      </div>
      <div className={styles.lnb}>
        <ListSubheader
          component="div"
          id="nested-list-subheader"
          className="childUpDownCenter"
          disableSticky
          onClick={() => {
            history.push(`${routes.INSTALL.HOME}/${nowEnv.name}/main`);
            setClicked('');
          }}
        >
          <span style={{ color: 'white' }}>
            <a>제품 목록</a>
          </span>
        </ListSubheader>
        <Stepper
          // activeStep={activeStep}
          orientation="vertical"
          className={classes.stepper_primary}
        >
          {steps.map((label) => (
            <Step
              key={label}
              active
              completed={getcompleted(label)}
              className={getClassName(label)}
              onClick={() => {
                nowEnv = env.loadEnvByName(match.params.envName);
                product.goProductInstallPage(label, nowEnv, history);
                setClicked(label);
              }}
            >
              <StepLabel className={classes.stepLabel_primary}>
                {label}
              </StepLabel>
              <StepContent>
                {/* <Typography>{getStepContent(index)}</Typography> */}
              </StepContent>
            </Step>
          ))}
        </Stepper>
        <List
          component="nav"
          aria-labelledby="nested-list-subheader"
          subheader={(
            <ListSubheader
              component="div"
              id="nested-list-subheader"
              className="childUpDownCenter"
              disableSticky
              onClick={() => {
                history.push(`${routes.INSTALL.HOME}/${nowEnv.name}/main`);
              }}
            >
              <span style={{ color: 'white' }}>
                <a>제품 목록</a>
              </span>
            </ListSubheader>
          )}
          className={classes.root}
        >
          <ListItem>
            {/* <ListItemIcon>
              <DraftsIcon />
            </ListItemIcon> */}
            {nowEnv.isAllRequiredProductInstall() ? (
              <ListItemText primary="필수 제품" />
            ) : (
              <div
                className={['childLeftRightLeft', 'childUpDownCenter'].join(
                  ' '
                )}
              >
                <div>
                  <ListItemText primary="필수 제품" />
                </div>
                <Tooltip
                  title="쿠버네티스 제품을 설치해야 그 외 모듈을 설치할 수 있습니다."
                  placement="right"
                >
                  <HelpOutlineIcon fontSize="small" />
                </Tooltip>
                <div />
              </div>
            )}
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {requiredProduct.map(P => {
                // Kubernetes 이외 제품은
                // Kubernetes 가 설치되어야만 설치 가능
                let disabled = false;
                if (P.NAME !== CONST.PRODUCT.KUBERNETES.NAME) {
                  if (!nowEnv.isInstalled(CONST.PRODUCT.KUBERNETES.NAME)) {
                    disabled = true;
                  }
                }
                return (
                  <ListItem
                    key={P.NAME}
                    button
                    className={
                      location.pathname.split('/')[3]?.toLowerCase() ===
                      P.NAME.toLowerCase()
                        ? [classes.nested, styles.seletecItemBox].join(' ')
                        : [classes.nested, styles.listItemBox].join(' ')
                    }
                    onClick={() => {
                      nowEnv = env.loadEnvByName(match.params.envName);
                      product.goProductInstallPage(P.NAME, nowEnv, history);
                    }}
                    // XXX:disabled 상태 없이 진행 (수동으로 환경에 직접 설치 시, 인스톨러에서 설치 여부 판단 어려움)
                    // disabled={disabled}
                  >
                    {/* <ListItemIcon>
                  <StarBorder />
                </ListItemIcon> */}
                    {/* <CheckCircleIcon /> */}
                    {getInstalledImage(P.NAME)}
                    {getItem(P.NAME, disabled)}
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
          <ListItem
            // button
            onClick={handleClick}
          >
            {/* <ListItemIcon>
              <InboxIcon />
            </ListItemIcon> */}
            {nowEnv.isAllRequiredProductInstall() ? (
              <ListItemText primary="호환 제품" />
            ) : (
              <div
                className={['childLeftRightLeft', 'childUpDownCenter'].join(
                  ' '
                )}
              >
                <div>
                  <ListItemText primary="호환 제품" />
                </div>
                <Tooltip
                  title="필수제품을 설치하셔야 호환제품을 설치할 수 있습니다."
                  placement="right"
                >
                  <HelpOutlineIcon fontSize="small" />
                </Tooltip>
                <div />
              </div>
            )}

            {/* {open ? <ExpandLess /> : <ExpandMore />} */}
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {optionalProduct.map(P => (
                <ListItem
                  key={P.NAME}
                  button
                  className={
                    location.pathname.split('/')[3]?.toLowerCase() ===
                    P.NAME.toLowerCase()
                      ? [classes.nested, styles.seletecItemBox].join(' ')
                      : [classes.nested, styles.listItemBox].join(' ')
                  }
                  onClick={() => {
                    product.goProductInstallPage(P.NAME, nowEnv, history);
                  }}
                  // XXX:disabled 상태 없이 진행 (수동으로 환경에 직접 설치 시, 인스톨러에서 설치 여부 판단 어려움)
                  // disabled={!nowEnv.isAllRequiredProductInstall()}
                >
                  {/* <ListItemIcon>
                  <StarBorder />
                </ListItemIcon> */}
                  {getInstalledImage(P.NAME)}
                  <ListItemText primary={P.NAME} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </div>
    </div>
  );
}

export default InstallLnb;
