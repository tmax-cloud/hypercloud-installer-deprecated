/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import styles from './EnvHeader.css';
import CONST from '../../utils/constants/constant';
import { EnvPageContext } from '../../containers/EnvPage';

function EnvHeader() {
  const envPageContext = useContext(EnvPageContext);
  const { envPageState, dispatchEnvPage } = envPageContext;

  let title = '';
  if (envPageState.mode === CONST.ENV.MANAGE) {
    title = '환경 관리';
  } else if (envPageState.mode === CONST.ENV.ADD) {
    title = '환경 추가';
  }

  const getButton = () => {
    if (envPageState.mode === CONST.ENV.MANAGE) {
      return (
        <>
          <Button
            className={styles.addButton}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => {
              dispatchEnvPage(CONST.ENV.ADD);
            }}
          >
            추가
          </Button>
        </>
      );
    }
    return null;
  };
  return (
    <div className={[styles.wrap, 'childUpDownCenter'].join(' ')}>
      <span className={styles.title}>{title}</span>
      {getButton()}
    </div>
  );
}

export default EnvHeader;
