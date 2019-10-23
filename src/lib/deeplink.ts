
import { Linking } from 'react-native'

export const respond = (onFinish: () => Promise<any>) => (url: string, token: string) => Linking
    .canOpenURL(url)
    .then(can => can ? Linking.openURL(`${url}${token}`).then(onFinish)
        : Promise.reject('Cant deep link to that url'))
