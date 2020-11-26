/* eslint-disable class-methods-use-this */
import AbstractCentosScript from './AbstractCentosScript';
import { InterfaceHyperAuthInstall } from './InterfaceHyperAuthInstall';

export default class CentosHyperAuthScript extends AbstractCentosScript
  implements InterfaceHyperAuthInstall {
  createSslCert() {
    const openSslCnfPath = '/etc/pki/tls/openssl.cnf';
    return `
    openssl req -newkey rsa:4096 -nodes -sha256 -keyout hyperauth.key -x509 -subj "/C=KR/ST=Seoul/O=tmax/CN=$(kubectl describe service hyperauth -n hyperauth | grep 'LoadBalancer Ingress' | cut -d ' ' -f7)" -days 365 -config <(cat ${openSslCnfPath} <(printf "[v3_ca]\nsubjectAltName=IP:$(kubectl describe service hyperauth -n hyperauth | grep 'LoadBalancer Ingress' | cut -d ' ' -f7)")) -out hyperauth.crt;
    kubectl create secret tls hyperauth-https-secret --cert=./hyperauth.crt --key=./hyperauth.key -n hyperauth;
    cp hyperauth.crt /etc/kubernetes/pki/hyperauth.crt;
    `;
  }
}
