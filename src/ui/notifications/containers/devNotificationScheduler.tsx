import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { ThunkDispatch } from '../../../store'
import {
  createInfoNotification,
  createStickyNotification,
  createWarningNotification,
  Notification,
  NotificationType,
} from '../../../lib/notifications'
import { scheduleNotification } from '../../../actions/notifications'
import { connect } from 'react-redux'
import { Wrapper, JolocomButton } from '../../structure'
import { NavigationInjectedProps } from 'react-navigation'
import { debug } from '../../../styles/presets'
import { RootState } from '../../../reducers'
import { fontMain } from '../../../styles/typography'
import { blackMain } from '../../../styles/colors'
import { ToggleSwitch } from '../../structure/toggleSwitch'

const styles = StyleSheet.create({
  topSection: {
    paddingTop: '10%',
    flex: 0.9,
    width: '100%',
    justifyContent: 'flex-start',
    ...debug,
  },
  buttonSection: {
    flex: 0.1,
    ...debug,
  },
  inputs: {
    paddingHorizontal: 20,
  },
  config: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  configText: {
    fontFamily: fontMain,
    color: blackMain,
    fontSize: 16,
  },
  notification: {
    width: '100%',
  },
})

interface Props
  extends NavigationInjectedProps,
    ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

const DevNotificationScheduler = (props: Props) => {
  const { showNotification, notificationQueue } = props

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [interact, setInteract] = useState(false)
  const [interactLabel, setInteractLabel] = useState('')
  const [warning, setWarning] = useState(false)
  const [sticky, setSticky] = useState(false)

  const defaultNotification = {
    type: NotificationType.info,
    title: 'Default Notification',
    message: 'An example of a notification that does nothing exceptional',
  }

  const creator = sticky
    ? createStickyNotification
    : warning
    ? createWarningNotification
    : createInfoNotification

  const assembledNotification = creator({
    title,
    message,
    ...(interact && {
      interact: {
        label: interactLabel,
        onInteract: () => false,
      },
    }),
    ...(sticky && {
      interact: {
        label: 'none',
        onInteract: () => false,
      },
    }),
  })

  const onPress = () => {
    if (!title.length && !message.length) {
      showNotification(createInfoNotification(defaultNotification))
    } else {
      showNotification(assembledNotification)
    }
  }

  return (
    <Wrapper>
      <View style={styles.topSection}>
        <View style={styles.inputs}>
          <TextInput
            value={title}
            style={{
              fontSize: 16,
              fontFamily: fontMain,
              borderBottomWidth: 1,
              borderBottomColor: blackMain,
            }}
            placeholder={'Notification title...'}
            onChangeText={setTitle}
          />
          <TextInput
            value={message}
            placeholder={'Notification message...'}
            onChangeText={setMessage}
            style={{
              padding: 4,
              marginTop: 10,
              fontSize: 14,
              fontFamily: fontMain,
              borderWidth: 1,
              borderColor: blackMain,
            }}
            numberOfLines={3}
            multiline={true}
            textAlignVertical={'top'}
          />
          {interact && (
            <TextInput
              value={interactLabel}
              style={{
                marginTop: 10,
                fontSize: 16,
                minWidth: 60,
                height: 40,
                fontFamily: fontMain,
                borderColor: blackMain,
                borderWidth: 1,
                borderRadius: 10,
                alignSelf: 'flex-end',
              }}
              placeholder={'Label'}
              onChangeText={setInteractLabel}
            />
          )}
        </View>
        <View
          style={{
            width: '100%',
            paddingVertical: 10,
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
          <View style={styles.config}>
            <ToggleSwitch
              value={interact}
              onToggle={() => setInteract(!interact)}
            />
            <Text style={styles.configText}>{'Interact'}</Text>
          </View>
          <View style={styles.config}>
            <ToggleSwitch value={sticky} onToggle={() => setSticky(!sticky)} />
            <Text style={styles.configText}>{'Sticky'}</Text>
          </View>
          <View style={styles.config}>
            <ToggleSwitch
              value={warning}
              onToggle={() => setWarning(!warning)}
            />
            <Text style={styles.configText}>{'Warning'}</Text>
          </View>
        </View>
        <View
          style={{ width: '100%', paddingVertical: 50, alignItems: 'center' }}>
          <Text style={[styles.configText, { fontSize: 30 }]}>Queue</Text>
          <Text style={[styles.configText, { fontSize: 30 }]}>
            {notificationQueue.length}
          </Text>
        </View>
      </View>
      <View style={styles.buttonSection}>
        <JolocomButton onPress={onPress} text={'Schedule notification'} />
      </View>
    </Wrapper>
  )
}

const mapStateToProps = (state: RootState) => ({
  notificationQueue: state.notifications.queue,
})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  showNotification: (notification: Notification) =>
    dispatch(scheduleNotification(notification)),
})

export const NotificationScheduler = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DevNotificationScheduler)
