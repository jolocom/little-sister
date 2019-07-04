import React from 'react'
import { shallow } from 'enzyme'
import { ExceptionComponent } from 'src/ui/generic/exception'
import { routeList } from 'src/routeList'
import { AppError } from 'src/lib/errors'

describe('Exception screen component', () => {
  it('Renders correctly', () => {
    const props = {
      navigateBack: jest.fn(),
      navigation: {
        state: {
          params: {
            returnTo: routeList.Home,
            error: new AppError(),
            flag: 'default',
          },
        },
      },
      errorTitle: 'Uh oh',
    }

    const rendered = shallow(<ExceptionComponent {...props} />)
    expect(rendered).toMatchSnapshot()
  })

  it('Renders correctly when no error object is provided', () => {
    const props = {
      navigateBack: jest.fn(),
      navigation: {
        state: {
          params: {
            returnTo: routeList.Home,
            error: new AppError(),
            stackTrace: undefined,
          },
        },
      },
      errorTitle: 'Uh oh',
    }

    const rendered = shallow(<ExceptionComponent {...props} />)
    expect(rendered).toMatchSnapshot()
  })
})
