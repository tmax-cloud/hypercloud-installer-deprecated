import React from 'react';

export default function K8sInstall() {
  const [ip, setIp] = React.useState('');
  const [port, setPort] = React.useState('');
  const [user, setUser] = React.useState('');
  const [password, setPassword] = React.useState('');
  function send(){
    console.log(ip);
    console.log(port);
    console.log(user);
    console.log(password);
    return

    var Client = require('ssh2').Client;
    var conn = new Client();
    conn.on('ready', function() {
      console.log('Client :: ready');
      conn.exec('hostname', function(err, stream) {
        if (err) throw err;
        stream.on('close', function(code, signal) {
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
        }).on('data', function(data) {
          console.log('STDOUT: ' + data);
        }).stderr.on('data', function(data) {
          console.log('STDERR: ' + data);
        });
      });
    }).connect({
      host: ip,
      port: port,
      username: user,
      password: password
      // privateKey: require('fs').readFileSync('/here/is/my/key')
    });
  }
  return (
    <div>
      <form>
        <label htmlFor="ip">IP:</label>
        <input type="text" id="ip" name="ip" value={ip} onChange={function(e){
          setIp(e.target.value)
        }}></input>
        <br></br><br></br>

        <label htmlFor="port">Port:</label>
        <input type="text" id="port" name="port" value={port} onChange={function(e){
          setPort(e.target.value)
        }}></input>
        <br></br><br></br>

        <label htmlFor="user">User:</label>
        <input type="text" id="user" name="user" value={user} onChange={function(e){
          setUser(e.target.value)
        }}></input>
        <br></br><br></br>

        <label htmlFor="password">Password:</label>
        <input type="text" id="password" name="password" value={password} onChange={function(e){
          setPassword(e.target.value)
        }}></input>
        <br></br><br></br>

        <input type="button" value="Submit" onClick={send}></input>
      </form>
    </div>
  );
}
