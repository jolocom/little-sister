import React from 'react'
import { Text, ScrollView, View, StyleSheet } from 'react-native'
import { Wrapper } from 'src/ui/structure'
import I18n from 'src/locales/i18n'
import {
  CredentialTypeSummary,
  CredentialVerificationSummary,
} from '@jolocom/sdk/js/interactionManager/types'
import { IssuerCard } from '../../documents/components/issuerCard'
import strings from '../../../locales/strings'
import { Typography, Colors, Spacing } from 'src/styles'
import { CredentialSectionCard } from './credentialsSectionCard'
import { ButtonSheet } from 'src/ui/structure/buttonSheet'
import { IdentitySummary } from '@jolocom/sdk'

interface Props {
  did: string
  requester: IdentitySummary
  availableCredentials: CredentialTypeSummary[]
  handleSubmitClaims: (credentials: CredentialVerificationSummary[]) => void
  handleDenySubmit: () => void
}

interface State {
  pending: boolean
  selectedCredentials: {
    [type: string]: CredentialVerificationSummary | undefined
  }
}

const styles = StyleSheet.create({
  topSection: {
    flex: 0.3,
    marginTop: Spacing.XL,
  },
  messageContainer: {
    marginTop: Spacing.LG,
    paddingHorizontal: '5%',
  },
  message: {
    ...Typography.subMainText,
    color: Colors.blackMain,
  },
  claimsSection: {
    marginTop: Spacing.MD,
    flex: 0.6,
    borderTopWidth: 1,
    borderColor: Colors.lightGrey,
  },
  credentialSection: {
    marginBottom: Spacing.MD,
  },
  buttonSection: {
    flex: 0.1,
  },
})

export class ConsentComponent extends React.Component<Props, State> {
  public state = {
    pending: false,
    selectedCredentials: this.props.availableCredentials.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.type]: acc[curr.type] || curr.verifications[0],
      }),
      {},
    ),
  }

  private handleClaimSelect = (
    type: string,
    selectedCredential: CredentialVerificationSummary,
  ) => {
    const selected = this.state.selectedCredentials[type]
    if (selected && selected.id === selectedCredential.id) {
      // deselect if selected claim is pressed
      this.setState({
        selectedCredentials: {
          ...this.state.selectedCredentials,
          [type]: undefined,
        },
      })
    } else {
      // set the pressed claim to be selected
      this.setState({
        selectedCredentials: {
          ...this.state.selectedCredentials,
          [type]: selectedCredential,
        },
      })
    }
  }

  private handleSubmitClaims = (): void => {
    const { selectedCredentials } = this.state
    const credentials: CredentialVerificationSummary[] = Object.keys(
      selectedCredentials,
    ).map(key => selectedCredentials[key])

    this.setState({ pending: true })
    this.props.handleSubmitClaims(credentials)
  }

  public render(): JSX.Element {
    const { selectedCredentials } = this.state
    const { availableCredentials, requester } = this.props

    // group credentials by type so they can be rendered in sections
    const groupedByType: {
      [key: string]: CredentialTypeSummary[]
    } = availableCredentials.reduce(
      (acc, current) =>
        acc[current.type]
          ? { ...acc, [current.type]: [...acc[current.type], current] }
          : { ...acc, [current.type]: [current] },
      {},
    )

    const submitAllowed = Object.keys(selectedCredentials).every(
      key => selectedCredentials[key] !== undefined,
    )
    const buttonDisabled = !submitAllowed || this.state.pending

    return (
      <Wrapper>
        <View style={styles.topSection}>
          <IssuerCard issuer={requester} />
          <View style={styles.messageContainer}>
            <Text style={styles.message}>
              {I18n.t(
                strings.THIS_SERVICE_IS_ASKING_YOU_TO_SHARE_THE_FOLLOWING_CLAIMS,
              )}
              :
            </Text>
          </View>
        </View>

        {/* claims to share, grouped in sections by type by type */}
        <View style={styles.claimsSection}>
          <ScrollView style={{ width: '100%' }}>
            {Object.keys(groupedByType).map(sectionType => (
              <View style={styles.credentialSection}>
                <CredentialSectionCard
                  did={this.props.did}
                  sectionType={sectionType}
                  credentials={groupedByType[sectionType]}
                  selectedCredential={
                    this.state.selectedCredentials[sectionType]
                  }
                  onPress={this.handleClaimSelect}
                />
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.buttonSection}>
          <ButtonSheet
            disabledConfirm={buttonDisabled}
            confirmText={strings.SHARE_CLAIMS}
            cancelText={strings.DENY}
            onCancel={this.props.handleDenySubmit}
            onConfirm={this.handleSubmitClaims}
          />
        </View>
      </Wrapper>
    )
  }
}
