import React, { useContext } from 'react';
import Button from '@material-ui/core/Button';
import styles from './EnvHeader.css';
import CONST from '../constants/constant';
import { EnvPageContext } from '../containers/EnvPage';

function EnvHeader() {
  const envPageContext = useContext(EnvPageContext);
  const { envPageState, dispatchEnvPage } = envPageContext;

  let title = '';
  if (envPageState.mode === CONST.ENV.MANAGE) {
    title = '환경 관리';
  } else if (envPageState.mode === CONST.ENV.ADD) {
    title = '환경 추가';
  } else if (envPageState.mode === CONST.ENV.TEST_ADD) {
    title = '환경 추가';
  }

  const getButton = () => {
    if (envPageState.mode === CONST.ENV.MANAGE) {
      return (
        <>
          <button
            type="button"
            onClick={() => {
              dispatchEnvPage(CONST.ENV.ADD);
            }}
          >
            추가
          </button>
          {/* <button
            type="button"
            onClick={() => {
              dispatchEnvPage(CONST.ENV.TEST_ADD);
            }}
          >
            추가2
          </button> */}
        </>
      );
    }
    return null;
  };
  return (
    <div className={[styles.wrap, 'childUpDownCenter'].join(' ')}>
      <span>{title}</span>
      {getButton()}
    </div>
  );
}

export default EnvHeader;
