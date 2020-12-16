import React from 'react'
import { Modal, StatusBar } from 'react-native'
import { Colors } from './colors'

interface PropsI {
  onShow?: () => void
  isVisible: boolean
}

const LocalModal: React.FC<PropsI> = ({ onShow, children, isVisible }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      presentationStyle="overFullScreen"
      onShow={onShow}>
      <StatusBar
        backgroundColor={Colors.mainBlack}
        barStyle={'light-content'}
      />
      {children}
    </Modal>
  )
}

export default LocalModal
