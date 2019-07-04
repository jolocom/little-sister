import React from 'react'
import { NavigatorContainer } from 'src/NavigatorContainer'
import { shallow } from 'enzyme'
import { RootState } from 'src/reducers/'
import {routeList} from '../../../src/routeList'
const {
  createReactNavigationReduxMiddleware,
} = require('react-navigation-redux-helpers')

describe('NavigatorContainer', () => {
  const COMMON_PROPS: NavigatorContainer['props'] = {
    goBack: jest.fn(),
    navigation: {
      index: 0,
      routes: [{ routeName: 'Home' }],
    },
    deepLinkLoading: false,
    initApp: jest.fn(),
    handleDeepLink: jest.fn(),
    checkIfAccountExists: jest.fn(),
    dispatch: jest.fn(),
  }

  it('mounts correctly and matches snapshot', () => {
    createReactNavigationReduxMiddleware(
      'root',
      (state: RootState) => state.navigation,
    )
    const navigation = {
      index: 0,
      routes: [{ routeName: 'Home' }],
      navigate: jest.fn(),
    }

    const props: NavigatorContainer['props'] = { ...COMMON_PROPS, navigation }

    const rendered = shallow(<NavigatorContainer { ...props } />)
    expect(rendered).toMatchSnapshot()
  })

  it('correctly hides bottom action bar', () => {
    createReactNavigationReduxMiddleware(
      'root',
      (state: RootState) => state.navigation,
    )
    const navigation = {
      index: 0,
      routes: [{ routeName: routeList.Landing}],
      navigate: jest.fn(),
    }
    const landingPageProps = { ...COMMON_PROPS, navigation }

    const rendered = shallow(<NavigatorContainer {...landingPageProps} />)
    expect(rendered).toMatchSnapshot()
  })
})
