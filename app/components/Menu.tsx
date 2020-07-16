import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Menu.css';
import routes from '../../utils/constants/routes.json';

export default function Menu() {
  return (
    <div className={styles.wrap}>
      <ul>
        <li>
          <Link to={routes.K8S_INSTALL_ENV}>K8S Install</Link>
        </li>
      </ul>
    </div>
  );
}
