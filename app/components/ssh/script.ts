// eslint-disable-next-line import/prefer-default-export
export function getDockerInstallScript(): string {
  const MGT_DOCKER_VERSION = '5:19.03.2~3-0~ubuntu-bionic';

  return `#!/bin/bash

if [ $(awk -F= '/^ID=/ { print $2 }' /etc/os-release | tr -d '"') == ubuntu ]; then
  # install docker
  # if ! command -v docker 2>/dev/null; then
    sudo apt-get remove docker docker-engine docker.io containerd runc;
    sudo apt-get update;
    sudo apt-get install -y apt-transport-https;
    sudo apt-get install -y ca-certificates;
    sudo apt-get install -y curl;
    sudo apt-get install -y gnupg-agent;
    sudo apt-get install -y software-properties-common;
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository \\"deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\\"
    sudo apt-get update;
    sudo apt-get install docker-ce;
    sudo apt-get install -y docker-ce-cli;
    sudo apt-get install -y containerd.io;
  # fi
fi
`;
}

export function getK8sToolsInstallScript(): string {
  const KUBERNETES_VERSION = '1.17.3';
  return `sudo apt-get update;
          sudo swapoff -a;
          sudo curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
          echo "deb http://apt.kubernetes.io/ kubernetes-xenial main" \
                  > /etc/apt/sources.list.d/kubernetes.list
          sudo apt update;
          sudo apt install -y kubelet=${KUBERNETES_VERSION}-00;
          sudo apt install -y kubeadm=${KUBERNETES_VERSION}-00;
          sudo apt install -y kubectl=${KUBERNETES_VERSION}-00;
          sudo apt-mark hold kubelet kubeadm kubectl;`;
}

export function getK8sClusterInitScript(): string {
  return `#!/bin/bash

if [ $(awk -F= '/^ID=/ { print $2 }' /etc/os-release | tr -d '"') == ubuntu ]; then
  # install kubernetes
  # if ! command -v kubectl 2>/dev/null || ! command -v kubeadm 2>/dev/null || ! command -v kubelet 2>/dev/null ; then
    ${getK8sToolsInstallScript()}
    kubeadm init;
    mkdir -p $HOME/.kube;
    sudo cp -f /etc/kubernetes/admin.conf $HOME/.kube/config;
    sudo chown $(id -u):$(id -g) $HOME/.kube/config;
  # fi
fi
`;
}

export function getCniInstallScript(): string {
  const path = '/root/cni/CNI/yaml';
  return `kubectl apply -f ${path}/calico_3.9.5.yaml;
          kubectl apply -f ${path}/metallb_subnet.yaml;
          kubectl apply -f ${path}/metallb.yaml;`;
}

export function runScriptAsFile(script: string): string {
  return `touch script.sh;
          echo "${script}" > script.sh;
          chmod 777 script.sh;
          ./script.sh;`;
}

export function getK8sClusterJoinScript(masterIp: string): string {
  return `export joinToken=\`kubeadm token list -o jsonpath='{.token}'\`;
          export joinHash=\`openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'\`
          echo "@@@kubeadm join ${masterIp}:6443 --token $joinToken --discovery-token-ca-cert-hash sha256:$joinHash"`;
}
