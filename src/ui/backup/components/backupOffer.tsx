import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Wrapper } from '../../structure'
import { Colors } from '../../../styles'
import { JolocomButton } from '../../structure'
import { ActionSheet } from '../../structure/actionSheet'
import { fontMain } from '../../../styles/typography'
import { debug } from '../../../styles/presets'

interface Props {
  enableAutoBackup: () => void
  manualBackup: () => void
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.baseBlack,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  title: {
    color: Colors.white080,
    fontFamily: fontMain,
    fontSize: 22,
    textAlign: 'center',
    marginTop: 48,
    marginHorizontal: 38,
  },
  logoTitle: {
    color: Colors.white080,
    fontFamily: fontMain,
    fontSize: 22,
    textAlign: 'center',
    marginHorizontal: 70,
    marginTop: '6%',
  },
  info: {
    color: Colors.white050,
    fontFamily: fontMain,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  imageWrapper: {
    flex: 1,
    marginVertical: 30,
    marginHorizontal: 38,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...debug,
  },
  iconPlaceholder: {
    marginTop: '24%',
    width: 130,
    height: 130,
    ...debug,
  },
})
export const BackupOfferComponent: React.FC<Props> = ({
  enableAutoBackup,
  manualBackup,
}) => {
  return (
    <Wrapper style={styles.wrapper}>
      <Text style={styles.title}>
        Store your data by yourself or try to use Jolocom backup service!
      </Text>
      <View style={styles.imageWrapper}>
        <View style={styles.iconPlaceholder} />
        <Text style={styles.logoTitle}>Automatic synchronization</Text>
      </View>
      <ActionSheet showSlide={true}>
        <JolocomButton
          onPress={enableAutoBackup}
          text={'Turn on backup service'}
        />
        <Text style={styles.info}>
          By clicking here i agreed backing up my data on Jolocom’s central
          server server and i know that it is not viewable by anyone
        </Text>
        <JolocomButton
          transparent
          containerStyle={{ marginTop: 10 }}
          onPress={manualBackup}
          text={'Keep it manually'}
        />
      </ActionSheet>
    </Wrapper>
  )
}
