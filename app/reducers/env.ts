import { SET } from '../actions/env';

export default function env(
  state = {
    k8s: '',
    dockerRegistry: ''
  },
  action: any
) {
  switch (action.type) {
    case SET:
      if (action.env.k8s) {
        return { ...state, k8s: action.env.k8s };
      }
      if (action.env.dockerRegistry) {
        return { ...state, dockerRegistry: action.env.dockerRegistry };
      }
      break;
    default:
      return state;
  }
}
