import React from 'react';
import styles from './Menu.css';

type Props = {
  onClick: Function;
};

export default function Menu(props: Props) {
  return (
    <div className={styles.menu}>
      <div className={[styles.wrap, styles.scroll].join(' ')}>
        <ul>
          <li>
            <a
              href="#"
              onClick={function() {
                props.onClick('k8s');
              }}
            >
              K8S Install
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={function() {
                props.onClick('test');
              }}
            >
              Test Install
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
