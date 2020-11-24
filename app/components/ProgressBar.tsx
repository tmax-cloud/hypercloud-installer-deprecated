import React from 'react';
import {
  LinearProgress,
  LinearProgressProps,
  Box,
  Typography
} from '@material-ui/core';
import { createStyles, withStyles, Theme } from '@material-ui/core/styles';

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

const BorderLinearProgress = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 10,
      borderRadius: 5
    },
    colorPrimary: {
      backgroundColor:
        theme.palette.grey[theme.palette.type === 'light' ? 200 : 700]
    },
    bar: {
      borderRadius: 5,
      backgroundColor: '#EC3854'
      // backgroundColor: '#0992AC'
    }
  })
)(LinearProgressWithLabel);

function ProgressBar(props: any) {
  const { progress } = props;

  return (
    <div>
      <BorderLinearProgress value={progress} />
    </div>
  );
}

export default ProgressBar;
