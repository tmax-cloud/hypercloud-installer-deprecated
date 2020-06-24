// /* eslint-disable no-console */
// import React from 'react';
// import { connect } from 'react-redux';
// import K8sInstallEnvironment from './K8sInstallEnvironment';
// import K8sInstallSsh from './K8sInstallSsh';
// import K8sInstallExecute from './K8sInstallExecute';
// import { mapStateToProps, mapDispatchToProps } from '../actions/pager';

// type Props = {
//   pager: number;
// };

// function K8sInstall(props: Props) {
//   console.log('K8sInstall props : ', props);
//   const { pager } = props;

//   const [nodeCnt, setNodeCnt] = React.useState(1);

//   const [nodeInfo, setNodeInfo] = React.useState([]);

//   function getComponentOfPage(): JSX.Element | null {
//     let obj = null;
//     if (pager === 1) {
//       obj = <K8sInstallEnvironment setNodeCnt={setNodeCnt} />;
//     } else if (pager === 2) {
//       obj = <K8sInstallSsh nodeCnt={nodeCnt} setNodeInfo={setNodeInfo} />;
//     } else if (pager === 3) {
//       obj = <K8sInstallExecute nodeInfo={nodeInfo} />;
//     }
//     return obj;
//   }

//   return <div>{getComponentOfPage()}</div>;
// }

// export default connect(mapStateToProps, mapDispatchToProps)(K8sInstall);
