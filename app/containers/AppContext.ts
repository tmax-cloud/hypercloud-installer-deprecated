import React from 'react';

export const AppContext = React.createContext({});

export const initialState = {
  loading: false
};
export const reducer = (state: any, action: any) => {
  if (action.type === 'set_loading') {
    return { ...state, ...action };
  }
  return state;
};
