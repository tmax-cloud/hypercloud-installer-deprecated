/* eslint-disable no-console */
/* eslint-disable import/no-cycle */
/* eslint-disable global-require */
import Node from '../class/Node';

interface SendCb {
  close: Function;
  stdout: Function;
  stderr: Function;
}

/**
 * @description ssh로 command 전송하여 실행시켜 주는 함수
 *
 * @param node target Node 객체
 * @param cb callback함수 모아놓은 객체
 *
 * @return command 실행 후 정상 종료 시 promise resolve(), 에러 발생 시 promise reject()
 */

// SSH 연결 타임아웃 (ms)
const CONNECTION_TIMER = 10000;
// command 실행 타임아웃 (ms)
const COMMAND_EXE_TIMER = 600000;

export function send(node: any, cb?: SendCb) {
  const { Client } = require('ssh2');
  const conn = new Client();

  function setTime(reject: any) {
    // 명령 실행 후, on, stderr.on 으로
    // 타임아웃 설정
    return setTimeout(() => {
      reject(new Error('command time out!'));
    }, COMMAND_EXE_TIMER);
  }

  return new Promise((resolve, reject) => {
    conn
      .on('ready', () => {
        // 연결 된 상태
        console.debug('Client :: ready');
        console.debug('node', node);
        // command 실행
        conn.exec(node.cmd, (err: any, stream: any) => {
          let timerID: any;

          console.log(node.cmd);
          if (err) throw err;
          stream
            .on('close', (code: any, signal: any) => {
              clearTimeout(timerID);
              cb?.close();
              console.debug(
                `Stream :: close :: code: ${code}, signal: ${signal}`
              );
              conn.end();
              resolve();
            })
            .on('data', (data: any) => {
              // 응답이 오면 타이머 해제 한 뒤, 다시 설정
              // 마지막 응답 기준으로 타이머 적용하기 위함
              clearTimeout(timerID);
              timerID = setTime(reject);
              cb?.stdout(data);
              console.debug(`STDOUT: ${data}`);
            })
            .stderr.on('data', (data: any) => {
              // 응답이 오면 타이머 해제 한 뒤, 다시 설정
              // 마지막 응답 기준으로 타이머 적용하기 위함
              clearTimeout(timerID);
              timerID = setTime(reject);
              cb?.stderr(data);
              console.error(`STDERR: ${data}`);
            });
        });
      })
      .on('error', (err: Error) => {
        cb?.stderr(err);
        reject(err);
      })
      .connect({
        // connection 정보들
        host: node.ip,
        port: node.port,
        username: node.user,
        password: node.password,
        // connection timeout 설정
        readyTimeout: CONNECTION_TIMER
      });
  });
}

/**
 * @description ssh connection 테스트 함수
 *
 * @param node 체크 하려는 Node객체
 *
 * @return 성공 시 promise resole(), 실패 시 promise reject();
 */
export function connectionTest(node: Node) {
  const ssh2 = require('ssh2');
  const connection = new ssh2();

  console.debug('target node for connection test', node);
  return new Promise((resolve, reject) => {
    connection.connect({
      host: node.ip,
      port: node.port,
      username: node.user,
      password: node.password,
      // connection timeout 설정
      readyTimeout: CONNECTION_TIMER
    });
    connection.on('ready', () => {
      // Work with the connection
      console.debug('ready');
      connection.end();
      resolve();
    });
    connection.on('error', (err: any) => {
      // Handle the connection error
      // console.debug('error', err);
      connection.end();
      reject(err);
    });
  });
}
