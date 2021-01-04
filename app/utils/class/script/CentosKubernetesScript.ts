/* eslint-disable class-methods-use-this */
import Node, { ROLE } from '../Node';
import AbstractCentosScript from './AbstractCentosScript';
import { InterfaceKubernetesInstall } from './InterfaceKubernetesInstall';
import Env, { NETWORK_TYPE } from '../Env';
import CniInstaller from '../installer/CniInstaller';
import KubernetesInstaller from '../installer/KubernetesInstaller';

export default class CentosKubernetesScript extends AbstractCentosScript
  implements InterfaceKubernetesInstall {
  // ntp 설치
  installNtp(): string {
    return `
      yum install -y ntp;
      `;
  }

  setKubernetesRepo(): string {
    return `
    cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-\\$basearch
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF`;
  }

  // FIXME: CentOS부분 prolinux에서 문제 생길 여지 있음
  setCrioRepo(crioVersion: string): string {
    return `
    sudo yum install -y yum-utils;
    yum-config-manager --enable 'CentOS-7 - Base';
    yum-config-manager --enable 'CentOS-7 - Extras';
    yum-config-manager --enable 'CentOS-7 - Updates';
    sudo yum clean all;

    # prolinux에서 container selinux 설치 해야 함
    sudo yum install -y http://mirror.centos.org/centos/7/extras/x86_64/Packages/container-selinux-2.107-3.el7.noarch.rpm;

    curl -L -o /etc/yum.repos.d/devel:kubic:libcontainers:stable.repo https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/CentOS_7/devel:kubic:libcontainers:stable.repo;
    curl -L -o /etc/yum.repos.d/devel:kubic:libcontainers:stable:cri-o:${crioVersion}.repo https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable:cri-o:${crioVersion}/CentOS_7/devel:kubic:libcontainers:stable:cri-o:${crioVersion}.repo;
    `;
  }

  getMasterMultiplexingScript(
    node: Node,
    priority: number,
    vip: string
  ): string {
    let state = '';
    if (node.role === ROLE.MAIN_MASTER) {
      state = 'MASTER';
    } else if (node.role === ROLE.MASTER) {
      state = 'BACKUP';
    }
    return `
    sudo yum install -y keepalived;
    interfaceName=\`ip -o -4 route show to default | awk '{print $5}'\`;
    echo "vrrp_instance VI_1 {
    state ${state}
    interface \${interfaceName}
    virtual_router_id 50
    priority ${priority}
    advert_int 1
    nopreempt
    authentication {
      auth_type PASS
      auth_pass $ place secure password here.
      }
    virtual_ipaddress {
      ${vip}
      }
    }" > /etc/keepalived/keepalived.conf
    sudo systemctl restart keepalived;
    sudo systemctl enable keepalived;
    sudo systemctl status keepalived;
    `;
  }

  getK8sMasterRemoveScript(): string {
    const deleteHostName = `sudo sed -i /\`hostname\`/d /etc/hosts`;
    return `
      cd ~/${KubernetesInstaller.INSTALL_HOME};
      cp -f ~/${
        Env.INSTALL_ROOT
      }/hypercloud-install-guide/installer/install.sh .;
      chmod 755 install.sh;
      sed -i 's|\\r$||g' k8s.config;
      sed -i 's|\\r$||g' install.sh;
      ./install.sh delete;
      ./install.sh delete;
      yum remove -y kubeadm;
      yum remove -y kubelet;
      yum remove -y kubectl;
      yum remove -y cri-o;
      sudo yum remove -y keepalived;
      rm -rf /etc/keepalived/;
      ${this.deleteDockerScript()}
      rm -rf ~/${Env.INSTALL_ROOT}/hypercloud-install-guide/;
      yum install -y ipvsadm;
      ipvsadm --clear;
      rm -rf /var/lib/etcd/;
      rm -rf /etc/kubernetes/;
      ${CniInstaller.deleteCniConfigScript()}
      ${deleteHostName}
      `;
  }

  deleteDockerScript(): string {
    return `
    sudo yum remove -y docker \
    docker-client \
    docker-client-latest \
    docker-common \
    docker-latest \
    docker-latest-logrotate \
    docker-logrotate \
    docker-engine; \

    sudo yum remove -y docker-ce docker-ce-cli containerd.io;
    sudo rm -rf /var/lib/docker;

    rm -rf /etc/docker/daemon.json;
    `;
  }

  setDockerRepo(): string {
    return `
    sudo yum install -y yum-utils;
    sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo;
    `;
  }

  getImageRegistrySettingScript(registry: string, type: string): string {
    return `
    ${this.deleteDockerScript()}
    cd ~/${KubernetesInstaller.IMAGE_REGISTRY_INSTALL_HOME};
    ${type === NETWORK_TYPE.EXTERNAL ? this.setDockerRepo() : ''}
    sudo yum install -y docker-ce docker-ce-cli containerd.io;
    sudo systemctl start docker;
    sudo systemctl enable docker
    sudo touch /etc/docker/daemon.json;
    echo "{ \\"insecure-registries\\": [\\"${registry}\\"] }" > /etc/docker/daemon.json;
    sudo systemctl restart docker;
    sudo systemctl status docker;
    chmod 755 run-registry.sh;
    sed -i 's|\\r$||g' run-registry.sh;
    sudo ./run-registry.sh ~/${
      KubernetesInstaller.IMAGE_REGISTRY_INSTALL_HOME
    } ${registry};
    `;
  }

  // FIXME: CentOS부분 prolinux에서 문제 생길 여지 있음
  setPackageRepository(destPath: string): string {
    return `
    cp -rT ${destPath} /tmp/localrepo;
    sudo yum install -y /tmp/localrepo/createrepo/*.rpm;
    sudo createrepo /tmp/localrepo;
    sudo cat <<EOF | sudo tee /etc/yum.repos.d/localrepo.repo
[localrepo]
name=localrepo
baseurl=file:///tmp/localrepo/
enabled=1
gpgcheck=0
EOF
    sudo yum --disablerepo=* --enablerepo=localrepo install -y yum-utils;
    yum-config-manager --disable 'CentOS-7 - Base';
    yum-config-manager --disable 'CentOS-7 - Extras';
    yum-config-manager --disable 'CentOS-7 - Updates';
    sudo yum clean all;
    #rm -rf ${destPath};
    `;
  }
}
