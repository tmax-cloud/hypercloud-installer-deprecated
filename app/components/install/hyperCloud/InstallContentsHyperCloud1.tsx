import MuiBox from '@material-ui/core/Box';
import React from 'react';
import { Button } from '@material-ui/core';
import styles from '../InstallContents1.css';
import routes from '../../../utils/constants/routes.json';
import productImage from '../../../../resources/assets/HyperCloud_logo.png';
import * as env from '../../../utils/common/env';
import CONST from '../../../utils/constants/constant';

function InstallContentsHyperCloud1(props: any) {
  console.debug(InstallContentsHyperCloud1.name, props);
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
                    {CONST.PRODUCT.HYPERCLOUD.NAME}
                  </span>
                </div>
                <div>
                  <span className={['small', 'lightDark'].join(' ')}>
                    {CONST.PRODUCT.HYPERCLOUD.DESC}
                  </span>
                </div>
              </div>
            </MuiBox>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>
              {CONST.PRODUCT.HYPERCLOUD.NAME} 를 설치할 수 있습니다.
            </span>
            <br />
            <span className={['medium', 'lightDark'].join(' ')}>
              계속하시려면, 아래의 버튼을 클릭해 주세요.
            </span>
          </div>
          <div>
            <Button
              variant="contained"
              className={['primary'].join(' ')}
              size="large"
              onClick={() => {
                // dispatchKubeInstall({
                //   page: 2
                // });
                history.push(
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.HYPERCLOUD.NAME}/step2`
                );
              }}
            >
              다음 >
            </Button>
          </div>
          <div>
            <ul className={['small', 'indicator'].join(' ')}>
              <li>
                정상적인 설치를 위해선, HyperAuth가 설치 되어있어야 합니다.
              </li>
              <li>
                또한, HyperAuth의 POD들의 Status가 Running이어야 하고, 모두
                Ready 상태이어야 합니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstallContentsHyperCloud1;
