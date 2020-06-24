import { bindActionCreators, Dispatch } from 'redux';
import { counterStateType } from '../reducers/types';

export const NEXT = 'NEXT';
export const PREV = 'PREV';
export const INIT = 'INIT';

export function next() {
  return (dispatch: Dispatch) => {
    dispatch({
      type: NEXT
    });
  };
}

export function prev() {
  return (dispatch: Dispatch) => {
    dispatch({
      type: PREV
    });
  };
}

export function mapStateToProps(state: counterStateType) {
  return {
    pager: state.pager
  };
}

export function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      next,
      prev
    },
    dispatch
  );
}
