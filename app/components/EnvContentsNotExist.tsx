import React from 'react';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import styles from './EnvContentsNotExist.css';
import CONST from '../constants/constant';

interface Props {
  dispatchEnvPage: Function;
}

function EnvContentsNotExist(props: Props) {
  const { dispatchEnvPage } = props;
  // const IMG_PATH = './constants/empty.png';
  return (
    <div className={[styles.wrap, 'childUpDownCenter'].join(' ')}>
      <div className={styles.box}>
        {/* <img className="small" src={IMG_PATH} alt="" />
        <br /> */}
        <div>
          <NotInterestedIcon fontSize="large" />
        </div>
        <span>환경을 추가할 수 있습니다.</span>
        <br />
        <span>추가하려면, 아래의 버튼을 클릭해 주세요.</span>
        <br />
        <button
          type="button"
          onClick={() => {
            dispatchEnvPage(CONST.ENV.ADD);
          }}
        >
          추가
        </button>
        <br />
        <span>추가한 환경에 제품을 설치할 수 있습니다.</span>
      </div>
    </div>
  );
}

export default EnvContentsNotExist;
