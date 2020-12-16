import React, { useState } from 'react'
import { connect } from 'react-redux'
import { ThunkDispatch } from '../../../store'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import {
  withErrorScreen,
  withLoading,
  withInternet,
} from '../../../actions/modifiers'
import { Wrapper } from '../../structure'
import { ssoActions } from 'src/actions'
import { CredentialReceiveComponent } from '../components/credentialReceive'
import {
  InteractionSummary,
  SignedCredentialWithMetadata,
  CredentialOfferFlowState,
} from '@jolocom/sdk/js/interactionManager/types'
import { ButtonSheet } from 'src/ui/structure/buttonSheet'
import strings from 'src/locales/strings'

export interface CredentialOfferNavigationParams {
  interactionId: string
  interactionSummary: InteractionSummary
  invalidTypes: string[]
}

interface Props extends ReturnType<typeof mapDispatchToProps> {
  navigation: NavigationScreenProp<
    NavigationState,
    CredentialOfferNavigationParams
  >
}

export const CredentialsReceiveContainer = (props: Props) => {
  const [selected, setSelected] = useState<SignedCredentialWithMetadata[]>([])
  const { navigation, acceptSelectedCredentials, goBack } = props
  const {
    state: {
      // @ts-ignore
      params: { interactionSummary, interactionId, invalidTypes },
    },
  } = navigation

  const { publicProfile } = interactionSummary.initiator

  const handleConfirm = () => {
    acceptSelectedCredentials(selected, interactionId)
    setSelected([])
  }

  const toggleSelectDocument = (cred: SignedCredentialWithMetadata) => {
    setSelected(prevState =>
      isDocumentSelected(cred)
        ? prevState.filter(current => current !== cred)
        : [...prevState, cred],
    )
  }

  const isDocumentSelected = (offering: SignedCredentialWithMetadata) =>
    selected.includes(offering)

  return (
    <Wrapper withoutStatusBar>
      <CredentialReceiveComponent
        credentialOfferSummary={
          interactionSummary.state as CredentialOfferFlowState
        }
        invalidTypes={invalidTypes}
        publicProfile={publicProfile}
        isDocumentSelected={isDocumentSelected}
        onToggleSelect={toggleSelectDocument}
      />
      <ButtonSheet
        onConfirm={handleConfirm}
        confirmText={strings.RECEIVE}
        cancelText={strings.DENY}
        onCancel={goBack}
        disabledConfirm={selected.length === 0}
      />
    </Wrapper>
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  acceptSelectedCredentials: (
    selected: SignedCredentialWithMetadata[],
    interactionId: string,
  ) =>
    dispatch(
      withErrorScreen(
        withInternet(
          withLoading(
            ssoActions.consumeCredentialReceive(selected, interactionId),
          ),
        ),
      ),
    ),
  goBack: () => dispatch(ssoActions.cancelSSO),
})

export const CredentialReceive = connect(
  null,
  mapDispatchToProps,
)(CredentialsReceiveContainer)
