import React from 'react'
import {
  Emoji,
  EmojiButton,
  EmojiSection,
} from '../../../../src/ui/errors/components/emojiSection'
import { shallow } from 'enzyme'
import { View } from 'react-native'

describe('EmojiSection Component', () => {
  const defaultProps = {
    selectedEmoji: Emoji.Empty,
    setEmoji: jest.fn(),
  }

  const defaultButtonProps = {
    emoji: Emoji.Shit,
    isSelected: false,
    onPress: jest.fn(),
    areAnySelected: false,
  }

  it('matches the snapshot on initial render', () => {
    const component = shallow(<EmojiSection {...defaultProps} />)
    expect(component).toMatchSnapshot()
  })

  it('renders the emojis when one is selected', () => {
    const props = { ...defaultProps, selectedEmoji: Emoji.Shit }
    const component = shallow(<EmojiSection {...props} />)
    expect(component).toMatchSnapshot()
  })

  it('matches the snapshot to initial EmojiButton render', () => {
    const component = shallow(<EmojiButton {...defaultButtonProps} />)
    expect(component).toMatchSnapshot()
  })

  it('renders selected emoji button', () => {
    const props = {
      ...defaultButtonProps,
      isSelected: true,
      areAnySelected: true,
    }
    const component = shallow(<EmojiButton {...props} />)
    expect(component).toMatchSnapshot()
  })

  it('calls onPress when Emoji is pressed', () => {
    const component = shallow(<EmojiButton {...defaultButtonProps} />)
    component.find(View).simulate('touchEnd')
    expect(defaultButtonProps.onPress).toBeCalledTimes(1)
  })
})
