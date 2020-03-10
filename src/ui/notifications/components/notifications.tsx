import React from 'react'
import {
  LayoutChangeEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { fontBold, fontMain, fontMedium } from '../../../styles/typography'
import { black, white, yellowError } from '../../../styles/colors'
import { Notification, NotificationType } from '../../../lib/notifications'
import { AnyAction } from 'redux'
import { BP } from '../../../styles/breakpoints'

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  bottomPadding: {
    paddingBottom: BP({
      small: 12,
      medium: 12,
      large: 15,
    }),
  },
  title: {
    fontFamily: fontMedium,
    fontSize: BP({
      small: 16,
      medium: 16,
      large: 18,
    }),
    marginTop: BP({
      small: 12,
      medium: 16,
      large: 20,
    }),
    marginHorizontal: 20,
  },
  message: {
    fontFamily: fontMain,
    fontSize: BP({
      small: 12,
      medium: 12,
      large: 14,
    }),
    color: white,
    marginHorizontal: 20,
    marginTop: 8,
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dismissButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },
  buttonWrapper: {
    paddingHorizontal: 20,
    paddingVertical: BP({
      large: 15,
      medium: 12,
      small: 12,
    }),
    minWidth: 100,
  },
  button: {
    height: 27,
    borderRadius: 6.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 17,
  },
  buttonText: {
    fontSize: 12,
  },
  warningButton: {
    backgroundColor: '#f3c61c',
  },
  infoButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: white,
  },
})

interface Props {
  notification: Notification
  onPressDismiss: () => void | boolean | AnyAction | Promise<void | AnyAction>
  onPressInteract: () => void | boolean | AnyAction | Promise<void | AnyAction>
  isSticky: boolean | undefined
  onButtonLayout?: (event: LayoutChangeEvent) => void
}

export const NotificationComponent: React.FC<Props> = ({
  notification,
  onPressInteract,
  isSticky,
  onButtonLayout,
}) => {
  const isWarning = notification.type === NotificationType.warning
  const isTextCentered = isSticky || !notification.interact

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity
        activeOpacity={isSticky ? 0.7 : 1}
        {...((isSticky || !notification.interact) && {
          style: styles.bottomPadding,
        })}
        {...(isSticky && { onPress: onPressInteract })}
      >
        <Text
          style={{
            ...styles.title,
            ...(isTextCentered && styles.centeredText),
            color: isSticky ? yellowError : white,
          }}
        >
          {notification.title}
        </Text>
        <Text
          style={{
            ...styles.message,
            ...(isTextCentered && styles.centeredText),
          }}
        >
          {notification.message}
        </Text>
        {!isSticky && notification.interact && (
          <View style={styles.buttonSection}>
            {notification.interact && (
              <TouchableOpacity
                onLayout={onButtonLayout}
                style={styles.buttonWrapper}
                onPress={onPressInteract}
              >
                <View
                  style={{
                    ...styles.button,
                    ...(isWarning ? styles.warningButton : styles.infoButton),
                  }}
                >
                  <Text
                    style={{
                      ...styles.buttonText,
                      fontFamily: isWarning ? fontBold : fontMedium,
                      color: isWarning ? black : white,
                    }}
                  >
                    {notification.interact.label}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  )
}
