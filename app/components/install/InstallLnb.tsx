import React, { useContext } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import { FormControl, Select } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import styles from './InstallLnb.css';
import { HomePageContext } from '../../containers/HomePage';
import { InstallPageContext } from '../../containers/InstallPage';
import CONST from '../../utils/constants/constant';

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

function InstallLnb() {
  const homePageContext = useContext(HomePageContext);
  const { homePageState, dispatchHomePage } = homePageContext;

  const installPageContext = useContext(InstallPageContext);
  const { installPageState, dispatchInstallPage } = installPageContext;

  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const handleClick = () => {
    // setOpen(!open);
  };

  const [age, setAge] = React.useState('');
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAge(event.target.value as string);
  };

  const goEnvPage = () => {
    dispatchHomePage({
      type: 'SET_MODE',
      data: {
        mode: CONST.HOME.ENV
      }
    });
  };

  const goProductInstallPage = name => {
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
    <div className={[styles.wrap, 'left'].join(' ')}>
      <div className={['childUpDownCenter', 'childLeftRightCenter'].join(' ')}>
        <FormControl>
          {/* <InputLabel htmlFor="age-native-simple">Age</InputLabel> */}
          <Select
            native
            value={age}
            onChange={handleChange}
            inputProps={{
              name: 'age',
              id: 'age-native-simple'
            }}
          >
            {/* <option aria-label="None" value="" /> */}
            <option value={10}>환경 이름</option>
          </Select>
        </FormControl>
        <SettingsIcon onClick={goEnvPage} />
      </div>
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader
            component="div"
            id="nested-list-subheader"
            onClick={() => {
              dispatchInstallPage({
                type: 'SET_MODE',
                data: {
                  mode: CONST.INSTALL.MAIN
                }
              });
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
          <ListItemText primary="호환 제품" />
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
              >
                {/* <ListItemIcon>
                <StarBorder />
              </ListItemIcon> */}
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
