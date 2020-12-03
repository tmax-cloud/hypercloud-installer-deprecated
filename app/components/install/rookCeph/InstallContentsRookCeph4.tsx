import React from 'react';
import { Button } from '@material-ui/core';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import styles from '../InstallContents4.css';
import * as env from '../../../utils/common/env';
// import FinishImage from '../../../../resources/assets/img_finish_mint.svg';
import FinishImage from '../../../../resources/assets/img_finish_blue.svg';
import routes from '../../../utils/constants/routes.json';
import * as Common from '../../../utils/common/common';

function InstallContentsRookCeph4(props: any) {
  console.debug(InstallContentsRookCeph4.name, props);
  const { history, match, state, option } = props;
  const nowEnv = env.loadEnvByName(match.params.envName);

  const getDiskJSX = disk => {
    const jsx = Object.keys(disk).map(hostName => {
      return (
        <Accordion key={hostName}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>{hostName}</Typography>
          </AccordionSummary>
          <AccordionDetails
            style={{
              display: `block`
            }}
          >
            {disk[hostName].map((d: any) => {
              const { diskName, diskSize } = d;
              return (
                <li key={diskName}>
                  <span>
                    {diskName} /{Common.ChangeByteToGigaByte(diskSize)}
                    GB
                  </span>
                </li>
              );
            })}
          </AccordionDetails>
        </Accordion>
      );
    });
    return jsx;
  };

  return (
    <div className={[styles.wrap, 'childLeftRightCenter'].join(' ')}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '50px' }}>
          <img src={FinishImage} alt="Logo" />
        </div>
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>Version</span>
          </div>
          <div>
            <span className={['medium', 'lightDark'].join(' ')}>
              {state.version}
            </span>
          </div>
        </div>
        <div style={{ marginBottom: '30px' }}>
          <div>
            <span className={['medium', 'thick'].join(' ')}>Disk</span>
          </div>
          <div>
            <span className={['lightDark'].join(' ')}>
              {getDiskJSX(option.disk)}
            </span>
          </div>
        </div>
        <div>
          <Button
            variant="contained"
            className={['secondary'].join(' ')}
            size="large"
            onClick={() => {
              history.push(`${routes.INSTALL.HOME}/${nowEnv.name}/main`);
            }}
          >
            완료
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InstallContentsRookCeph4;
