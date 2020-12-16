import React from 'react'
import { ThunkDispatch } from 'src/store'
import { navigationActions } from 'src/actions'
import { connect } from 'react-redux'
import { RootState } from 'src/reducers'
import { impressumEN, impressumDE } from './legalTexts'
import strings from 'src/locales/strings'
import { LegalTextComponent } from './legalTextComponent'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

const ImpressumContainer: React.FC<Props> = ({ navigateBack, language }) => {
  return (
    <LegalTextComponent
      onBackPress={navigateBack}
      locale={language}
      title={strings.IMPRINT}
      enText={impressumEN}
      deText={impressumDE}
    />
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  navigateBack: () => dispatch(navigationActions.navigateBack()),
})

const mapStateToProps = (state: RootState) => ({
  language: state.settings.locale,
})

export const Impressum = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImpressumContainer)
