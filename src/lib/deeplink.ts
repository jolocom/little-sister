
import { SendResponse } from './transportLayers'
import { Linking } from 'react-native'

export const respond: SendResponse =
  token =>
    Linking.canOpenURL(token.interactionToken.callbackURL).then(async (can) =>
    can && await Linking.openURL(`${token.interactionToken.callbackURL}${token}`))
