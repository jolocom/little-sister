import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { ReactNode } from 'react'
import { JolocomTheme } from '../../styles/jolocom-theme'

const styles = StyleSheet.create({
  header: {
    marginTop: '8%',
    marginRight: '5%',
    marginBottom: '3%',
    marginLeft:'5%'
  },
  title: {
    flexWrap: 'wrap',
    textAlign: 'center',
    justifyContent: 'center',
    color: JolocomTheme.textStyles.headline.color,
    fontSize: JolocomTheme.textStyles.headline.fontSize,
    fontWeight: JolocomTheme.textStyles.headline.fontWeight,
    margin: 0
  }
})

interface Props {
  children?: ReactNode;
  style?: ViewStyle;
  title?: string;
}

export const Header : React.SFC<Props> = (props) => {
  let renderTitle
  if (props.title) {
    renderTitle = <Text style={styles.title}>{props.title}</Text>
  }
  return(
    <View style={ [styles.header, props.style] }>
      {renderTitle}
      {props.children}
    </View>
  )
}
