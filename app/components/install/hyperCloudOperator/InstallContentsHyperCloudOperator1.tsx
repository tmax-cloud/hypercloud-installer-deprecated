import MuiBox from '@material-ui/core/Box';
import React, { useContext } from 'react';
import { Button } from '@material-ui/core';
import styles from '../InstallContents1.css';
import routes from '../../../utils/constants/routes.json';
import productImage from '../../../../resources/assets/HyperCloud Operator_logo.png';
import * as env from '../../../utils/common/env';
import CONST from '../../../utils/constants/constant';

function InstallContentsHyperCloudOperator1(props: any) {
  console.debug(InstallContentsHyperCloudOperator1.name, props);
  const { history, location, match } = props;

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
              className={["childUpDownCenter", "childLeftRightCenter",styles.circle].join(' ')}
              borderRadius="50%"
              {...defaultProps}
            >
              <div className={[styles.insideCircle].join(' ')}>
                <div>
                  <img src={productImage} alt="Logo" />
                </div>
                <div>
                  <span className={['large', 'thick'].join(' ')}>
                    {CONST.PRODUCT.HYPERCLOUD_OPERATOR.NAME}
                  </span>
                </div>
                <div>
                  <span className={['small', 'lightDark'].join(' ')}>
                    {CONST.PRODUCT.HYPERCLOUD_OPERATOR.DESC}
                  </span>
                </div>
              </div>
            </MuiBox>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>{CONST.PRODUCT.HYPERCLOUD_OPERATOR.NAME} 를 설치할 수 있습니다.</span>
            <br />
            <span className={['medium', 'lightDark'].join(' ')}>계속하시려면, 아래의 버튼을 클릭해 주세요.</span>
          </div>
          <div>
            <Button
              variant="contained"
              className={['blue'].join(' ')}
              size="large"
              onClick={() => {
                // dispatchKubeInstall({
                //   page: 2
                // });
                history.push(
                  `${routes.INSTALL.HOME}/${nowEnv.name}/${CONST.PRODUCT.HYPERCLOUD_OPERATOR.NAME}/step2`
                );
              }}
            >
              다음 >
            </Button>
          </div>
        </div>
        {/* <button
          type="button"
          onClick={() => {
            abc();
          }}
        >
          test
        </button>
        <span>{cnt}</span>
        <textarea value={stdout} disabled />
        <textarea value={stderr} disabled />
        <LinearProgressWithLabel value={progress} /> */}
      </div>
    </div>
  );
}

export default InstallContentsHyperCloudOperator1;
