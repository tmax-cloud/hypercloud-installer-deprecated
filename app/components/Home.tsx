import React from 'react';
// import { Link } from 'react-router-dom';
// import { template } from '@babel/core';
// import routes from '../constants/routes.json';
import Menu from './Menu';
import Content from './Content';

export default function Home() {
  return (
    <div data-tid="container">
      {/* <h2>Home</h2>
      <Link to={routes.COUNTER}>to Counter</Link> */}
      {/* <header>
        <h2>Cities</h2>
      </header> */}

      <Menu />
      <Content />

      {/* <footer>
        <p>Footer</p>
      </footer> */}
    </div>
  );
}
