import React from 'react';
import { Paper, MenuList, MenuItem } from '@material-ui/core';
import styles from './InstallLnb.css';

function InstallLnb() {
  return (
    <div className={[styles.wrap, 'left'].join(' ')}>
      {/* <span>Install LNB</span> */}
      <Paper>
        <div>제품 목록</div>
        <div>
          필수 제품
          <MenuList>
            <MenuItem>쿠버네티스</MenuItem>
          </MenuList>
        </div>

        <div>
          호환 제품
          <MenuList>
            <MenuItem>호환 제품 1</MenuItem>
            <MenuItem>호환 제품 2</MenuItem>
          </MenuList>
        </div>
      </Paper>
    </div>
  );
}

export default InstallLnb;
