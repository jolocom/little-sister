import React from 'react'
import { ThunkDispatch } from 'src/store'
import { navigationActions } from 'src/actions'
import { connect } from 'react-redux'
import { privacyPolicyEN, privacyPolicyDE } from './legalTexts'
import { RootState } from 'src/reducers'
import strings from 'src/locales/strings'
import { LegalTextComponent } from './legalTextComponent'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

const PrivacyPolicyContainer: React.FC<Props> = ({
  navigateBack,
  language,
}) => {
  return (
    <LegalTextComponent
      onBackPress={navigateBack}
      locale={language}
      title={strings.PRIVACY_POLICY}
      enText={privacyPolicyEN}
      deText={privacyPolicyDE}
    />
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  navigateBack: () => dispatch(navigationActions.navigateBack()),
})

const mapStateToProps = (state: RootState) => ({
  language: state.settings.locale,
})

export const PrivacyPolicy = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PrivacyPolicyContainer)
