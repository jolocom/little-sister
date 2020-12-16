import React from 'react'
import { NoPermissionComponent } from '../../../src/ui/interaction/component/noPermission'
import { shallow } from 'enzyme'
import { TouchableOpacity } from 'react-native'

describe('No scanner permission component', () => {
  const props = {
    onPressEnable: jest.fn(),
  }

  const noPermissionComponent = shallow(<NoPermissionComponent {...props} />)

  it('matches the snapshot on initial render', () => {
    expect(noPermissionComponent).toMatchSnapshot()
  })

  it('should call the onPressEnable prop when pressed', () => {
    // @ts-ignore
    noPermissionComponent
      .find(TouchableOpacity)
      .props()
      // @ts-ignore
      .onPress()

    expect(props.onPressEnable).toHaveBeenCalledTimes(1)
  })
})
