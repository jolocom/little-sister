import React from 'react'
import { View, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export interface DocumentViewToggleProps {
  showingValid: boolean
  handlePress: () => void
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  bar: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    borderRadius: 4,
  },
  barValid: {
    backgroundColor: 'rgba(233, 239, 221, 0.57)',
  },
  barExpired: {
    backgroundColor: 'rgba(255, 222, 188, 0.25)',
  },
  icon: {
    color: 'rgba(5, 5, 13, 0.48)',
    marginRight: 8,
  },
  iconExpired: {
    color: 'rgba(5, 5, 13, 0.48)',
    fontSize: 17,
    fontFamily: JolocomTheme.contentFontFamily,
    fontWeight: 'bold',
    marginRight: 8,
  },
  text: {
    color: 'rgba(5, 5, 13, 0.48)',
    fontSize: 17,
    fontFamily: JolocomTheme.contentFontFamily,
  },
  underline: {
    textDecorationLine: 'underline',
  },
})

export const DocumentViewToggle: React.SFC<DocumentViewToggleProps> = (
  props,
): JSX.Element => (
  <TouchableWithoutFeedback onPress={props.handlePress}>
    <View style={styles.container}>
      {props.showingValid ? (
        <View style={[styles.bar, styles.barValid]}>
          <Icon style={styles.icon} size={17} name="check-all" />
          <Text style={styles.text}>
            Showing valid.{' '}
            <Text style={styles.underline}>Tap to show expired.</Text>
          </Text>
        </View>
      ) : (
        <View style={[styles.bar, styles.barExpired]}>
          <Icon style={styles.icon} size={17} name="alert-circle-outline" />
          <Text style={styles.text}>
            Showing expired.{' '}
            <Text style={styles.underline}>Tap to show valid.</Text>
          </Text>
        </View>
      )}
    </View>
  </TouchableWithoutFeedback>
)
