import Node from '../class/Node';

/**
 * @description scp를 통해 파일 전송하는 함수
 *
 * @param node 목적지 Node 객체
 * @param srcPath 로컬 path (전송 하려는 파일)
 * @param destPath 목적지의 path
 *
 * @return
 */
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
