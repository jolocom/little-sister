import * as React from 'react'
import { StyleSheet, TextStyle, Text } from 'react-native'
import { ReactNode } from 'react'

const styles = StyleSheet.create({
  text: {
    width: '100%',
    textAlign: 'center',
    fontSize: 16
  }
})

interface Props {
  msg: string;
  style?: TextStyle;
}

export const CenteredText : React.SFC<Props> = (props) => {
  return(
    <Text style={ [styles.text, props.style] }>
      {props.msg}
    </Text>
  )
}
