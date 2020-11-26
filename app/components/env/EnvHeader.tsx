import React from 'react';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import styles from './EnvHeader.css';
import routes from '../../utils/constants/routes.json';

function EnvHeader(props: any) {
  console.debug(EnvHeader.name, props);

  const { history, location } = props;

  let title = '';
  if (
    location.pathname === routes.ENV.EXIST ||
    location.pathname === routes.ENV.NOT_EXIST
  ) {
    title = '환경 관리';
  } else if (location.pathname === routes.ENV.ADD) {
    title = '환경 추가';
  } else if (location.pathname === routes.ENV.EDIT) {
    title = '환경 수정';
  }

  const getButton = () => {
    if (
      location.pathname === routes.ENV.EXIST ||
      location.pathname === routes.ENV.NOT_EXIST
    ) {
      return (
        <Button
          className={['primary'].join(' ')}
          variant="contained"
          startIcon={<AddIcon />}
          size="small"
          onClick={() => {
            history.push(routes.ENV.ADD);
          }}
        >
          추가
        </Button>
      );
    }
    return null;
  };

  return (
    <div className={[styles.wrap, 'childUpDownCenter'].join(' ')}>
      <span className={[styles.title, 'large'].join(' ')}>{title}</span>
      {getButton()}
    </div>
  );
}

export default EnvHeader;
