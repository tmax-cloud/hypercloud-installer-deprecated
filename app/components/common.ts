interface SshInfo {
  ip: string;
  port: string;
  user: string;
  password: string;
}

interface SendCb {
  close: Function;
  stdout: Function;
  stderr: Function;
}

export function send(ssh: SshInfo, cmd: string, cb: SendCb) {
  const { Client } = require('ssh2');
  const conn = new Client();
  conn
    .on('ready', function() {
      console.log('Client :: ready');
      conn.exec(cmd, function(err, stream) {
        if (err) throw err;
        stream
          .on('close', function(code, signal) {
            cb.close();
            console.log(`Stream :: close :: code: ${code}, signal: ${signal}`);
            conn.end();
          })
          .on('data', function(data) {
            cb.stdout(data);
            // console.log(`STDOUT: ${data}`);
          })
          .stderr.on('data', function(data) {
            cb.stderr(data);
            console.error(`STDERR: ${data}`);
          });
      });
    })
    .connect({
      host: ssh.ip,
      port: ssh.port,
      username: ssh.user,
      password: ssh.password
      // privateKey: require('fs').readFileSync('/here/is/my/key')
    });
}

export function connectionTest(
  ip: string,
  port: number,
  user: string,
  password: string
) {
  const ssh2 = require('ssh2');
  const connection = new ssh2();
  connection.on('error', function(err) {
    // Handle the connection error
    console.log('error', err);
    connection.end();
  });
  connection.on('ready', function() {
    // Work with the connection
    console.log('ready');
    connection.end();
  });
  const test = connection.connect({
    host: ip,
    port,
    username: user,
    password
  });

  return test;

  // return new Promise(function (resolve, reject){
  //   connection.connect({
  //     host: ip,
  //     port,
  //     username: user,
  //     password
  //   });
  //   connection.on('error', function(err) {
  //     // Handle the connection error
  //     console.log('error', err);
  //     connection.end();
  //   });
  //   connection.on('ready', function() {
  //     // Work with the connection
  //     console.log('ready');
  //     connection.end();
  //   });
  // });
}
