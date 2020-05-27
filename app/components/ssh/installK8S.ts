export function getK8SInstallScript() {
  const MGT_DOCKER_VERSION = '5:19.03.2~3-0~ubuntu-bionic';
  const MGT_KUBERNETES_VERSION = '1.17.3';
  const KUSTOMIZE_VERSION = 'v3.2.3';
  const cmd =
`#!/bin/bash

if [[ $(awk -F= '/^ID=/ { print $2 }' /etc/os-release | tr -d '"') == ubuntu ]]; then
# install common
  # sudo apt -y install curl git ipcalc
# install go
  # if [ ! -d "/usr/local/go" ]; then
  #   sudo curl -O https://storage.googleapis.com/golang/go1.12.9.linux-amd64.tar.gz
  #   sudo tar -xvf go1.12.9.linux-amd64.tar.gz
  #   sudo rm go1.12.9.linux-amd64.tar.gz
  #   sudo chown -R root:root ./go
  #   sudo mv go /usr/local
  # fi
# install docker
  # if  ! command -v docker 2>/dev/null; then
    sudo apt-get remove docker docker-engine docker.io containerd runc
    sudo apt-get update
    sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository \\"deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\\"
    sudo apt-get update
    sudo apt-get install docker-ce docker-ce-cli containerd.io -y
  # fi
# install kubernetes
  # if  ! command -v kubectl 2>/dev/null || ! command -v kubeadm 2>/dev/null || ! command -v kubelet 2>/dev/null ; then
  #  sudo swapoff -a
  #  sudo curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
  #  echo "deb http://apt.kubernetes.io/ kubernetes-xenial main" \
  #            > /etc/apt/sources.list.d/kubernetes.list
  #  sudo apt update
  #  sudo apt install kubelet=${MGT_KUBERNETES_VERSION}-00 kubeadm=${MGT_KUBERNETES_VERSION}-00 kubectl=${MGT_KUBERNETES_VERSION}-00 -y
  # fi
# install clusterctl
  # if  ! command -v clusterctl 2>/dev/null ; then
  #   sudo curl -L https://github.com/kubernetes-sigs/cluster-api/releases/download/v0.3.2/clusterctl-linux-amd64 -o clusterctl
  #   sudo chmod +x ./clusterctl
  #   sudo mv ./clusterctl /usr/local/bin/clusterctl
  # fi
# install kustomize
  # if  ! command -v kustomize  2>/dev/null ; then
  #   curl -Lo kustomize https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2F"${KUSTOMIZE_VERSION}"/kustomize_kustomize."${KUSTOMIZE_VERSION}"_linux_amd64
  #   chmod +x kustomize
  #   sudo mv kustomize /usr/local/bin/.
  # fi
else
  echo "Not ready"
fi`;
  return cmd;
}
