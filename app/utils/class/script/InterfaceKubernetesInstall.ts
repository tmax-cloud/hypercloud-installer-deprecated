import Node from '../Node';

export interface InterfaceKubernetesInstall {
  // 설치 시, 필수 구현되야 하는 기능
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

  // npt 설치
  installNtp(): string;
}
