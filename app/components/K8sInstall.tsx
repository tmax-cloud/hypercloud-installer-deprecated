import React from 'react';
import K8sInstallEnvironment from './K8sInstallEnvironment';
import K8sInstallSsh from './K8sInstallSsh';
import K8sInstallExecute from './K8sInstallExecute';

export default function K8sInstall() {
  const [page, setPage] = React.useState(1);

  const [nodeCnt, setNodeCnt] = React.useState(1);

  const [sshInfo, setSshInfo] = React.useState([]);

  function getComponentOfPage(): JSX.Element | null {
    let obj = null;
    if (page === 1) {
      obj = (
        <K8sInstallEnvironment
          page={page}
          setPage={setPage}
          setNodeCnt={setNodeCnt}
        />
      );
    } else if (page === 2) {
      obj = (
        <K8sInstallSsh
          page={page}
          setPage={setPage}
          nodeCnt={nodeCnt}
          setSshInfo={setSshInfo}
        />
      );
    } else if (page === 3) {
      obj = (
        <K8sInstallExecute page={page} setPage={setPage} sshInfo={sshInfo} />
      );
    }
    return obj;
  }

  return <div>{getComponentOfPage()}</div>;
}
