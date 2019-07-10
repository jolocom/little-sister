import { AppRegistry } from 'react-native'

/**
 * Object.setPrototypeOf polyfill because typeorm (and possibly others) use it
 */

// @ts-ignore
if (!Object.setPrototypeOf) {
    // @ts-ignore
    Object.setPrototypeOf = function(obj, proto) {
        obj.__proto__ = proto
        return obj
    }
}

import App from 'src/App'

AppRegistry.registerComponent('jolocomwallet', () => App)
