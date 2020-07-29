// eslint-disable-next-line import/prefer-default-export
export function getK8sMasterRemoveScript(): string {
  return `yum install -y git;
git clone https://github.com/tmax-cloud/hypercloud-install-guide.git;
cd hypercloud-install-guide/K8S_Master/installer;
chmod 755 k8s_infra_installer.sh;
./k8s_infra_installer.sh delete;
./k8s_infra_installer.sh delete;
yum remove -y kubeadm;
yum remove -y kubelet;
yum remove -y kubectl;
yum remove -y cri-o;`;
}

export function getK8sMasterInstallScript(master, index): string {
  const KUBERNETES_VERSION = `1.17.6`;
  const setHostName = `sudo hostnamectl set-hostname master-${index};`;
  const registHostName = `echo ${master.ip} master-${index} >> /etc/hosts`;
  const crioVersion = `1.17`;
//   const addCrioRepo = `curl -L -o /etc/yum.repos.d/devel:kubic:libcontainers:stable.repo \
// https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable/CentOS_7/devel:kubic:libcontainers:stable.repo
// curl -L -o /etc/yum.repos.d/devel:kubic:libcontainers:stable:cri-o:${crioVersion}.repo \
// https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable:cri-o:${crioVersion}/CentOS_7/devel:kubic:libcontainers:stable:cri-o:${crioVersion}.repo`;

  // TODO:
  // 공식 홈페이지에 나와 있는
  // exclude=kubelet kubeadm kubectl
  // 부분 뺌
  // yum update 명령 시, version update에서 제외 시키는 부분
//   const addKubeRepo = `cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
// [kubernetes]
// name=Kubernetes
// baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-\$basearch
// enabled=1
// gpgcheck=1
// repo_gpgcheck=1
// gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
// EOF`;
  // TODO:
  // imageRepository 주석 처리
  // 현재 스크립트에서 crio에 imageRegistry 등록해주는 부분 제거 해주어야 함
  return `${setHostName}
${registHostName}
yum install -y git
git clone https://github.com/tmax-cloud/hypercloud-install-guide.git;
cd hypercloud-install-guide/K8S_Master/installer;
chmod 755 k8s_infra_installer.sh;
. k8s.config;
sudo sed -i "s|$crioVersion|${crioVersion}|g" ./k8s.config;
sudo sed -i "s|$apiServer|${master.ip}|g" ./k8s.config;
sudo sed -i "s|imageRepository|#imageRepository|g" ./yaml/kubeadm-config.yaml;
./k8s_infra_installer.sh up;`;
}

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
  const KUBERNETES_VERSION = '1.17.6';
  return `sudo apt-get update;
          sudo swapoff -a;
          sudo curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
          echo "deb http://apt.kubernetes.io/ kubernetes-xenial main" \
                  > /etc/apt/sources.list.d/kubernetes.list
          sudo apt update;
          sudo apt install -y kubelet=${KUBERNETES_VERSION}-00;
          sudo apt install -y kubeadm=${KUBERNETES_VERSION}-00;
          sudo apt install -y kubectl=${KUBERNETES_VERSION}-00;`;
  // sudo apt-mark hold kubelet kubeadm kubectl;`
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
