import React, { useContext } from 'react';
import {
  Button,
  Select,
  FormControl,
  InputLabel,
  TextField
} from '@material-ui/core';
import { KubeInstallContext } from './InstallContentsKubernetes';
import CONST from '../constants/constant';
import routes from '../constants/routes.json';

function InstallContentsKubernetes2() {
  const kubeInstallContext = useContext(KubeInstallContext);
  const { kubeInstallState, dispatchKubeInstall } = kubeInstallContext;

  const [version, setVersion] = React.useState(kubeInstallState.version);
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setVersion(event.target.value as string);
  };

  const [registry, setRegistry] = React.useState('');

  return (
    <div>
      <div>
        <div>
          <div className="left"><span>쿠버네티스 버전</span></div>
          <div>
            <FormControl variant="outlined">
              <InputLabel htmlFor="outlined-age-native-simple">Version</InputLabel>
              <Select
                native
                value={version}
                onChange={handleChange}
                label="Version"
                inputProps={{
                  name: 'age',
                  id: 'outlined-age-native-simple'
                }}
              >
                <option aria-label="None" value="" />
                <option value="1.17.3">1.17.3</option>
              </Select>
            </FormControl>
          </div>
        </div>
        <div>
          <div className="left"><span>도커 레지스트리 주소</span></div>
          <div>
            <TextField
              id="outlined"
              label="Registry"
              variant="outlined"
              size="small"
              value={registry}
              onChange={e => {
                setRegistry(e.target.value);
                // hasIpError(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <div>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            dispatchKubeInstall({
              version,
              registry,
              page: 3
            });
          }}
        >
          설치
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => {
            dispatchKubeInstall({
              page: 1
            });
          }}
        >
          취소
        </Button>
      </div>
    </div>
  );
}

export default InstallContentsKubernetes2;
