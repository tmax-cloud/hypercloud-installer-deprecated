import React from 'react';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';
import EmptyImage from '../../../resources/assets/img_empty.svg';
import styles from './EnvContentsNotExist.css';
import routes from '../../utils/constants/routes.json';

function EnvContentsNotExist() {
  console.debug('EnvContentsNotExist');

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
          <Link to={routes.ENV.ADD}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              size="small"
            >
              환경 추가
            </Button>
          </Link>
        </div>
        <div className={styles.textBox}>
          <span>추가한 환경에 제품을 설치할 수 있습니다.</span>
        </div>
      </div>
    </div>
  );
}

export default EnvContentsNotExist;
