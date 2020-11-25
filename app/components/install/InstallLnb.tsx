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

  let nowEnv = env.loadEnvByName(match.params.envName);

  const requiredProduct = product.getRequiredProduct();
  const optionalProduct = product.getOptionalProduct();

  const classes = useStyles();

  const handleChange = e => {
    history.push(`${routes.INSTALL.HOME}/${e.target.value}`);
  };

  /**
   * stepper 관련 함수들
   */
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
      </div>
    </div>
  );
}

export default InstallLnb;
