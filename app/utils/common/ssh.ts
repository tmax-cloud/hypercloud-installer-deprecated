/* eslint-disable new-cap */
/* eslint-disable global-require */
/* eslint-disable no-console */
import Node from '../class/Node';

interface SendCb {
  close: Function;
  stdout: Function;
  stderr: Function;
}

export function send(node: any, cb: SendCb) {
  const { Client } = require('ssh2');
  const conn = new Client();

  return new Promise((resolve, reject) => {
    conn
      .on('ready', () => {
        console.debug('Client :: ready');
        conn.exec(node.cmd, (err, stream) => {
          if (err) throw err;
          stream
            .on('close', (code, signal) => {
              cb.close();
              console.debug(
                `Stream :: close :: code: ${code}, signal: ${signal}`
              );
              conn.end();
              resolve();
            })
            .on('data', data => {
              cb.stdout(data);
              console.debug(`STDOUT: ${data}`);
            })
            .stderr.on('data', data => {
              cb.stderr(data);
              console.error(`STDERR: ${data}`);
            });
        });
      })
      .connect({
        host: node.ip,
        port: node.port,
        username: node.user,
        password: node.password
      });
  });
}

export function connectionTest(node: Node) {
  const ssh2 = require('ssh2');
  const connection = new ssh2();

  return new Promise((resolve, reject) => {
    connection.connect({
      host: node.ip,
      port: node.port,
      username: node.user,
      password: node.password,
      readyTimeout: 5000
    });
    connection.on('ready', () => {
      // Work with the connection
      console.debug('ready');
      connection.end();
      resolve();
    });
    connection.on('error', (err: any) => {
      // Handle the connection error
      console.debug('error', err);
      connection.end();
      reject(err);
    });
  });
}
