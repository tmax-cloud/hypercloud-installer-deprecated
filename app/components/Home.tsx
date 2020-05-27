import React from 'react';
// import { Link } from 'react-router-dom';
// import { template } from '@babel/core';
// import routes from '../constants/routes.json';
import styles from './Home.css';
import Menu from './Menu';
import Content from './Content';

export default function Home() {
  const [menu, setMenu] = React.useState('k8s');
  return (
    <div className={styles.container} data-tid="container">
      {/* <h2>Home</h2>
      <Link to={routes.COUNTER}>to Counter</Link> */}
      {/* <header>
        <h2>Cities</h2>
      </header> */}

      <Menu onClick={setMenu} />
      <Content menu={menu} />

      {/* <footer>
        <p>Footer</p>
      </footer> */}
    </div>
  );
}
