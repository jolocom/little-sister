[![Dependency Status](https://david-dm.org/jolocom/smartwallet-app/develop.svg)](https://david-dm.org/jolocom/smartwallet-app/develop)[![Build Status](https://travis-ci.org/jolocom/smartwallet-app.svg?branch=develop)](https://travis-ci.org/jolocom/smartwallet-app)

Jolocom SmartWallet - An application to manage your digital identity.

Interested in our vision? Take a look at our [whitepaper](https://jolocom.io/wp-content/uploads/2018/07/Jolocom-Technical-WP-_-Self-Sovereign-and-Decentralised-Identity-By-Design-2018-03-09.pdf)

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/jolocom/SmartWallet)

Setup for development
---------------------

Setup requires Node.JS to be installed on your computer. If you do not have it please see:
https://nodejs.org/en/download/

## Installation

Prerequisites:
- [yarn](https://yarnpkg.com)

After cloning the smartwallet-app repository to a directory on your computer, enter the directory and run the following command:

```bash
yarn install
```

### Debug build on a device or simulator

#### Android

Please set up an Android development environment.

Then:

```bash
# 1. Bundle app with haul and start development server.
yarn bundle:android
# 2a. Install and run app on a connected device or simulator in one go. Use a second shell for this.
yarn install:android && yarn run:android
# 2b. As alternative use:
react-native run-android
```
In case you encounter connectivity errors to haul, restart it with the first command or start the app manually after haul.

#### iOS

Please set up the appropriate XCode development environment.

Then:

```bash
react-native run-ios --device
yarn ios
```

The first command will run and install a debug build on an attached iOS device. A terminal window may pop up which starts a Metro Bundler, please stop this process.
The second command will start the Haul bundler and serve the build on your device if both are running on the same network. If remote debugging is enabled, the debugger-ui will also be available here.

#### Testing and Cleaning

Testing uses Jest. The following script enables watch and testing coverage display as well.

```bash
yarn test --watch --coverage
```
Use ```yarn run``` to display all scripts, e.g. for cleaning.

Documentation
-------------
Additional documentation can be found at our [wiki](https://github.com/jolocom/smartwallet-app/wiki).

Copyright (C) 2014-2018  JOLOCOM GmbH
