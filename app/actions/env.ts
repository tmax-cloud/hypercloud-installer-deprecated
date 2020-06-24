import { bindActionCreators, Dispatch } from 'redux';
import { counterStateType } from '../reducers/types';

export const SET = 'SET';

export function setEnv(env: object) {
  return (dispatch: Dispatch) => {
    dispatch({
      type: SET,
      env
    });
  };
}

export function mapStateToProps(state: counterStateType) {
  return {
    env: state.env
  };
}

export function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      setEnv
    },
    dispatch
  );
}
