import React from 'react'
import { ThunkDispatch } from 'src/store'
import { navigationActions } from 'src/actions'
import { connect } from 'react-redux'
import { RootState } from 'src/reducers'
import { termsOfServiceEN, termsOfServiceDE } from './legalTexts'
import strings from 'src/locales/strings'
import { LegalTextComponent } from './legalTextComponent'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

const TermsOfServiceContainer: React.FC<Props> = ({
  navigateBack,
  language,
}) => {
  return (
    <LegalTextComponent
      onBackPress={navigateBack}
      locale={language}
      title={strings.TERMS_OF_SERVICE}
      enText={termsOfServiceEN}
      deText={termsOfServiceDE}
    />
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  navigateBack: () => dispatch(navigationActions.navigateBack()),
})

const mapStateToProps = (state: RootState) => ({
  language: state.settings.locale,
})

export const TermsOfService = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TermsOfServiceContainer)
