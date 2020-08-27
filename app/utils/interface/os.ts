import Node from '../class/Node';

export enum OS_TYPE {
  CENTOS = 'CentOS Linux',
  UBUNTU = 'Ubuntu'
}

export interface OS {
  installGdisk(): string;
  installNtp(): string;
  setKubernetesRepo(): string;
  setCrioRepo(crioVersion: string): string;
  getMasterMultiplexingScript(
    node: Node,
    priority: number,
    vip: string
  ): string;
  getK8sMasterRemoveScript(): string;
  deleteDockerScript(): string;
  setDockerRepo(): string;
  getImageRegistrySettingScript(registry: string, type: string): string;
  setPackageRepository(destPath: string): string;
  cloneGitFile(repoPath: string): string;
  getInstallMainMasterScript(
    mainMaster: Node,
    registry: string,
    version: string,
    isMultiMaster: boolean
  ): string;
  getInstallMasterScript(
    mainMaster: Node,
    registry: string,
    version: string,
    master: Node,
    priority: number
  ): string;
  getInstallWorkerScript(
    mainMaster: Node,
    registry: string,
    version: string,
    worker: Node
  ): string;
}
