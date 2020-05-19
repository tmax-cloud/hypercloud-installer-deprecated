import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';
import K8sInstall from './K8sInstall';
import TestInstall from './TestInstall'
import { template } from '@babel/core';

export default function Home() {
  const [menu, setMenu] = React.useState('k8s');
  function getContents(){
    if(menu==='k8s'){
      return <K8sInstall></K8sInstall>;
    }
    else if (menu==='test'){
      return <TestInstall></TestInstall>;
    }
  }
  return (
    <div className={styles.container} data-tid="container">
      {/* <h2>Home</h2>
      <Link to={routes.COUNTER}>to Counter</Link> */}
      {/* <header>
        <h2>Cities</h2>
      </header> */}
      <section>
        <nav>
          <ul>
            <li><a href="#" onClick={function(){
                setMenu('k8s')
            }}>K8S Install</a></li>
            <li><a href="#" onClick={function(){
                setMenu('test')
            }}>Test Install</a></li>
          </ul>
        </nav>
        <article>
          {getContents()}
        </article>
      </section>
      {/* <footer>
        <p>Footer</p>
      </footer> */}
    </div>
  );
}
