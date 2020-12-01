import React from 'react';

// app 전체에서 사용 될, context
export const AppContext = React.createContext({});

export const initialState = {
  loading: false,
  installing: ''
};
export const reducer = (state: any, action: any) => {
  if (action.type === 'set_loading') {
    return { ...state, ...action };
  }
  if (action.type === 'set_installing') {
    return { ...state, ...action };
  }
  return state;
};
