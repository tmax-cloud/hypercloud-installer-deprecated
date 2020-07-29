/* eslint-disable new-cap */
/* eslint-disable global-require */
/* eslint-disable no-console */
import Node from '../class/Node';

interface SendCb {
  close: Function;
  stdout: Function;
  stderr: Function;
}

export function send(node: Node, cb: SendCb) {
  const { Client } = require('ssh2');
  const conn = new Client();

  return new Promise((resolve, reject) => {
    conn
      .on('ready', () => {
        console.log('Client :: ready');
        conn.exec(node.cmd, (err, stream) => {
          if (err) throw err;
          stream
            .on('close', (code, signal) => {
              cb.close();
              console.log(
                `Stream :: close :: code: ${code}, signal: ${signal}`
              );
              conn.end();
              resolve();
            })
            .on('data', data => {
              cb.stdout(data);
              // console.log(`STDOUT: ${data}`);
            })
            .stderr.on('data', data => {
              cb.stderr(data);
              console.error(`STDERR: ${data}`);
              reject();
            });
        });
      })
      .connect({
        host: node.ip,
        port: node.port,
        username: node.user,
        password: node.password
        // privateKey: require('fs').readFileSync('/here/is/my/key')
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
      password: node.password
    });
    connection.on('ready', () => {
      // Work with the connection
      console.log('ready');
      connection.end();
      resolve();
    });
    connection.on('error', (err: any) => {
      // Handle the connection error
      console.log('error', err);
      connection.end();
      reject(err);
    });
  });
}
