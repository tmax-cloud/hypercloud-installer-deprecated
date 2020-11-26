import React from 'react';
import CONST from '../../utils/constants/constant';

function InstallKubePlease(props: any) {
  console.debug(InstallKubePlease.name, props);

  return (
    <div
      style={{
        height: '100%'
      }}
      className={[
        'childLeftRightCenter',
        'childUpDownCenter',
        'large',
        'lightDark'
      ].join(' ')}
    >
      <br />
      <span>{CONST.PRODUCT.KUBERNETES.NAME} 를 먼저 설치해 주세요.</span>
    </div>
  );
}

export default InstallKubePlease;
