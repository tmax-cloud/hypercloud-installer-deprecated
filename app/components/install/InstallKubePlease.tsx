/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';
import { Grid, Paper, Tooltip } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import CONST from '../../utils/constants/constant';
import { AppContext } from '../../containers/HomePage';
import routes from '../../utils/constants/routes.json';
import * as env from '../../utils/common/env';
import * as product from '../../utils/common/product';
import CloudImage from '../../../resources/assets/ic_logo_hypercloud.svg';
import InstalledImage from '../../../resources/assets/ic_finish.svg';

function InstallKubePlease(props: any) {
  console.debug(InstallKubePlease.name, props);

  return (
    <div style={{
      height: '100%'
    }} className={['childLeftRightCenter', 'childUpDownCenter' ,'large', 'lightDark'].join(' ')}>
      <br />
      <span>{CONST.PRODUCT.KUBERNETES.NAME} 를 먼저 설치해 주세요.</span>
    </div>
  );
}

export default InstallKubePlease;
