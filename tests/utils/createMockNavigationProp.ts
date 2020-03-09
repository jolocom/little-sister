import { stub, RecursivePartial } from './stub'
import {
  NavigationState,
  NavigationProp,
  //NavigationRoute,
  NavigationParams,
  NavigationScreenProp,
  NavigationRoute,
} from 'react-navigation'

type NavigationScreenPropType<P=NavigationParams> = NavigationScreenProp<NavigationRoute<P>, P>

export function createMockNavigationScreenProp(
  navigation: RecursivePartial<NavigationProp<NavigationState>>,
): NavigationScreenPropType {
  return stub<NavigationScreenPropType>({
    ...navigation,
    // @ts-ignore wtf
    getParam: (key: string, def: any) =>
      (navigation.state &&
        navigation.state.params &&
        navigation.state.params[key]) ||
      def,
  })
}
