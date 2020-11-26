import MuiBox from '@material-ui/core/Box';
import React from 'react';
import { Button } from '@material-ui/core';
import styles from '../InstallContents1.css';
import routes from '../../../utils/constants/routes.json';
import productImage from '../../../../resources/assets/Rook ceph_logo.png';
import * as env from '../../../utils/common/env';
import CONST from '../../../utils/constants/constant';

function InstallContentsRookCeph1(props: any) {
  console.debug(InstallContentsRookCeph1.name, props);
  const { history, match } = props;

  const nowEnv = env.loadEnvByName(match.params.envName);

  const defaultProps = {
    bgcolor: 'background.paper',
    borderColor: 'text.primary',
    m: 1,
    border: 1,
    style: { width: '20rem', height: '20rem' }
  };

  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      <div>
        <div className={styles.contents}>
          <div className="childLeftRightCenter">
            <MuiBox
              className={[
                'childUpDownCenter',
                'childLeftRightCenter',
                styles.circle
              ].join(' ')}
              borderRadius="50%"
              {...defaultProps}
            >
              <div className={[styles.insideCircle].join(' ')}>
                <div>
                  <img src={productImage} alt="Logo" />
                </div>
                <div>
                  <span className={['large', 'thick'].join(' ')}>
                    {CONST.PRODUCT.ROOK_CEPH.NAME}
                  </span>
                </div>
                <div>
                  <span className={['small', 'lightDark'].join(' ')}>
                    {CONST.PRODUCT.ROOK_CEPH.DESC}
                  </span>
                </div>
              </div>
            </MuiBox>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>{CONST.PRODUCT.ROOK_CEPH.NAME} 를 설치할 수 있습니다.</span>
            <br />
            <span className={['medium', 'lightDark'].join(' ')}>계속하시려면, 아래의 버튼을 클릭해 주세요.</span>
          </div>
          <div>
            <Button
              variant="contained"
              className={['primary'].join(' ')}
              size="large"
              onClick={() => {
                history.push(
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.ROOK_CEPH.NAME}/step2`
                );
              }}
            >
              다음 >
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstallContentsRookCeph1;
