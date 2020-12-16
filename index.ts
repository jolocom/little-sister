// disable react-native warning boxes
console.disableYellowBox = true

import { initErrorReporting } from './src/lib/errors'
initErrorReporting()

// This import needs to remain here due to tremendous amounts of unpaid
// Tech Debt between react-native and react-navigation and react-native-screens
// and react-native-gesture-handler....
// If removed from here the application will crash about
// "onGestureHandlerStateChange" when using gestures to dismiss
//
// https://github.com/software-mansion/react-native-gesture-handler/pull/792#issuecomment-661834769
import 'react-native-gesture-handler'

import { AppRegistry } from 'react-native'
import App from './src/App'

import { name as appName } from './app.json'

AppRegistry.registerComponent(appName, () => App)
