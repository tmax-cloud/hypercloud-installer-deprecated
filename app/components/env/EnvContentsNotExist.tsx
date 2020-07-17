import React from 'react';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import styles from './EnvContentsNotExist.css';
import CONST from '../../utils/constants/constant';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import EmptyImage from '../../../resources/assets/img_empty.svg';

interface Props {
  dispatchEnvPage: Function;
}

function EnvContentsNotExist(props: Props) {
  console.debug('EnvContentsNotExist');
  const { dispatchEnvPage } = props;
  // const IMG_PATH = './constants/empty.png';
  return (
    <div className={[styles.wrap, 'childUpDownCenter'].join(' ')}>
      <div className={styles.box}>
        {/* <img className="small" src={IMG_PATH} alt="" />
        <br /> */}
        <div className={styles.textBox}>
          {/* <NotInterestedIcon fontSize="large" /> */}
          <img src={EmptyImage} alt="Logo" />
        </div>
        <div className={styles.textBox}>
          <span>환경을 추가할 수 있습니다.</span>
        </div>
        <div className={styles.textBox}>
          <span>추가하려면, 아래의 버튼을 클릭해 주세요.</span>
        </div>
        <div>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => {
              dispatchEnvPage(CONST.ENV.ADD);
            }}
          >
            환경 추가
          </Button>
        </div>
        <div className={styles.textBox}>
          <span>추가한 환경에 제품을 설치할 수 있습니다.</span>
        </div>
      </div>
    </div>
  );
}

export default EnvContentsNotExist;
