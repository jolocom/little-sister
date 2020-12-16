import React from 'react'
import { StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Typography, Colors } from 'src/styles'

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.lightGrey,
    flexDirection: 'row',
  },
  textContainer: {
    flex: 1,
  },
  headerText: {
    ...Typography.baseFontStyles,
    color: Colors.blackMain,
    fontSize: Typography.textLG,
  },
  headerTextWithChildren: {
    fontSize: Typography.textXS,
  },
  description: {
    ...Typography.baseFontStyles,
    color: Colors.blackMain,
    fontSize: Typography.textXS,
  },
  yellowBg: {
    backgroundColor: Colors.backUpWarningBg,
  },
  whiteText: {
    color: Colors.white,
  },
  disabledText: {
    color: Colors.greyLighter,
  },
})

export interface SettingItemProps {
  title: string
  description?: string
  iconName: string
  isHighlighted?: boolean
  isDisabled?: boolean
  onPress?: () => void
}

const SettingItem: React.FC<SettingItemProps> = ({
  children,
  title,
  description,
  iconName,
  isHighlighted,
  isDisabled,
  onPress,
}) => (
  <TouchableWithoutFeedback onPress={!isDisabled ? onPress : undefined}>
    <View style={[styles.card, isHighlighted && styles.yellowBg]}>
      <Icon
        style={{ marginRight: 18 }}
        size={24}
        name={iconName}
        color={isHighlighted ? 'white' : 'grey'}
      />
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.headerText,
            !!children && styles.headerTextWithChildren,
            isHighlighted && styles.whiteText,
            isDisabled && styles.disabledText,
          ]}
        >
          {title}
        </Text>
        {children || (
          <Text
            style={[
              styles.description,
              isHighlighted && styles.whiteText,
              isDisabled && styles.disabledText,
            ]}
          >
            {description}
          </Text>
        )}
      </View>
    </View>
  </TouchableWithoutFeedback>
)

export default SettingItem
