import Node from '../Node';

export interface InterfaceKubernetesInstall {
  // 설치 할 때 구현되어야 하는 기능을 해당 운영체제에서 구현
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
}
