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
  return new Promise((resolve, reject) => {
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
        // FIXME: 왜 resolve로 되어 있지?
        // error면 reject 아닌가?
        // 추후 문제 발생하면 reject로 변경해햐 할 듯..?
        resolve();
      }
    );
  });
}

export function test() {}
