import React, { useEffect } from 'react';

type Props = {
  page: number;
  setPage: Function;
  setNodeCnt: Function;
};

export default function K8sInstallEnvironment(props: Props) {
  // Dom 접근
  // const oneRef = React.createRef();
  // const multiRef = React.createRef();
  const nodeCntInputRef = React.createRef();

  // render 후 Dom 접근
  useEffect(() => {
    // console.log('componentDidMount');
    // if (props.environment === 'one') {
    //   oneRef.current.checked = true;
    // } else if (props.environment === 'multi') {
    //   multiRef.current.checked = true;
    // }
    // nodeCntInputRef.current.value = props.nodeCnt;
  });

  // function onClickNext() {
  //   if (oneRef.current.checked === false && multiRef.current.checked === false){
  //     alert('유형을 선택하세요.');
  //     return;
  //   }

  //   if (oneRef.current.checked === true) {
  //     props.setEnvironment('one');
  //   } else if (multiRef.current.checked === true) {
  //     props.setEnvironment('multi');
  //   }
  //   props.setPage(props.page + 1);
  // }
  function onClickNext() {
    if (!nodeCntInputRef.current.value || nodeCntInputRef.current.value < 1) {
      alert('입력 오류');
    } else {
      props.setNodeCnt(nodeCntInputRef.current.value);
      props.setPage(props.page + 1);
    }
  }
  return (
    <div>
      <h1>
        Step
        {props.page}
      </h1>
      <h4>Kubernetes가 설치 될 환경의 노드 개수 입력</h4>
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
        <input type="number" id="nodeCnt" name="nodeCnt" ref={nodeCntInputRef} />
      </form>
      <br />
      <div>
        <button type="button" disabled>
          Prev
        </button>
        <button type="button" onClick={onClickNext}>
          Next
        </button>
      </div>
    </div>
  );
}
