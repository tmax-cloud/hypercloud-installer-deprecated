## Install

- **If you have installation or compilation issues with this project, please see [our debugging guide](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/400)**

First, clone the repo via git and install dependencies:

('yarn' and 'npm' must be installed!!)

```bash
git clone --depth 1 --single-branch https://github.com/tmax-cloud/hypercloud-installer.git your-project-name
cd your-project-name
yarn
```

## Starting Development

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
yarn dev
```

## Packaging for Production

To package apps for the local platform:

window
```bash
yarn package-win
```

linux
```bash
sudo apt-get install rpm
yarn package-linux
```
