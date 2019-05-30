import React from 'react'
import {
  StyleSheet,
  View,
  TextStyle,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import {
  ClaimCard,
  PlaceholderClaimCard,
  CollapsedCredentialCard,
} from 'src/ui/sso/components/claimCard'
import { ReactNode } from 'react-redux'
import { DecoratedClaims } from 'src/reducers/account'
import I18n from 'src/locales/i18n'
import {values, all, isEmpty} from 'ramda'

interface Props {
  handleInteraction?: (event: GestureResponderEvent) => void
  credentialItem: DecoratedClaims
  collapsible?: boolean
  leftIcon: ReactNode
  rightIcon?: ReactNode
  containerStyle?: ViewStyle
  claimCardStyle?: {
    primaryText?: TextStyle
    secondaryText?: TextStyle
  }
}

interface State {
  collapsed: boolean
}

export class CredentialCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      collapsed: props.collapsible || false,
    }
  }

  private getStyles = () =>
    StyleSheet.create({
      defaultContainerStyle: {
        flexDirection: 'row',
        backgroundColor: JolocomTheme.primaryColorWhite,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: 'rgb(236, 236, 236)',
      },
    })

  private toggleCollapse = () => {
    if (this.props.collapsible) {
      this.setState({ collapsed: !this.state.collapsed })
    }
  }

  private renderClaim = (credentialItem: DecoratedClaims) => {
    const { handleInteraction } = this.props
    const { credentialType, claimData } = credentialItem
    const onEdit = handleInteraction || (() => {})

    const isBlank = all(isEmpty, values(claimData))
    if (isBlank) {
      return (
        <PlaceholderClaimCard onEdit={onEdit} credentialType={credentialType} />
      )
    }
    return Object.keys(claimData).map(key => (
      <ClaimCard
        key={key}
        primaryText={I18n.t(claimData[key])}
        secondaryText={I18n.t(key)}
      />
    ))
  }

  private renderCollapsedClaim = (credentialItem: DecoratedClaims) => (
    <CollapsedCredentialCard
      title={I18n.t(credentialItem.credentialType)}
      values={Object.keys(credentialItem.claimData).map(
        k => credentialItem.claimData[k],
      )}
    />
  )

  render() {
    const { credentialItem, containerStyle, leftIcon, rightIcon } = this.props
    const { collapsed } = this.state
    const { defaultContainerStyle } = this.getStyles()

    return (
      <View
        style={[
          StyleSheet.flatten(defaultContainerStyle),
          containerStyle || {},
        ]}
      >
        <View flex={0.2} alignItems={'center'}>
          {leftIcon}
        </View>
        <View onTouchEnd={this.toggleCollapse} flex={0.7} overflow={'scroll'}>
          {collapsed
            ? this.renderCollapsedClaim(credentialItem)
            : this.renderClaim(credentialItem)}
        </View>
        <View flex={0.1} onTouchEnd={this.props.handleInteraction}>
          {rightIcon || null}
        </View>
      </View>
    )
  }
}
