/* eslint-disable import/no-cycle */
import React, { useContext, useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import { FormControl, Select, Tooltip } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import { Link } from 'react-router-dom';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import styles from './InstallLnb.css';
import { AppContext } from '../../containers/HomePage';
// import { InstallPageContext } from '../../containers/InstallPage';
import CONST from '../../utils/constants/constant';
import * as env from '../../utils/common/env';
import routes from '../../utils/constants/routes.json';
import InstalledImage from '../../../resources/assets/ic_finish.svg';

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
  console.debug('InstallLnb');

  const { history, location, match } = props;
  console.debug(props);

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const classes = useStyles();
  const [open] = React.useState(true);
  const handleClick = () => {
    // setOpen(!open);
  };

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    // dispatchAppState({
    //   env: env.getEnvByName(event.target.value as string)
    // });
    history.push(`${routes.INSTALL.HOME}/${appState.nowEnv.name}`);
  };

  const goProductInstallPage = (productName: string) => {
    if (productName === CONST.PRODUCT.KUBERNETES_TXT) {
      if (env.isInstalled(productName, appState.nowEnv)) {
        history.push(
          `${routes.INSTALL.HOME}/${appState.nowEnv.name}/kubernetes/already`
        );
      } else {
        history.push(
          `${routes.INSTALL.HOME}/${appState.nowEnv.name}/kubernetes/step1`
        );
      }
    }
  };

  const getInstalledImage = (productName: string) => {
    if (env.isInstalled(productName, appState.nowEnv)) {
      return (
        <img src={InstalledImage} alt="Logo" style={{ marginRight: '5px' }} />
      );
    }
    return '';
  };

  const isAllRequiredProductInstall = () => {
    return env.isAllRequiredProductInstall(appState.nowEnv);
  };

  return (
    <div className={[styles.wrap].join(' ')}>
      <div className={[styles.selectBox, 'childLeftRightCenter'].join(' ')}>
        <Select
          native
          value={appState.nowEnv.name}
          onChange={handleChange}
          inputProps={{
            name: 'age',
            id: 'age-native-simple'
          }}
        >
          {/* <option aria-label="None" value="" /> */}
          {env.loadEnv().map((e: { name: {} | null | undefined }) => {
            return (
              <option key={e.name} value={e.name}>
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
                history.push(
                  `${routes.INSTALL.HOME}/${appState.nowEnv.name}/main`
                );
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
              {CONST.PRODUCT.REQUIRED.map(P => (
                <ListItem
                  key={P.NAME}
                  button
                  className={[classes.nested, styles.listItemBox].join(' ')}
                  onClick={() => {
                    goProductInstallPage(P.NAME);
                  }}
                >
                  {/* <ListItemIcon>
                  <StarBorder />
                </ListItemIcon> */}
                  {/* <CheckCircleIcon /> */}
                  {getInstalledImage(P.NAME)}
                  <ListItemText primary={P.NAME} />
                </ListItem>
              ))}
            </List>
          </Collapse>
          <ListItem
            // button
            onClick={handleClick}
          >
            {/* <ListItemIcon>
              <InboxIcon />
            </ListItemIcon> */}
            {isAllRequiredProductInstall() ? (
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
              {CONST.PRODUCT.OPTIONAL.map(P => (
                <ListItem
                  key={P.NAME}
                  button
                  className={[classes.nested, styles.listItemBox].join(' ')}
                  onClick={() => {
                    goProductInstallPage(P.NAME);
                  }}
                  disabled={!isAllRequiredProductInstall()}
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
