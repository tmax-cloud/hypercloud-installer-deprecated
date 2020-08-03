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
  console.debug('InstallKubePlease');

  return (
    <div>
      쿠버네티스를 먼저 설치해주세요.
    </div>
  );
}

export default InstallKubePlease;
