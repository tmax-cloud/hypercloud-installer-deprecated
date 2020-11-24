/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import * as scp from '../../common/scp';
import AbstractInstaller from './AbstractInstaller';
import Env, { NETWORK_TYPE } from '../Env';

export default class TektonPipelineInstaller extends AbstractInstaller {
  public static readonly IMAGE_DIR = `tekton-install`;

  public static readonly INSTALL_HOME = `${Env.INSTALL_ROOT}/${TektonPipelineInstaller.IMAGE_DIR}`;

  public static readonly IMAGE_HOME = `${Env.INSTALL_ROOT}/${TektonPipelineInstaller.IMAGE_DIR}`;

  // TODO: version 처리 안됨
  public static readonly VERSION = `0.12.1`;

  // singleton
  private static instance: TektonPipelineInstaller;

  private constructor() {
    super();
  }

  static get getInstance() {
    if (!TektonPipelineInstaller.instance) {
      TektonPipelineInstaller.instance = new TektonPipelineInstaller();
    }
    return this.instance;
  }

  public async install(param: { callback: any; setProgress: Function }) {
    const { callback } = param;

    await this._preWorkInstall({
      callback
    });

    await this._installMainMaster(callback);
  }

  public async remove() {
    await this._removeMainMaster();
  }

  private async _installMainMaster(callback: any) {
    console.debug('@@@@@@ Start installing pipeline main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();

    // Step 1. Pipelines 설치
    mainMaster.cmd = this._step1();
    await mainMaster.exeCmd(callback);

    console.debug('###### Finish installing pipeline main Master... ######');
  }

  private _step1() {
    if (this.env.registry) {
      return `
      cd ~/${TektonPipelineInstaller.INSTALL_HOME};
      kubectl apply -f updated.yaml;
      `;
    }
    return `
    cd ~/${TektonPipelineInstaller.INSTALL_HOME};
    kubectl apply -f https://storage.googleapis.com/tekton-releases/pipeline/previous/v0.12.1/release.yaml;
    `;
  }

  private async _removeMainMaster() {
    console.debug('@@@@@@ Start remove console main Master... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getRemoveScript();
    await mainMaster.exeCmd();
    console.debug('###### Finish remove console main Master... ######');
  }

  private _getRemoveScript(): string {
    if (this.env.registry) {
      return `
      cd ~/${TektonPipelineInstaller.INSTALL_HOME};
      kubectl delete -f updated.yaml;
      `;
    }
    return `
    cd ~/${TektonPipelineInstaller.INSTALL_HOME};
    kubectl delete -f https://storage.googleapis.com/tekton-releases/pipeline/previous/v0.12.1/release.yaml;
    `;
  }

  private async _downloadYaml() {
    console.debug('@@@@@@ Start download yaml file from external... @@@@@@');
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = `
    mkdir -p ~/${TektonPipelineInstaller.INSTALL_HOME};
    cd ~/${TektonPipelineInstaller.INSTALL_HOME};
    wget https://storage.googleapis.com/tekton-releases/pipeline/previous/v0.12.1/release.yaml -O tekton-pipeline-v0.12.1.yaml;
    `;
    await mainMaster.exeCmd();
    console.debug('###### Finish download yaml file from external... ######');
  }

  // protected abstract 구현
  protected async _preWorkInstall(param?: any) {
    console.debug('@@@@@@ Start pre-installation... @@@@@@');
    const { callback } = param;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      // internal network 경우 해주어야 할 작업들
      await this._downloadImageFile();
      await this._sendImageFile();
      // TODO: downloadYamlAtLocal();
      // TODO: sendYaml();
    } else if (this.env.networkType === NETWORK_TYPE.EXTERNAL) {
      // external network 경우 해주어야 할 작업들
      await this._downloadYaml();
    }

    if (this.env.registry) {
      // 내부 image registry 구축 경우 해주어야 할 작업들
      await this._registryWork({
        callback
      });
    }
    console.debug('###### Finish pre-installation... ######');
  }

  protected async _downloadImageFile() {
    // TODO: download image file
    console.debug(
      '@@@@@@ Start downloading the image file to client local... @@@@@@'
    );
    console.debug(
      '###### Finish downloading the image file to client local... ######'
    );
  }

  protected async _sendImageFile() {
    console.debug(
      '@@@@@@ Start sending the image file to main master node... @@@@@@'
    );
    const { mainMaster } = this.env.getNodesSortedByRole();
    const srcPath = `${Env.LOCAL_INSTALL_ROOT}/${TektonPipelineInstaller.IMAGE_DIR}/`;
    await scp.sendFile(
      mainMaster,
      srcPath,
      `${TektonPipelineInstaller.IMAGE_HOME}/`
    );
    console.debug(
      '###### Finish sending the image file to main master node... ######'
    );
  }

  protected async _registryWork(param: { callback: any }) {
    console.debug(
      '@@@@@@ Start pushing the image at main master node... @@@@@@'
    );
    const { callback } = param;
    const { mainMaster } = this.env.getNodesSortedByRole();
    mainMaster.cmd = this._getImagePushScript();
    mainMaster.cmd += this._getImagePathEditScript();
    await mainMaster.exeCmd(callback);
    console.debug(
      '###### Finish pushing the image at main master node... ######'
    );
  }

  protected _getImagePushScript(): string {
    let gitPullCommand = `
    mkdir -p ~/${TektonPipelineInstaller.IMAGE_HOME};
    export HOME=~/${TektonPipelineInstaller.IMAGE_HOME};
    export VERSION=v${TektonPipelineInstaller.VERSION};
    export REGISTRY=${this.env.registry};
    cd $HOME;
    `;
    if (this.env.networkType === NETWORK_TYPE.INTERNAL) {
      gitPullCommand += `
      docker load < tekton-pipeline-controller-v0.12.1.tar
      docker load < tekton-pipeline-kubeconfigwriter-v0.12.1.tar
      docker load < tekton-pipeline-creds-init-v0.12.1.tar
      docker load < tekton-pipeline-git-init-v0.12.1.tar
      docker load < tekton-pipeline-entrypoint-v0.12.1.tar
      docker load < tekton-pipeline-imagedigestexporter-v0.12.1.tar
      docker load < tekton-pipeline-pullrequest-init-v0.12.1.tar
      docker load < tekton-pipeline-gcs-fetcher-v0.12.1.tar
      docker load < tekton-pipeline-webhook-v0.12.1.tar
      docker load < tekton-pipeline-tianon-true-v0.12.1.tar
      docker load < tekton-pipeline-busybox-v0.12.1.tar
      docker load < tekton-pipeline-google-cloud-sdk-v0.12.1.tar
      `;
    } else {
      gitPullCommand += `
      docker pull gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/controller:v0.12.1@sha256:0ca86ec6f246f49c1ac643357fd1c8e73a474aaa216548807b1216a9ff12f7be
      docker pull gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/kubeconfigwriter:v0.12.1@sha256:67dcd447b0c624befa12843ce9cc0bcfc502179bdb28d59563d761a7f3968509
      docker pull gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/creds-init:v0.12.1@sha256:6266d023172dde7fa421f626074b4e7eedc7d7d5ff561c033d6d63ebfff4a2f2
      docker pull gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/git-init:v0.12.1@sha256:d82c78288699dd6ee40c852b146cb3bd89b322b42fb3bc4feec28ea54bb7b36c
      docker pull gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.12.1@sha256:7f3db925f7660673a74b0e1030e65540adea36fe361ab7f06f5b5c47cdcef47d
      docker pull gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/imagedigestexporter:v0.12.1@sha256:e8f08214baad9054bbed7be2b8617c6964b9a1c5405cf59eabcc3d3267a6253f
      docker pull gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/pullrequest-init:v0.12.1@sha256:71e0226346e0d3d57af7c35b6cb907d42d3142e845b0f865ba0c86d3e248f3cb
      docker pull gcr.io/tekton-releases/github.com/tektoncd/pipeline/vendor/github.com/googlecloudplatform/cloud-builders/gcs-fetcher/cmd/gcs-fetcher:v0.12.1@sha256:ae5721bf0d883947c3c13f519ca26129792f4058d5f9dfedd50174d9e7acb2bc
      docker pull gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/webhook:v0.12.1@sha256:69f065d493244dbd50563b96f5474bf6590821a6308fd8c69c5ef06cf4d988b2
      docker pull tianon/true
      docker pull busybox
      docker pull google/cloud-sdk:289.0.0

      docker tag gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/controller:v0.12.1@sha256:0ca86ec6f246f49c1ac643357fd1c8e73a474aaa216548807b1216a9ff12f7be controller:v0.12.1
      docker tag gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/kubeconfigwriter:v0.12.1@sha256:67dcd447b0c624befa12843ce9cc0bcfc502179bdb28d59563d761a7f3968509 kubeconfigwriter:v0.12.1
      docker tag gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/creds-init:v0.12.1@sha256:6266d023172dde7fa421f626074b4e7eedc7d7d5ff561c033d6d63ebfff4a2f2 creds-init:v0.12.1
      docker tag gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/git-init:v0.12.1@sha256:d82c78288699dd6ee40c852b146cb3bd89b322b42fb3bc4feec28ea54bb7b36c git-init:v0.12.1
      docker tag gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/entrypoint:v0.12.1@sha256:7f3db925f7660673a74b0e1030e65540adea36fe361ab7f06f5b5c47cdcef47d entrypoint:v0.12.1
      docker tag gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/imagedigestexporter:v0.12.1@sha256:e8f08214baad9054bbed7be2b8617c6964b9a1c5405cf59eabcc3d3267a6253f imagedigestexporter:v0.12.1
      docker tag gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/pullrequest-init:v0.12.1@sha256:71e0226346e0d3d57af7c35b6cb907d42d3142e845b0f865ba0c86d3e248f3cb pullrequest-init:v0.12.1
      docker tag gcr.io/tekton-releases/github.com/tektoncd/pipeline/vendor/github.com/googlecloudplatform/cloud-builders/gcs-fetcher/cmd/gcs-fetcher:v0.12.1@sha256:ae5721bf0d883947c3c13f519ca26129792f4058d5f9dfedd50174d9e7acb2bc gcs-fetcher:v0.12.1
      docker tag gcr.io/tekton-releases/github.com/tektoncd/pipeline/cmd/webhook:v0.12.1@sha256:69f065d493244dbd50563b96f5474bf6590821a6308fd8c69c5ef06cf4d988b2 webhook:v0.12.1
      docker tag tianon/true tianon-true:v0.12.1
      docker tag busybox busybox:v0.12.1
      docker tag google/cloud-sdk:289.0.0 google-cloud-sdk:v0.12.1

      #docker save controller:v0.12.1 > tekton-pipeline-controller-v0.12.1.tar
      #docker save kubeconfigwriter:v0.12.1 > tekton-pipeline-kubeconfigwriter-v0.12.1.tar
      #docker save creds-init:v0.12.1 > tekton-pipeline-creds-init-v0.12.1.tar
      #docker save git-init:v0.12.1 > tekton-pipeline-git-init-v0.12.1.tar
      #docker save entrypoint:v0.12.1 > tekton-pipeline-entrypoint-v0.12.1.tar
      #docker save imagedigestexporter:v0.12.1 > tekton-pipeline-imagedigestexporter-v0.12.1.tar
      #docker save pullrequest-init:v0.12.1 > tekton-pipeline-pullrequest-init-v0.12.1.tar
      #docker save gcs-fetcher:v0.12.1 > tekton-pipeline-gcs-fetcher-v0.12.1.tar
      #docker save webhook:v0.12.1 > tekton-pipeline-webhook-v0.12.1.tar
      #docker save tianon-true:v0.12.1 > tekton-pipeline-tianon-true-v0.12.1.tar
      #docker save busybox:v0.12.1 > tekton-pipeline-busybox-v0.12.1.tar
      #docker save google-cloud-sdk:v0.12.1 > tekton-pipeline-google-cloud-sdk-v0.12.1.tar
      `;
    }
    return `
      ${gitPullCommand}
      docker tag controller:v0.12.1 $REGISTRY/controller:v0.12.1
      docker tag kubeconfigwriter:v0.12.1 $REGISTRY/kubeconfigwriter:v0.12.1
      docker tag creds-init:v0.12.1 $REGISTRY/creds-init:v0.12.1
      docker tag git-init:v0.12.1 $REGISTRY/git-init:v0.12.1
      docker tag entrypoint:v0.12.1 $REGISTRY/entrypoint:v0.12.1
      docker tag imagedigestexporter:v0.12.1 $REGISTRY/imagedigestexporter:v0.12.1
      docker tag pullrequest-init:v0.12.1 $REGISTRY/pullrequest-init:v0.12.1
      docker tag gcs-fetcher:v0.12.1 $REGISTRY/gcs-fetcher:v0.12.1
      docker tag webhook:v0.12.1 $REGISTRY/webhook:v0.12.1
      docker tag tianon-true:v0.12.1 $REGISTRY/tianon-true:v0.12.1
      docker tag busybox:v0.12.1 $REGISTRY/busybox:v0.12.1
      docker tag google-cloud-sdk:v0.12.1 $REGISTRY/google-cloud-sdk:v0.12.1

      docker push $REGISTRY/controller:v0.12.1
      docker push $REGISTRY/kubeconfigwriter:v0.12.1
      docker push $REGISTRY/creds-init:v0.12.1
      docker push $REGISTRY/git-init:v0.12.1
      docker push $REGISTRY/entrypoint:v0.12.1
      docker push $REGISTRY/imagedigestexporter:v0.12.1
      docker push $REGISTRY/pullrequest-init:v0.12.1
      docker push $REGISTRY/gcs-fetcher:v0.12.1
      docker push $REGISTRY/webhook:v0.12.1
      docker push $REGISTRY/tianon-true:v0.12.1
      docker push $REGISTRY/busybox:v0.12.1
      docker push $REGISTRY/google-cloud-sdk:v0.12.1
      #rm -rf $HOME;
      `;
  }

  private _getImagePathEditScript(): string {
    // git guide에 내용 보기 쉽게 변경해놓음 (공백 유지해야함)
    return `
    cd ~/${TektonPipelineInstaller.INSTALL_HOME};
    export REGISTRY=${this.env.registry};
    cp tekton-pipeline-v0.12.1.yaml updated.yaml
    sed -i -E "s/gcr.io\\/tekton-releases\\/.*\\/([^@]*)@[^\\n\\"]*/$REGISTRY\\/\\1/g" updated.yaml
    sed -i "s/tianon\\/true@[^\\n\\"]*/$REGISTRY\\/tianon-true:v0.12.1/g" updated.yaml
    sed -i "s/busybox@[^\\n\\"]*/$REGISTRY\\/busybox:v0.12.1/g" updated.yaml
    sed -i "s/google\\/cloud-sdk@[^\\n\\"]*/$REGISTRY\\/google-cloud-sdk:v0.12.1/g" updated.yaml
    `;
  }
}
