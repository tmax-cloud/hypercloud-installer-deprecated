/* eslint-disable no-console */
/* eslint-disable global-require */

export function pullImage(repoPath: string, localPath: string) {
  const Docker = require('dockerode');
  const docker = new Docker();
  docker.pull('k8s.gcr.io/kube-proxy:v1.17.6', function (err, stream) {
    console.debug(err);
    console.debug(stream);
  });
}

export function test() {}
