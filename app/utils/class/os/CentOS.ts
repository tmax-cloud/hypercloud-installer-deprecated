import { OS, OS_TYPE } from '../../interface/os';
import * as script from '../../common/script';
import Node, { ROLE } from '../Node';
import { NETWORK_TYPE } from '../Env';
import CONST from '../../constants/constant';

/* eslint-disable class-methods-use-this */
export default class CentOS implements OS {
  type: OS_TYPE = OS_TYPE.CENTOS;

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
  EOF
    `;
  }

  setCrioRepo(crioVersion: string): string {
    return `
    curl -L -o /etc/yum.repos.d/devel:kubic:libcontainers:stable.repo \\
    https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable/CentOS_7/devel:kubic:libcontainers:stable.repo
    curl -L -o /etc/yum.repos.d/devel:kubic:libcontainers:stable:cri-o:${crioVersion}.repo \\
    https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable:cri-o:${crioVersion}/CentOS_7/devel:kubic:libcontainers:stable:cri-o:${crioVersion}.repo;
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
    interfaceName=\`ls /sys/class/net | grep ens\`;
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
    ${this.cloneGitFile(CONST.GIT_REPO)}
      cd ~/hypercloud-install-guide/K8S_Master/installer;
      cp -f ~/hypercloud-install-guide/installer/install.sh .;
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
      #rm -rf ~/hypercloud-install-guide/;
      yum install -y ipvsadm;
      ipvsadm --clear;
      rm -rf /var/lib/etcd/;
      rm -rf /etc/kubernetes/;
      ${script.deleteCniConfigScript()}
      ${deleteHostName}
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

  getImageRegistrySettingScript(registry: string, type: string): string {
    return `
    ${this.deleteDockerScript()}
    cd ~/hypercloud-install-guide/Image_Registry/installer
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
    sudo ./run-registry.sh ~/hypercloud-install-guide/Image_Registry/installer ${registry};
    `;
  }

  setPackageRepository(destPath: string): string {
    return `
    cp -rT ${destPath} /tmp/localrepo;
    sudo yum install -y /tmp/localrepo/createrepo/*.rpm;
    sudo createrepo /tmp/localrepo;
    sudo cat << "EOF" | sudo tee /etc/yum.repos.d/localrepo.repo
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
    sudo yum clean all && yum repolist;
    #rm -rf ${destPath};
    `;
  }

  cloneGitFile(repoPath: string): string {
    return `
    cd ~;
    yum install -y git;
    git clone ${repoPath};
    `;
  }

  getInstallMainMasterScript(
    mainMaster: Node,
    registry: string,
    version: string,
    isMultiMaster: boolean
  ): string {
    return script.getK8sMainMasterInstallScript(
      mainMaster,
      registry,
      version,
      isMultiMaster
    );
  }

  getInstallMasterScript(
    mainMaster: Node,
    registry: string,
    version: string,
    master: Node,
    priority: number
  ): string {
    return script.getK8sMasterInstallScript(
      mainMaster,
      registry,
      version,
      master,
      priority
    );
  }

  getInstallWorkerScript(
    mainMaster: Node,
    registry: string,
    version: string,
    worker: Node
  ): string {
    return script.getK8sWorkerInstallScript(
      mainMaster,
      registry,
      version,
      worker
    );
  }
}
