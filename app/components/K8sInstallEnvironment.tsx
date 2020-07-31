/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-console */
/* eslint-disable no-alert */
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../../utils/constants/routes.json';
import nodes from '../../utils/constants/env.json';
import { mapStateToProps, mapDispatchToProps } from '../actions/env';

type Props = {
  env: object;
  saveEnvList: Function;
};

function K8sInstallEnvironment(props: Props) {
  console.log('K8sInstallEnvironment props : ', props);
  console.log('routes', routes);
  console.log('nodes:', nodes);
  const { saveEnvList } = props;

  function onChangeK8sVersion(e: any) {
    saveEnvList({
      k8s: e.target.value
    });
  }
  function onChangeRegistryAddr(e: any) {
    saveEnvList({
      dockerRegistry: e.target.value
    });
  }
  return (
    <div>
      <h1>Step 1</h1>
      <h4>Kubernetes 환경 구성 정보</h4>
      <form>
        {/* <label>
          <input type="radio" name="group" value="one" ref={oneRef} />
          단일 노드
        </label>
        <br />
        <label>
          <input type="radio" name="group" value="multi" ref={multiRef} />
          다중 노드
        </label> */}
        {/* <input
          type="number"
          id="nodeCnt"
          name="nodeCnt"
          ref={nodeCntInputRef}
        /> */}
        <label htmlFor="select1">
          Kubernetes version:
          <select onChange={onChangeK8sVersion}>
            <option value="1.17.4">1.17.4</option>
            <option value="1.16.4">1.16.4</option>
          </select>
        </label>
        <br />
        <label htmlFor="select2">
          Docker registry:
          <input type="text" onChange={onChangeRegistryAddr} />
        </label>
      </form>
      <br />
      <div>
        <button type="button" disabled>
          Prev
        </button>
        <button type="button">
          <Link to={routes.K8S_INSTALL_SSH}>Next</Link>
        </button>
      </div>
      <p>{JSON.stringify(nodes)}</p>
    </div>
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(K8sInstallEnvironment);
