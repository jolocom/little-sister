fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

# Available Actions
## iOS
### ios build
```
fastlane ios build
```

### ios upload
```
fastlane ios upload
```

### ios staging
```
fastlane ios staging
```
Install a release build on an iOS device
### ios beta
```
fastlane ios beta
```
Submit a new beta build to TestFlight
### ios release
```
fastlane ios release
```
Submit a new release build to the App Store

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
