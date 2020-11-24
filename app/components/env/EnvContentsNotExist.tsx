import React from 'react';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';
import EmptyImage from '../../../resources/assets/img_empty.svg';
import styles from './EnvContentsNotExist.css';
import routes from '../../utils/constants/routes.json';

function EnvContentsNotExist(props: any) {
  console.debug(EnvContentsNotExist.name, props);

  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      <div className={[styles.box, 'childUpDownCenter'].join(' ')}>
        <div>
          <div>
            <img src={EmptyImage} alt="Logo" />
          </div>
          <div className={[styles.mainTextBox, 'dark', 'medium'].join(' ')}>
            <span>
              환경을 추가할 수 있습니다.
              <br />
              추가하려면, 아래의 버튼을 클릭해 주세요.
            </span>
          </div>
          <div>
            <Link to={routes.ENV.ADD}>
              <Button
                variant="contained"
                className={['primary'].join(' ')}
                startIcon={<AddIcon />}
                size="large"
              >
                환경 추가
              </Button>
            </Link>
          </div>
          <div className={[styles.subTextBox, 'lightDark', 'small'].join(' ')}>
            <span>추가한 환경에 제품을 설치할 수 있습니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnvContentsNotExist;
