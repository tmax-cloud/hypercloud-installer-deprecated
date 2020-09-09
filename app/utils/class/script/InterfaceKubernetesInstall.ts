import Node from '../Node';

export interface InterfaceKubernetesInstall {
  // 필수 구현 목록 (각 운영체제 별)
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
