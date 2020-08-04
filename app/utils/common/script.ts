// eslint-disable-next-line import/prefer-default-export
import * as env from './env';
import CONST from '../constants/constant';

function cloneGitScript(address: string) {
  return `
cd ~;
yum install -y git;
git clone ${address};
  `;
}

function deleteDockerScript() {
  return `
sudo yum remove -y docker \
docker-client \
docker-client-latest \
docker-common \
docker-latest \
docker-latest-logrotate \
docker-logrotate \
docker-engine;
  `;
}

export function getCniRemoveScript(nowEnv) {
  const { version } = env.isInstalled(CONST.PRODUCT.CNI.NAME, nowEnv);
  return `
${cloneGitScript('https://github.com/tmax-cloud/hypercloud-install-guide.git')}
cd ~/hypercloud-install-guide/CNI;
kubectl delete -f calico_${version}.yaml;
kubectl delete -f calicoctl_3.15.0.yaml;
  `;
}

export function getCniInstallScript(
  type: string,
  version: string,
  nowEnv
): string {
  let setRegistry = '';
  const { registry } = env.isInstalled(CONST.PRODUCT.KUBERNETES.NAME, nowEnv);
  if (registry) {
    setRegistry = `
    sed -i 's/calico\\/cni/'${registry}'\\/calico\\/cni/g' calico_${version}.yaml;
    sed -i 's/calico\\/pod2daemon-flexvol/'${registry}'\\/calico\\/pod2daemon-flexvol/g' calico_${version}.yaml;
    sed -i 's/calico\\/node/'${registry}'\\/calico\\/node/g' calico_${version}.yaml;
    sed -i 's/calico\\/kube-controllers/'${registry}'\\/calico\\/kube-controllers/g' calico_${version}.yaml;
    sed -i 's/calico\\/ctl/'${registry}'\\/calico\\/ctl/g' calico_${version}.yaml;
    `;
  }
  return `
${cloneGitScript('https://github.com/tmax-cloud/hypercloud-install-guide.git')}
cd ~/hypercloud-install-guide/CNI;
sed -i 's/v3.13.4/'v${version}'/g' calico_${version}.yaml;
. ~/hypercloud-install-guide/K8S_Master/installer/k8s.config;
sed -i 's|10.0.0.0/16|'$podSubnet'|g' calico_${version}.yaml;
${setRegistry}
kubectl apply -f calico_${version}.yaml;
kubectl apply -f calicoctl_3.15.0.yaml;
`;
}

export function getK8sMasterRemoveScript(): string {
  const deleteHostName = `sudo sed -i /\`hostname\`/d /etc/hosts`;
  return `
${deleteHostName}
${cloneGitScript('https://github.com/tmax-cloud/hypercloud-install-guide.git')}
cd ~/hypercloud-install-guide/K8S_Master/installer;
chmod 755 k8s_infra_installer.sh;
./k8s_infra_installer.sh delete;
./k8s_infra_installer.sh delete;
yum remove -y kubeadm;
yum remove -y kubelet;
yum remove -y kubectl;
yum remove -y cri-o;
${deleteDockerScript()}
rm -rf ~/hypercloud-install-guide/;
yum install -y ipvsadm
ipvsadm --clear`;
}

export function getImageRegistrySettingScript(registry: string): string {
  return `
${cloneGitScript('https://github.com/tmax-cloud/hypercloud-install-guide.git')}
cd ~hypercloud-install-guide/Image_Registry/installer
${deleteDockerScript()}
sudo yum install -y yum-utils;
sudo yum-config-manager \
--add-repo \
https://download.docker.com/linux/centos/docker-ce.repo;
sudo yum install -y docker-ce docker-ce-cli containerd.io;
sudo systemctl start docker;
sudo touch /etc/docker/daemon.json;
echo { "insecure-registries": ["${registry}"] } > /etc/docker/daemon.json;
sudo systemctl restart docker;
sudo systemctl status docker;
sudo ./run-registry.sh ~/hypercloud-install-guide/Image_Registry/installer ${registry};
`;
}

export function getK8sMainMasterInstallScript(
  mainMaster: any,
  registry: string,
  version: string
): string {
  let IMAGE_REGISTRY = '';
  if (registry) {
    IMAGE_REGISTRY = registry;
  }
  const CRIO_VERSION = `1.17`;
  const KUBERNETES_VERSION = version;
  const API_SERVER = mainMaster.ip;

  const setHostName = `sudo hostnamectl set-hostname ${mainMaster.hostName};`;
  const registHostName = `echo \`hostname -I\` \`hostname\` >> /etc/hosts`;

  return `${setHostName}
${registHostName}
${cloneGitScript('https://github.com/tmax-cloud/hypercloud-install-guide.git')}
cd ~/hypercloud-install-guide/K8S_Master/installer;
. k8s.config;
sudo sed -i "s|$imageRegistry|${IMAGE_REGISTRY}|g" ./k8s.config;
sudo sed -i "s|$crioVersion|${CRIO_VERSION}|g" ./k8s.config;
sudo sed -i "s|$k8sVersion|${KUBERNETES_VERSION}|g" ./k8s.config;
sudo sed -i "s|$apiServer|${API_SERVER}|g" ./k8s.config;
git clone https://github.com/tmax-cloud/hypercloud-installer.git;
mv -f hypercloud-installer/app/k8s_infra_installer.sh .;
chmod 755 k8s_infra_installer.sh;
./k8s_infra_installer.sh up mainMaster;`;
}

export function getK8sMasterInstallScript(
  mainMaster: any,
  master: any
): string {

  const setHostName = `sudo hostnamectl set-hostname ${master.hostName};`;
  const registHostName = `echo \`hostname -I\` \`hostname\` >> /etc/hosts`;

  return `${setHostName}
${registHostName}
${cloneGitScript('https://github.com/tmax-cloud/hypercloud-install-guide.git')}
cd ~/hypercloud-install-guide/K8S_Master/installer;
. k8s.config;
git clone https://github.com/tmax-cloud/hypercloud-installer.git;
mv -f hypercloud-installer/app/k8s_infra_installer.sh .;
chmod 755 k8s_infra_installer.sh;
./k8s_infra_installer.sh up master;`;
}

export function getK8sWorkerInstallScript(
  mainMaster: any,
  worker: any
): string {

  const setHostName = `sudo hostnamectl set-hostname ${worker.hostName};`;
  const registHostName = `echo \`hostname -I\` \`hostname\` >> /etc/hosts`;

  return `${setHostName}
${registHostName}
${cloneGitScript('https://github.com/tmax-cloud/hypercloud-install-guide.git')}
cd ~/hypercloud-install-guide/K8S_Master/installer;
. k8s.config;
git clone https://github.com/tmax-cloud/hypercloud-installer.git;
mv -f hypercloud-installer/app/k8s_infra_installer.sh .;
chmod 755 k8s_infra_installer.sh;
./k8s_infra_installer.sh up worker;`;
}

export function getK8sClusterJoinScript() {
  return `echo "@@@\`kubeadm token create --print-join-command\`"`;
}

export function getDeleteWorkerNodeScript(worker: any) {
  return `kubectl drain ${worker.hostName};
  kubectl delete node ${worker.hostName};`;
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

export function runScriptAsFile(script: string): string {
  return `touch script.sh;
          echo "${script}" > script.sh;
          chmod 755 script.sh;
          ./script.sh;
          rm -rf ./script.sh`;
}
