[![Dependency Status](https://david-dm.org/jolocom/smartwallet-app/develop.svg)](https://david-dm.org/jolocom/smartwallet-app/develop)[![Build Status](https://travis-ci.org/jolocom/smartwallet-app.svg?branch=develop)](https://travis-ci.org/jolocom/smartwallet-app)

Jolocom SmartWallet - An application to manage your digital identity.

Interested in our vision? Take a look at our [whitepaper](https://jolocom.io/wp-content/uploads/2019/12/Jolocom-Whitepaper-v2.1-A-Decentralized-Open-Source-Solution-for-Digital-Identity-and-Access-Management.pdf)

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/jolocom/SmartWallet)

## Prerequisites

- Set-up requires [Node.js](https://nodejs.org/en/download/) to be installed on your computer.
  - Starting with version `1.2.0` of the Jolocom SmartWallet, `Node.js v10+` is required to build the project. Versions prior to `1.2.0` require `Node.js v8`.
- We use [Yarn](https://yarnpkg.com) as our package manager.

## Installation

1. Clone the smartwallet-app repository to your computer.
2. `cd` into the directory and run `yarn` or `yarn install` from your terminal to install the required packages.

### Running a debug version for development

#### Android

- Please set up an Android development environment and install the required SDKs.
  - The [Getting Started](https://facebook.github.io/react-native/docs/getting-started) guide for React Native may come in handy.
  - Look for the instructions under React Native CLI Quickstart.
- Connect an Android device and enable USB debugging **OR** start an Android AVD emulator
- Run `yarn run:android` to install the application and run it.
  - NOTE: this will start a metro bundler server automatically, with stdout/stderr discarded. You can close this and run `yarn start` to manually start the bundler and receive more detailed output.

### iOS

- Please set up an appropriate Xcode development environment.
  - The [Getting Started](https://facebook.github.io/react-native/docs/getting-started) guide for React Native may come in handy.
  - Look for the instructions under React Native CLI Quickstart.
- Run `yarn build:ios` to assemble the application bundle.
- Run `yarn run:ios` to install and run the application in an emulator.
  - This will default to an iPhone X emulator.
  - The device can be specified by adding `--simulator` and the device name.
    - e.g. `yarn run:ios --simulator "iPhone SE"`
  - NOTE: this will start a metro bundler server automatically, with stdout/stderr discarded. You can close this and run `yarn start` to manually start the bundler and receive more detailed output.

A debug build can also be built through Xcode.

Running a build on a physical device requires the appropriate code signing certificates.

## Testing

We use Jest for unit tests, and [detox](https://github.com/wix/Detox) + Jest for end-to-end tests.

To run unit tests, with watch and testing coverage display enabled:
```bash
yarn test --watch --coverage
```

To run e2e tests, first make sure to start a bundling server using `yarn start`

To run e2e tests on device:
```bash
yarn e2e:android
```

To run e2e tests on emulator/simulator:
```bash
yarn e2e:android:emu
yarn e2e:ios:sim
```

## Code Style and Formatting

- We use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) to keep a consistent style across the codebase.
  - There are plugins available for a range of IDEs and text editors; automatic formatting on save is also supported in some editors.
- `yarn format` will format files automatically as much as possible.

Copyright (C) 2014-2019 JOLOCOM GmbH
