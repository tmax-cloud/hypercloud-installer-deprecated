export enum OS_TYPE {
  CENTOS = 'CentOS Linux',
  UBUNTU = 'Ubuntu',
  PROLINUX = 'ProLinux'
}

export abstract class AbstractOs {
  public type: OS_TYPE;

  constructor(osType: OS_TYPE) {
    this.type = osType;
  }
}
