/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import { MenuItem, Select, Tooltip } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import { Link } from 'react-router-dom';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import styles from './InstallLnb.css';
// import { InstallPageContext } from '../../containers/InstallPage';
import CONST from '../../utils/constants/constant';
import * as env from '../../utils/common/env';
import routes from '../../utils/constants/routes.json';
// import InstalledImage from '../../../resources/assets/ic_finish_mint.svg';
import InstalledImage from '../../../resources/assets/ic_finish_mint.svg';
import * as product from '../../utils/common/product';
import { InstallContext } from '../../containers/InstallPage';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '100%'
      // maxWidth: 360,
    },
    nested: {
      paddingLeft: theme.spacing(4)
    }
  })
);

function InstallLnb(props: any) {
  console.debug(InstallLnb.name, props);

  const { history, match, location } = props;

  // const appContext = useContext(AppContext);
  // const { appState, dispatchAppState } = appContext;

  let nowEnv = env.loadEnvByName(match.params.envName);

  const requiredProduct = product.getRequiredProduct();
  const optionalProduct = product.getOptionalProduct();

  const classes = useStyles();

  const [open] = React.useState(true);
  const handleClick = () => {
    // setOpen(!open);
  };

  const handleChange = (e) => {
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
        <List
          component="nav"
          aria-labelledby="nested-list-subheader"
          subheader={(
            <ListSubheader
              component="div"
              id="nested-list-subheader"
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
            <ListItemText primary="필수 제품" />
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
                  disabled={!nowEnv.isAllRequiredProductInstall()}
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
