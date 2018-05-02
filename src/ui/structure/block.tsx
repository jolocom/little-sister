import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ReactNode } from 'react'

const styles = StyleSheet.create({
  block: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
	debug: {
	  borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
	}
})

interface Props {
  children: ReactNode;
	flex?: number;
	debug?: boolean;
  style?: ViewStyle;
}

export const Block : React.SFC<Props> = (props) => {
	const style = [styles.block, props.style]
	if (props.debug) {
		style.push(styles.debug)
	}

	if (props.flex) {
		style.push({flex: props.flex})
	}

  return(
    <View style={ style }>
      {props.children}
    </View>
  )
}
