/* eslint-disable no-console */
// eslint-disable-next-line import/prefer-default-export
import { NETWORK_TYPE } from '../class/Env';
import Node from '../class/Node';

export const CRIO_VERSION = `1.17`;

function setHostName(hostName: string) {
  return `sudo hostnamectl set-hostname ${hostName};`;
}

function registHostName() {
  return `echo \`hostname -I\` \`hostname\` >> /etc/hosts`;
}

// export function cloneGitScript(address: string) {
//   return `
//     cd ~;
//     yum install -y git;
//     git clone ${address};
//     `;
// }

// export function setKubernetesRepo() {
//   return `
//   cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
// [kubernetes]
// name=Kubernetes
// baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-\\$basearch
// enabled=1
// gpgcheck=1
// repo_gpgcheck=1
// gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
// EOF
//   `;
// }

// export function setCrioRepo(crioVersion: string) {
//   return `
//   curl -L -o /etc/yum.repos.d/devel:kubic:libcontainers:stable.repo \\
//   https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable/CentOS_7/devel:kubic:libcontainers:stable.repo
//   curl -L -o /etc/yum.repos.d/devel:kubic:libcontainers:stable:cri-o:${crioVersion}.repo \\
//   https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable:cri-o:${crioVersion}/CentOS_7/devel:kubic:libcontainers:stable:cri-o:${crioVersion}.repo;
//   `;
// }

// function setDockerRepo() {
//   return `
// sudo yum install -y yum-utils;
// sudo yum-config-manager \
// --add-repo \
// https://download.docker.com/linux/centos/docker-ce.repo;
// `;
// }

export function getCniImagePushScript(registry: string) {
  return `
    mkdir -p ~/cni-install
    export CNI_HOME=~/cni-install
    export CNI_VERSION=v3.13.4
    export CTL_VERSION=v3.15.0
    #export REGISTRY=172.22.8.106:5000
    cd $CNI_HOME

    sudo docker pull calico/node:\${CNI_VERSION}
    sudo docker pull calico/pod2daemon-flexvol:\${CNI_VERSION}
    sudo docker pull calico/cni:\${CNI_VERSION}
    sudo docker pull calico/kube-controllers:\${CNI_VERSION}
    sudo docker pull calico/ctl:\${CTL_VERSION}
    curl https://raw.githubusercontent.com/tmax-cloud/hypercloud-install-guide/master/CNI/calico_3.13.4.yaml > calico.yaml
    curl https://raw.githubusercontent.com/tmax-cloud/hypercloud-install-guide/master/CNI/calicoctl_3.15.0.yaml > calicoctl.yaml

    sudo docker tag calico/node:\${CNI_VERSION} ${registry}/calico/node:\${CNI_VERSION}
    sudo docker tag calico/pod2daemon-flexvol:\${CNI_VERSION} ${registry}/calico/pod2daemon-flexvol:\${CNI_VERSION}
    sudo docker tag calico/cni:\${CNI_VERSION} ${registry}/calico/cni:\${CNI_VERSION}
    sudo docker tag calico/kube-controllers:\${CNI_VERSION} ${registry}/calico/kube-controllers:\${CNI_VERSION}
    sudo docker tag calico/ctl:\${CTL_VERSION} ${registry}/calico/ctl:\${CTL_VERSION}

    sudo docker push ${registry}/calico/node:\${CNI_VERSION}
    sudo docker push ${registry}/calico/pod2daemon-flexvol:\${CNI_VERSION}
    sudo docker push ${registry}/calico/cni:\${CNI_VERSION}
    sudo docker push ${registry}/calico/kube-controllers:\${CNI_VERSION}
    sudo docker push ${registry}/calico/ctl:\${CTL_VERSION}
    `;
}

export function deleteCniConfigScript() {
  return `
    rm -rf /etc/cni/*
  `;
}

export function getCniRemoveScript(version: string): string {
  return `
  cd ~/hypercloud-install-guide/CNI;
  kubectl delete -f calico_${version}.yaml;
  kubectl delete -f calicoctl_3.15.0.yaml;
  ${deleteCniConfigScript()}
  `;
}

export function getCniInstallScript(version: string, registry: string): string {
  let setRegistry = '';
  let imagePushScript = '';
  if (registry) {
    setRegistry = `
    sed -i 's/calico\\/cni/'${registry}'\\/calico\\/cni/g' calico_${version}.yaml;
    sed -i 's/calico\\/pod2daemon-flexvol/'${registry}'\\/calico\\/pod2daemon-flexvol/g' calico_${version}.yaml;
    sed -i 's/calico\\/node/'${registry}'\\/calico\\/node/g' calico_${version}.yaml;
    sed -i 's/calico\\/kube-controllers/'${registry}'\\/calico\\/kube-controllers/g' calico_${version}.yaml;
    sed -i 's/calico\\/ctl/'${registry}'\\/calico\\/ctl/g' calico_${version}.yaml;
    `;
    imagePushScript = getCniImagePushScript(registry);
  }
  return `
    ${imagePushScript}
    cd ~/hypercloud-install-guide/CNI;
    sed -i 's/v3.13.4/'v${version}'/g' calico_${version}.yaml;
    . ~/hypercloud-install-guide/K8S_Master/installer/k8s.config;
    sed -i 's|10.0.0.0/16|'$podSubnet'|g' calico_${version}.yaml;
    ${setRegistry}
    cd ~/hypercloud-install-guide/CNI;
    kubectl apply -f calico_${version}.yaml;
    kubectl apply -f calicoctl_3.15.0.yaml;
    `;
}

// function deleteDockerScript() {
//   return `
//     sudo yum remove -y docker \
//     docker-client \
//     docker-client-latest \
//     docker-common \
//     docker-latest \
//     docker-latest-logrotate \
//     docker-logrotate \
//     docker-engine; \

//     sudo yum remove -y docker-ce docker-ce-cli containerd.io;
//     sudo rm -rf /var/lib/docker;

//     rm -rf /etc/docker/daemon.json;
//     `;
// }

export function getKubernetesImagePushScript(registry: string, type: string) {
  const path = `~/k8s-install`;
  let gitPullCommand = `
  mkdir -p ${path};
  cd ${path};
  `;
  if (type === NETWORK_TYPE.INTERNAL) {
    gitPullCommand += `
    sudo docker load -i kube-apiserver.tar;
    sudo docker load -i kube-scheduler.tar;
    sudo docker load -i kube-controller-manager.tar ;
    sudo docker load -i kube-proxy.tar;
    sudo docker load -i etcd.tar;
    sudo docker load -i coredns.tar;
    sudo docker load -i pause.tar;
    `;
  } else {
    gitPullCommand += `
    sudo docker pull k8s.gcr.io/kube-proxy:v1.17.6;
    sudo docker pull k8s.gcr.io/kube-apiserver:v1.17.6;
    sudo docker pull k8s.gcr.io/kube-controller-manager:v1.17.6;
    sudo docker pull k8s.gcr.io/kube-scheduler:v1.17.6;
    sudo docker pull k8s.gcr.io/etcd:3.4.3-0;
    sudo docker pull k8s.gcr.io/coredns:1.6.5;
    sudo docker pull k8s.gcr.io/pause:3.1;
    `;
  }

  return `
    ${gitPullCommand}
    sudo docker tag k8s.gcr.io/kube-apiserver:v1.17.6 ${registry}/k8s.gcr.io/kube-apiserver:v1.17.6;
    sudo docker tag k8s.gcr.io/kube-proxy:v1.17.6 ${registry}/k8s.gcr.io/kube-proxy:v1.17.6;
    sudo docker tag k8s.gcr.io/kube-controller-manager:v1.17.6 ${registry}/k8s.gcr.io/kube-controller-manager:v1.17.6;
    sudo docker tag k8s.gcr.io/etcd:3.4.3-0 ${registry}/k8s.gcr.io/etcd:3.4.3-0;
    sudo docker tag k8s.gcr.io/coredns:1.6.5 ${registry}/k8s.gcr.io/coredns:1.6.5;
    sudo docker tag k8s.gcr.io/kube-scheduler:v1.17.6 ${registry}/k8s.gcr.io/kube-scheduler:v1.17.6;
    sudo docker tag k8s.gcr.io/pause:3.1 ${registry}/k8s.gcr.io/pause:3.1;

    sudo docker push ${registry}/k8s.gcr.io/kube-apiserver:v1.17.6;
    sudo docker push ${registry}/k8s.gcr.io/kube-proxy:v1.17.6;
    sudo docker push ${registry}/k8s.gcr.io/kube-controller-manager:v1.17.6;
    sudo docker push ${registry}/k8s.gcr.io/etcd:3.4.3-0;
    sudo docker push ${registry}/k8s.gcr.io/coredns:1.6.5;
    sudo docker push ${registry}/k8s.gcr.io/kube-scheduler:v1.17.6;
    sudo docker push ${registry}/k8s.gcr.io/pause:3.1;
    #rm -rf ${path};
    `;
}

// function getMasterMultiplexingScript(
//   node: Node,
//   priority: number,
//   vip: string
// ) {
//   let state = '';
//   if (node.role === ROLE.MAIN_MASTER) {
//     state = 'MASTER';
//   } else if (node.role === ROLE.MASTER) {
//     state = 'BACKUP';
//   }
//   return `
//   sudo yum install -y keepalived;
//   interfaceName=\`ls /sys/class/net | grep ens\`;
// echo "vrrp_instance VI_1 {
//   state ${state}
//   interface \${interfaceName}
//   virtual_router_id 50
//   priority ${priority}
//   advert_int 1
//   nopreempt
//   authentication {
//     auth_type PASS
//     auth_pass $ place secure password here.
//     }
//   virtual_ipaddress {
//     ${vip}
//     }
//   }" > /etc/keepalived/keepalived.conf
//   sudo systemctl restart keepalived;
//   sudo systemctl enable keepalived;
//   sudo systemctl status keepalived;
//   `;
// }

// export function getK8sMasterRemoveScript(): string {
//   const deleteHostName = `sudo sed -i /\`hostname\`/d /etc/hosts`;
//   return `
//     ${cloneGitScript(
//       'https://github.com/tmax-cloud/hypercloud-install-guide.git'
//     )}
//     cd ~/hypercloud-install-guide/K8S_Master/installer;
//     cp -f ~/hypercloud-install-guide/installer/install.sh .;
//     chmod 755 install.sh;
//     sed -i 's|\\r$||g' k8s.config;
//     sed -i 's|\\r$||g' install.sh;
//     ./install.sh delete;
//     ./install.sh delete;
//     yum remove -y kubeadm;
//     yum remove -y kubelet;
//     yum remove -y kubectl;
//     yum remove -y cri-o;
//     sudo yum remove -y keepalived;
//     rm -rf /etc/keepalived/;
//     ${deleteDockerScript()}
//     #rm -rf ~/hypercloud-install-guide/;
//     yum install -y ipvsadm;
//     ipvsadm --clear;
//     rm -rf /var/lib/etcd/;
//     rm -rf /etc/kubernetes/;
//     ${deleteCniConfigScript()}
//     ${deleteHostName}
//     `;
// }

// export function getCniRemoveScript(version: string) {
//   return `
//     ${cloneGitScript(
//       'https://github.com/tmax-cloud/hypercloud-install-guide.git'
//     )}
//     cd ~/hypercloud-install-guide/CNI;
//     kubectl delete -f calico_${version}.yaml;
//     kubectl delete -f calicoctl_3.15.0.yaml;
//     ${deleteCniConfigScript()}
//     `;
// }

// export function getImageRegistrySettingScript(
//   registry: string,
//   type: string
// ): string {
//   return `
//     cd ~/hypercloud-install-guide/Image_Registry/installer
//     ${deleteDockerScript()}
//     ${type === NETWORK_TYPE.EXTERNAL ? setDockerRepo() : ''}
//     sudo yum install -y docker-ce docker-ce-cli containerd.io;
//     sudo systemctl start docker;
//     sudo systemctl enable docker
//     sudo touch /etc/docker/daemon.json;
//     echo "{ \\"insecure-registries\\": [\\"${registry}\\"] }" > /etc/docker/daemon.json;
//     sudo systemctl restart docker;
//     sudo systemctl status docker;
//     chmod 755 run-registry.sh;
//     sed -i 's|\\r$||g' run-registry.sh;
//     sudo ./run-registry.sh ~/hypercloud-install-guide/Image_Registry/installer ${registry};
//     `;
// }

// export function getCniInstallScript(version: string, registry: string): string {
//   let setRegistry = '';
//   let imagePushScript = '';
//   if (registry) {
//     setRegistry = `
//     sed -i 's/calico\\/cni/'${registry}'\\/calico\\/cni/g' calico_${version}.yaml;
//     sed -i 's/calico\\/pod2daemon-flexvol/'${registry}'\\/calico\\/pod2daemon-flexvol/g' calico_${version}.yaml;
//     sed -i 's/calico\\/node/'${registry}'\\/calico\\/node/g' calico_${version}.yaml;
//     sed -i 's/calico\\/kube-controllers/'${registry}'\\/calico\\/kube-controllers/g' calico_${version}.yaml;
//     sed -i 's/calico\\/ctl/'${registry}'\\/calico\\/ctl/g' calico_${version}.yaml;
//     `;
//     imagePushScript = getCniImagePushScript(registry);
//   }
//   return `
//     ${imagePushScript}
//     ${cloneGitScript(
//       'https://github.com/tmax-cloud/hypercloud-install-guide.git'
//     )}
//     cd ~/hypercloud-install-guide/CNI;
//     sed -i 's/v3.13.4/'v${version}'/g' calico_${version}.yaml;
//     . ~/hypercloud-install-guide/K8S_Master/installer/k8s.config;
//     sed -i 's|10.0.0.0/16|'$podSubnet'|g' calico_${version}.yaml;
//     ${setRegistry}
//     cd ~/hypercloud-install-guide/CNI;
//     kubectl apply -f calico_${version}.yaml;
//     kubectl apply -f calicoctl_3.15.0.yaml;
//     `;
// }

export function getK8sMainMasterInstallScript(
  mainMaster: Node,
  registry: string,
  version: string,
  isMultiMaster: boolean
): string {
  return `
    ${setHostName(mainMaster.hostName)}
    ${registHostName()}
    ${
      isMultiMaster
        ? mainMaster.os.getMasterMultiplexingScript(
            mainMaster,
            100,
            mainMaster.ip
          )
        : ''
    }
    cd ~/hypercloud-install-guide/K8S_Master/installer;
    sed -i 's|\\r$||g' k8s.config;
    . k8s.config;
    sudo sed -i "s|$imageRegistry|${registry}|g" ./k8s.config;
    sudo sed -i "s|$crioVersion|${CRIO_VERSION}|g" ./k8s.config;
    sudo sed -i "s|$k8sVersion|${version}|g" ./k8s.config;
    sudo sed -i "s|$apiServer|${mainMaster.ip}|g" ./k8s.config;
    cp -f ~/hypercloud-install-guide/installer/install.sh .;
    chmod 755 install.sh;
    sed -i 's|\\r$||g' install.sh;
    ./install.sh up mainMaster;
    #rm -rf ~/hypercloud-install-guide;
    `;
}

export function getK8sMasterInstallScript(
  mainMaster: Node,
  registry: string,
  version: string,
  master: Node,
  priority: number
): string {
  return `
    ${setHostName(master.hostName)}
    ${registHostName()}
    ${master.os.getMasterMultiplexingScript(master, priority, mainMaster.ip)}
    cd ~/hypercloud-install-guide/K8S_Master/installer;
    sed -i 's|\\r$||g' k8s.config;
    . k8s.config;
    sudo sed -i "s|$imageRegistry|${registry}|g" ./k8s.config;
    sudo sed -i "s|$crioVersion|${CRIO_VERSION}|g" ./k8s.config;
    sudo sed -i "s|$k8sVersion|${version}|g" ./k8s.config;
    sudo sed -i "s|$apiServer|${mainMaster.ip}|g" ./k8s.config;
    cp -f ~/hypercloud-install-guide/installer/install.sh .;
    chmod 755 install.sh;
    sed -i 's|\\r$||g' install.sh;
    ./install.sh up master;
    #rm -rf ~/hypercloud-install-guide;
    `;
}

export function getK8sWorkerInstallScript(
  mainMaster: Node,
  registry: string,
  version: string,
  worker: Node
): string {
  return `
    ${setHostName(worker.hostName)}
    ${registHostName()}
    cd ~/hypercloud-install-guide/K8S_Master/installer;
    sed -i 's|\\r$||g' k8s.config;
    . k8s.config;
    sudo sed -i "s|$imageRegistry|${registry}|g" ./k8s.config;
    sudo sed -i "s|$crioVersion|${CRIO_VERSION}|g" ./k8s.config;
    sudo sed -i "s|$k8sVersion|${version}|g" ./k8s.config;
    sudo sed -i "s|$apiServer|${mainMaster.ip}|g" ./k8s.config;
    cp -f ~/hypercloud-install-guide/installer/install.sh .;
    chmod 755 install.sh;
    sed -i 's|\\r$||g' install.sh;
    ./install.sh up worker;
    #rm -rf ~/hypercloud-install-guide;
    `;
}

export function getK8sClusterWorkerJoinScript() {
  return `echo "@@@\`kubeadm token create --print-join-command\`@@@"`;
}

export function getK8sClusterMasterJoinScript() {
  return `
  cd ~/hypercloud-install-guide/K8S_Master/installer/yaml;
  result=\`kubeadm init phase upload-certs --upload-certs --config=./kubeadm-config.yaml\`;
  certkey=\${result#*key:};
  echo "%%%\`kubeadm token create --print-join-command --certificate-key \${certkey}\`%%%"
  `;
}

export function getDeleteWorkerNodeScript(worker: any) {
  return `
kubectl drain ${worker.hostName};
kubectl delete node ${worker.hostName};
`;
}

// export function setPackageRepository(path: string) {
//   return `
// cp -rT ${path} /tmp/localrepo;
// sudo yum install -y /tmp/localrepo/createrepo/*.rpm;
// sudo createrepo /tmp/localrepo;
// sudo cat << "EOF" | sudo tee /etc/yum.repos.d/localrepo.repo
// [localrepo]
// name=localrepo
// baseurl=file:///tmp/localrepo/
// enabled=1
// gpgcheck=0
// EOF
// sudo yum --disablerepo=* --enablerepo=localrepo install -y yum-utils;
// yum-config-manager --disable 'CentOS-7 - Base';
// yum-config-manager --disable 'CentOS-7 - Extras';
// yum-config-manager --disable 'CentOS-7 - Updates';
// sudo yum clean all && yum repolist;
// #rm -rf ${path};
// `;
// }

// export function getDockerInstallScript(): string {
//   const MGT_DOCKER_VERSION = '5:19.03.2~3-0~ubuntu-bionic';

//   return `#!/bin/bash

// if [ $(awk -F= '/^ID=/ { print $2 }' /etc/os-release | tr -d '"') == ubuntu ]; then
//   # install docker
//   # if ! command -v docker 2>/dev/null; then
//     sudo apt-get remove docker docker-engine docker.io containerd runc;
//     sudo apt-get update;
//     sudo apt-get install -y apt-transport-https;
//     sudo apt-get install -y ca-certificates;
//     sudo apt-get install -y curl;
//     sudo apt-get install -y gnupg-agent;
//     sudo apt-get install -y software-properties-common;
//     sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
//     sudo add-apt-repository \\"deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\\"
//     sudo apt-get update;
//     sudo apt-get install docker-ce;
//     sudo apt-get install -y docker-ce-cli;
//     sudo apt-get install -y containerd.io;
//   # fi
// fi
// `;
// }

// export function getK8sToolsInstallScript(): string {
//   const KUBERNETES_VERSION = '1.17.6';
//   return `sudo apt-get update;
//           sudo swapoff -a;
//           sudo curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
//           echo "deb http://apt.kubernetes.io/ kubernetes-xenial main" \
//                   > /etc/apt/sources.list.d/kubernetes.list
//           sudo apt update;
//           sudo apt install -y kubelet=${KUBERNETES_VERSION}-00;
//           sudo apt install -y kubeadm=${KUBERNETES_VERSION}-00;
//           sudo apt install -y kubectl=${KUBERNETES_VERSION}-00;`;
//   // sudo apt-mark hold kubelet kubeadm kubectl;`
// }

// export function getK8sClusterInitScript(): string {
//   return `#!/bin/bash

// if [ $(awk -F= '/^ID=/ { print $2 }' /etc/os-release | tr -d '"') == ubuntu ]; then
//   # install kubernetes
//   # if ! command -v kubectl 2>/dev/null || ! command -v kubeadm 2>/dev/null || ! command -v kubelet 2>/dev/null ; then
//     ${getK8sToolsInstallScript()}
//     kubeadm init;
//     mkdir -p $HOME/.kube;
//     sudo cp -f /etc/kubernetes/admin.conf $HOME/.kube/config;
//     sudo chown $(id -u):$(id -g) $HOME/.kube/config;
//   # fi
// fi
// `;
// }

// export function runScriptAsFile(script: string): string {
//   return `touch script.sh;
//           echo "${script}" > script.sh;
//           chmod 755 script.sh;
//           ./script.sh;
//           rm -rf ./script.sh`;
// }
