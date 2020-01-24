import * as React from 'react'
import { StyleSheet, Text } from 'react-native'
import { Container } from '../../structure'
import { GradientButton } from '../../structure/gradientButton'
import { Colors } from '../../../styles'

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.baseBlack,
    justifyContent: 'space-around',
    alignItems: 'stretch',
  },
  title: {
    color: Colors.white080,
    fontSize: 34,
    textAlign: 'center',
  },
  info: {
    color: Colors.white080,
    textAlign: 'center',
  },
  error: {
    color: Colors.error,
    textAlign: 'center',
  },
  textButton: {
    color: Colors.white,
    fontSize: 20,
    textAlign: 'center',
  },
})

interface Props {
  importBackup: () => void
  skip: () => void
  error: string
}

const ImportBackupComponent = ({ importBackup, skip, error }: Props) => (
  <Container style={styles.container}>
    <Text style={styles.title}>{'Import backup'}</Text>
    <Text style={styles.info}>
      We couldn't find a backup in the jolocom backup service. Please import
      your manual backup file.
    </Text>
    <GradientButton onPress={importBackup} text={'Import backup'} />
    <Text style={styles.error}>{error}</Text>
    <Text style={styles.textButton} onPress={skip}>
      Skip
    </Text>
  </Container>
)

export default ImportBackupComponent
