import { Action } from 'redux';
import { NEXT, PREV, INIT } from '../actions/pager';

export default function pager(state = 1, action: Action<string>) {
  switch (action.type) {
    case NEXT:
      return state + 1;
    case PREV:
      return state - 1;
    case INIT:
      return 0;
    default:
      return state;
  }
}
