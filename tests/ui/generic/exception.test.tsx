import React from 'react'
import { shallow } from 'enzyme'
import { ExceptionComponent } from 'src/ui/generic/exception'
import { routeList } from 'src/routeList'
import { AppError } from 'src/lib/errors'
import { createMockNavigationScreenProp } from 'tests/utils'
import { JolocomButton } from 'src/ui/structure'

describe('Exception screen component', () => {
  it('Renders correctly', () => {
    const props = {
      navigateBack: jest.fn(),
      navigateReporting: jest.fn(),
      navigation: createMockNavigationScreenProp({
        state: {
          params: {
            returnTo: routeList.Home,
            error: new AppError(),
            flag: 'default',
          },
        },
      }),
      errorTitle: 'Uh oh',
    }

    const rendered = shallow(<ExceptionComponent {...props} />)
    expect(rendered).toMatchSnapshot()
  })

  it('Renders correctly when no error object is provided', () => {
    const props = {
      navigateBack: jest.fn(),
      navigateReporting: jest.fn(),
      navigation: createMockNavigationScreenProp({
        state: {
          params: {
            returnTo: routeList.Home,
            stackTrace: undefined,
          },
        },
      }),
      errorTitle: 'Uh oh',
    }

    const rendered = shallow(<ExceptionComponent {...props} />)
    expect(rendered).toMatchSnapshot()
  })

  it('Goes back to the screen described in returnTo', () => {
    const returnTo = routeList.InteractionScreen
    const props = {
      navigateBack: jest.fn(),
      navigateReporting: jest.fn(),
      navigation: createMockNavigationScreenProp({
        state: {
          params: {
            returnTo,
          },
        },
      }),
    }

    const rendered = shallow(<ExceptionComponent {...props} />)
    rendered.find(JolocomButton).simulate('press')
    expect(props.navigateBack).toHaveBeenCalledWith(returnTo)
  })
})
