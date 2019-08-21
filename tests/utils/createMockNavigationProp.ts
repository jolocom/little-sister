import { stub, RecursivePartial } from './stub'
import {
  NavigationState,
  NavigationScreenProp,
  NavigationProp,
  NavigationRoute,
  NavigationParams,
} from 'react-navigation'

type NavigationScreenPropType = NavigationScreenProp<
  NavigationRoute<NavigationParams>
>

export function createMockNavigationScreenProp(
  navigation: RecursivePartial<NavigationProp<NavigationState>>,
): NavigationScreenPropType {
  return stub<NavigationScreenPropType>({
    ...navigation,
    getParam: (key: string, def: any) =>
      (navigation.state &&
        navigation.state.params &&
        navigation.state.params[key]) ||
      def,
  })
}
