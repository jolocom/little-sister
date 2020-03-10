import React, { useState } from 'react'
import { connect } from 'react-redux'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { AppError, reportError } from '../../../lib/errors'
import { ThunkDispatch } from '../../../store'
import { routeList } from '../../../routeList'
import { navigationActions } from '../../../actions'
import { Emoji, EmojiSection } from '../components/emojiSection'
import { JolocomButton, Wrapper } from '../../structure'
import { styles } from '../styles'
import { ScrollView } from 'react-native'
import { ChooseIssueSection } from '../components/chooseIssueSection'
import { DescriptionSection } from '../components/descriptionSection'
import { ContactSection } from '../components/contactSection'
import I18n from '../../../locales/i18n'
import strings from '../../../locales/strings'
import { SectionWrapper } from '../components/sectionWrapper'
import { NavigationSection } from '../components/navigationSection'

interface NavigationParams {
  error?: AppError | Error
  previousScreen: routeList
}

interface Props extends ReturnType<typeof mapDispatchToProps> {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

export enum Inputs {
  None,
  Dropdown,
  Description,
  Contact,
}

const ErrorReportingContainer = (props: Props) => {
  const { navigateToScreen, navigation } = props

  const [pickedIssue, setIssue] = useState('')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [currentInput, setInput] = useState(Inputs.None)
  const [toggleState, setToggle] = useState(false)
  const [selectedEmoji, setEmoji] = useState(Emoji.Empty)

  // NOTE send previous screen as props, since not all
  // error reports will have error objects

  // const { previousScreen } = navigation.state.params
  // const isBackButton = previousScreen === routeList.Settings
  const isBackButton = false

  // NOTE error reports can show up without an error,
  // hence a navigation prop (navigateTo) would be better than in the error object
  const navigateBack = () => {
    const { error } = props.navigation.state.params
    if (error instanceof AppError) {
      navigateToScreen(error.navigateTo)
    } else {
      navigateToScreen(routeList.AppInit)
    }
  }

  const onSubmitReport = () => {
    const { error } = props.navigation.state.params

    const userReport = {
      userError: pickedIssue,
      userDescription: description,
      userContact: contact,
      sendPrivateData: toggleState,
    }

    if (navigation && error) {
      reportError({ ...userReport, error })
      navigateBack()
    }
  }

  return (
    <Wrapper style={styles.wrapper}>
      <NavigationSection
        onNavigation={navigateBack}
        isBackButton={isBackButton}
      />
      <ScrollView>
        <SectionWrapper
          title={I18n.t(strings.TELL_US_THE_PROBLEM)}
          style={{ marginTop: 14 }}
        >
          <ChooseIssueSection
            currentInput={currentInput}
            pickedIssue={pickedIssue}
            onIssuePick={setIssue}
            setInput={setInput}
          />
        </SectionWrapper>
        <SectionWrapper title={I18n.t(strings.CAN_YOU_BE_MORE_SPECIFIC)}>
          <DescriptionSection
            currentInput={currentInput}
            setInput={setInput}
            setDescription={setDescription}
            toggleState={toggleState}
            setToggle={setToggle}
            description={description}
          />
        </SectionWrapper>
        <SectionWrapper title={I18n.t(strings.WANT_TO_GET_IN_TOUCH)}>
          <ContactSection
            onContactInput={setContact}
            currentInput={currentInput}
            setInput={setInput}
            contactValue={contact}
          />
        </SectionWrapper>
        <SectionWrapper title={I18n.t(strings.RATE_THE_ISSUE)}>
          <EmojiSection selectedEmoji={selectedEmoji} setEmoji={setEmoji} />
        </SectionWrapper>
        <JolocomButton
          onPress={onSubmitReport}
          containerStyle={{
            marginTop: 45,
            marginBottom: 66,
            marginHorizontal: 20,
          }}
          text={I18n.t(strings.SUBMIT_REPORT)}
        />
      </ScrollView>
    </Wrapper>
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  navigateToScreen: (screen: routeList) =>
    dispatch(navigationActions.navigate({ routeName: screen })),
})

export const ErrorReporting = connect(
  null,
  mapDispatchToProps,
)(ErrorReportingContainer)
