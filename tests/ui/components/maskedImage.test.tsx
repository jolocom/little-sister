import React from 'react'
import { shallow } from 'enzyme'
import { MaskedImageComponent } from 'src/ui/registration/components/maskedImage'

describe('MaskedImage component', () => {
  const props = {
    addPoint: (x: number, y: number) => null,
    disabled: false,
  }

  it('correctly calls the function to configure PanResponder on component mount', () => {
    const configureSpy = jest.spyOn(
      MaskedImageComponent.prototype,
      // @ts-ignore because getConfiguredPanResponder is private
      'getConfiguredPanResponder',
    )
    shallow(<MaskedImageComponent {...props} />)
    expect(configureSpy).toHaveBeenCalledTimes(1)
  })

  it('matches the snapshot with empty current path string', () => {
    const rendered = shallow(<MaskedImageComponent {...props} />)
    expect(rendered).toMatchSnapshot()
    expect(rendered.state().pathDs[0]).toEqual('')
  })

  it('correctly handles a gesture start', () => {
    const x = 191,
      y = 381,
      mockNativeEvent = {
        nativeEvent: {
          locationX: x,
          locationY: y,
        },
      }
    const rendered = shallow(<MaskedImageComponent {...props} />)
    const instance = rendered.instance()

    // @ts-ignore because handleDrawStart is private
    instance.handleDrawStart(mockNativeEvent)
    expect(rendered.state().pathDs[0]).toEqual(`M${x},${y}`)
  })

  it('correctly handles gesture continuation', () => {
    const x = 188,
      y = 381,
      mockNativeEvent = {
        nativeEvent: {
          locationX: x,
          locationY: y,
        },
      }

    const rendered = shallow(<MaskedImageComponent {...props} />)
    const instance = rendered.instance()

    // @ts-ignore because handleDraw is private
    instance.handleDraw(mockNativeEvent)
    expect(rendered.state().pathDs[0]).toEqual(`L${x},${y}`)
  })
})
