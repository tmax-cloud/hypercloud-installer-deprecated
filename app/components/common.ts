export function send(ssh: object, cmd: string, cb: Function) {
  const { Client } = require('ssh2');
  const conn = new Client();
  let log = '';
  conn
    .on('ready', function() {
      console.log('Client :: ready');
      conn.exec(cmd, function(err, stream) {
        if (err) throw err;
        stream
          .on('close', function(code, signal) {
            // console.log(`Stream :: close :: code: ${code}, signal: ${signal}`);
            conn.end();
          })
          .on('data', cb)
          .stderr.on('data', function(data) {
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
