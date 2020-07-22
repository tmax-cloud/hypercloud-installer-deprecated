import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import { Titlebar, Color } from 'custom-electron-titlebar';

const store = configureStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  new Titlebar({
    // backgroundColor: Color.fromHex('#363A41'),
    // backgroundColor: Color.fromHex('#fff'),
    icon: '../resources/assets/logo_installer.svg',
    menu: null
  });
  render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  );
});
