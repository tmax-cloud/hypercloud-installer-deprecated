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
import HelpIcon from '@material-ui/icons/Help';
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
      height: '100%',
      // maxWidth: 360,
      backgroundColor: '#E8F5FF'
    },
    nested: {
      paddingLeft: theme.spacing(4)
    }
  })
);

function InstallLnb(props: any) {
  console.debug('InstallLnb');

  const { history } = props;

  const appContext = useContext(AppContext);
  const { appState, dispatchAppState } = appContext;

  const classes = useStyles();
  const [open] = React.useState(true);
  const handleClick = () => {
    // setOpen(!open);
  };

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    dispatchAppState({
      env: env.getEnvByName(event.target.value as string)
    });
  };

  const goProductInstallPage = productName => {
    if (productName === 'Kubernetes') {
      history.push(`${routes.INSTALL.HOME}/${appState.env.name}/kubernetes`);
    }
  };

  const getInstalledImage = productName => {
    for (let i = 0; i < appState.env.installedProducts.length; i += 1) {
      const target = appState.env.installedProducts[i];
      if (target.name === productName) {
        return <img src={InstalledImage} alt="Logo" />;
      }
    }
    return '';
  };

  const isAllRequiredProductInstall = () => {
    for (let i = 0; i < CONST.PRODUCT.REQUIRED.length; i += 1) {
      const target = CONST.PRODUCT.REQUIRED[i].NAME;
      let isInstalled = false;
      for (let j = 0; j < appState.env.installedProducts.length; j += 1) {
        const target2 = appState.env.installedProducts[j].name;
        if (target === target2) {
          isInstalled = true;
          break;
        }
      }
      if (!isInstalled) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className={[styles.wrap, 'left'].join(' ')}>
      <div className={['childUpDownCenter', 'childLeftRightCenter'].join(' ')}>
        <FormControl>
          {/* <InputLabel htmlFor="age-native-simple">Age</InputLabel> */}
          <Select
            native
            value={appState.env.name}
            onChange={handleChange}
            inputProps={{
              name: 'age',
              id: 'age-native-simple'
            }}
          >
            {/* <option aria-label="None" value="" /> */}
            {env.loadEnv().map(e => {
              return (
                <option key={e.name} value={e.name}>
                  {e.name}
                </option>
              );
            })}
          </Select>
        </FormControl>
        <Link to={routes.HOME}>
          <SettingsIcon />
        </Link>
      </div>
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader
            component="div"
            id="nested-list-subheader"
            onClick={() => {
              history.push(`${routes.INSTALL.HOME}/${appState.env.name}/main`);
            }}
          >
            제품 목록
          </ListSubheader>
        }
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
                className={classes.nested}
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
              className={['childLeftRightLeft', 'childUpDownCenter'].join(' ')}
            >
              <div>
                <ListItemText primary="호환 제품" />
              </div>
              <Tooltip
                title="필수제품을 설치하셔야 호환제품을 설치할 수 있습니다."
                placement="right"
              >
                <HelpIcon fontSize="small" />
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
                className={classes.nested}
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
  );
}

export default InstallLnb;
