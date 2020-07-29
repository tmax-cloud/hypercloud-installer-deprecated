// eslint-disable-next-line import/prefer-default-export
export function getK8sMasterRemoveScript(): string {
  return `cd ~;
yum install -y git;
git clone https://github.com/tmax-cloud/hypercloud-install-guide.git;
cd hypercloud-install-guide/K8S_Master/installer;
chmod 755 k8s_infra_installer.sh;
./k8s_infra_installer.sh delete;
./k8s_infra_installer.sh delete;
yum remove -y kubeadm;
yum remove -y kubelet;
yum remove -y kubectl;
yum remove -y cri-o;
rm -rf ~/hypercloud-install-guide/;`;
}

export function getK8sMainMasterInstallScript(
  mainMaster: any,
  index: number
): string {
  const IMAGE_REGISTRY = ``;
  const CRIO_VERSION = `1.17`;
  const KUBERNETES_VERSION = `1.17.6`;
  const API_SERVER = mainMaster.ip;

  const setHostName = `sudo hostnamectl set-hostname master-${index};`;
  const registHostName = `echo \`hostname -I\` master-${index} >> /etc/hosts`;

  return `${setHostName}
${registHostName}
cd ~;
yum install -y git;
git clone https://github.com/tmax-cloud/hypercloud-install-guide.git;
cd hypercloud-install-guide/K8S_Master/installer;
. k8s.config;
sudo sed -i "s|$imageRegistry|${IMAGE_REGISTRY}|g" ./k8s.config;
sudo sed -i "s|$crioVersion|${CRIO_VERSION}|g" ./k8s.config;
sudo sed -i "s|$k8sVersion|${KUBERNETES_VERSION}|g" ./k8s.config;
sudo sed -i "s|$apiServer|${API_SERVER}|g" ./k8s.config;
sudo sed -i "s|imageRepository|#imageRepository|g" ./yaml/kubeadm-config.yaml;
git clone https://github.com/tmax-cloud/hypercloud-installer.git;
mv -f hypercloud-installer/app/k8s_infra_installer.sh .;
chmod 755 k8s_infra_installer.sh;
./k8s_infra_installer.sh up mainMaster;`;
}

export function getK8sMasterInstallScript(mainMaster: any, master: any, index: number): string {
  const IMAGE_REGISTRY = ``;
  const CRIO_VERSION = `1.17`;
  const KUBERNETES_VERSION = `1.17.6`;
  const API_SERVER = mainMaster.ip;

  const setHostName = `sudo hostnamectl set-hostname master-${index};`;
  const registHostName = `echo \`hostname -I\` master-${index} >> /etc/hosts`;

  return `${setHostName}
${registHostName}
cd ~;
yum install -y git;
git clone https://github.com/tmax-cloud/hypercloud-install-guide.git;
cd hypercloud-install-guide/K8S_Master/installer;
. k8s.config;
sudo sed -i "s|$imageRegistry|${IMAGE_REGISTRY}|g" ./k8s.config;
sudo sed -i "s|$crioVersion|${CRIO_VERSION}|g" ./k8s.config;
sudo sed -i "s|$k8sVersion|${KUBERNETES_VERSION}|g" ./k8s.config;
sudo sed -i "s|$apiServer|${API_SERVER}|g" ./k8s.config;
sudo sed -i "s|imageRepository|#imageRepository|g" ./yaml/kubeadm-config.yaml;
git clone https://github.com/tmax-cloud/hypercloud-installer.git;
mv -f hypercloud-installer/app/k8s_infra_installer.sh .;
chmod 755 k8s_infra_installer.sh;
./k8s_infra_installer.sh up master;`;
}

export function getK8sWorkerInstallScript(mainMaster: any, worker: any, index: number): string {
  const IMAGE_REGISTRY = ``;
  const CRIO_VERSION = `1.17`;
  const KUBERNETES_VERSION = `1.17.6`;
  const API_SERVER = mainMaster.ip;

  const setHostName = `sudo hostnamectl set-hostname worker-${index};`;
  const registHostName = `echo \`hostname -I\` worker-${index} >> /etc/hosts`;

  return `${setHostName}
${registHostName}
cd ~;
yum install -y git;
git clone https://github.com/tmax-cloud/hypercloud-install-guide.git;
cd hypercloud-install-guide/K8S_Master/installer;
. k8s.config;
sudo sed -i "s|$imageRegistry|${IMAGE_REGISTRY}|g" ./k8s.config;
sudo sed -i "s|$crioVersion|${CRIO_VERSION}|g" ./k8s.config;
sudo sed -i "s|$k8sVersion|${KUBERNETES_VERSION}|g" ./k8s.config;
sudo sed -i "s|$apiServer|${API_SERVER}|g" ./k8s.config;
sudo sed -i "s|imageRepository|#imageRepository|g" ./yaml/kubeadm-config.yaml;
git clone https://github.com/tmax-cloud/hypercloud-installer.git;
mv -f hypercloud-installer/app/k8s_infra_installer.sh .;
chmod 755 k8s_infra_installer.sh;
./k8s_infra_installer.sh up worker;`;
}

export function getK8sClusterJoinScript(mainMaster: any): string {
  return `export joinToken=\`kubeadm token list -o jsonpath='{.token}'\`;
          export joinHash=\`openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'\`
          echo "@@@kubeadm join ${mainMaster.ip}:6443 --token $joinToken --discovery-token-ca-cert-hash sha256:$joinHash"`;
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


const installOne = (target) => {
  return new Promise(async (resolve,reject) => {
        setTimeout(() => {
            if (true) {
              // 성공 시
              resolve(`install complete at ${target}`)
            } else {
              // 실패 시
              reject(`install err at ${target}`);
            }
        },3000)
  })
}
const installAll = async () => {
    const targets = ['node1','node2','node3'];
    const status = await Promise.all(targets.map(async (target) => {
      // 한개 씩 프로미스 리턴
      await installOne(target)
      .then((result)=>{
        console.log(result);
      })
      .catch((err)=>{
        console.error(err)
      })
    }));
    console.log("Status =>",status);
    console.log('install compelte')
}
installAll();
