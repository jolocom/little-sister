import { Text, View } from 'react-native'
import { styles } from '../styles'
import React from 'react'

interface Props {
  selectedEmoji: Emoji
  setEmoji: (emoji: Emoji) => void
}

export enum Emoji {
  Empty = '',
  Shit = '💩',
  Kiss = '😘',
  Facepalm = '🤦‍♀',
  Devil = '👿',
}

export const EmojiSection = (props: Props) => {
  const { selectedEmoji, setEmoji } = props
  const emojiList = [Emoji.Shit, Emoji.Kiss, Emoji.Facepalm, Emoji.Devil]
  return (
    <React.Fragment>
      <View style={styles.emojiWrapper}>
        {emojiList.map((emoji, key) => (
          <EmojiButton
            key={key}
            onPress={() => setEmoji(emoji)}
            isSelected={emoji === selectedEmoji}
            areAnySelected={emoji !== Emoji.Empty}
            emoji={emoji}
          />
        ))}
      </View>
    </React.Fragment>
  )
}

interface ButtonProps {
  emoji: Emoji
  isSelected: boolean
  areAnySelected: boolean
  onPress: () => void
}

export const EmojiButton = (props: ButtonProps) => {
  const { emoji, isSelected, areAnySelected, onPress } = props

  return (
    <View
      style={{
        ...styles.emojiButton,
        ...(areAnySelected &&
          (isSelected ? styles.selectedEmoji : styles.unselectedEmoji)),
      }}
      onTouchEnd={onPress}
    >
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  )
}
