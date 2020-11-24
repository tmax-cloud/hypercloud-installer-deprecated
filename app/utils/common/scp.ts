import Node from '../class/Node';

export function sendFile(node: Node, srcPath: string, destPath: string) {
  return new Promise(resolve => {
    const client = require('scp2');
    client.scp(
      srcPath,
      {
        port: node.port,
        host: node.ip,
        username: node.user,
        password: node.password,
        path: destPath
      },
      err => {
        console.debug(err);
        resolve();
      }
    );
  });
}

export function test() {}
