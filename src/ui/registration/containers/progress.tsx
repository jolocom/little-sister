import * as React from 'react'
import { connect } from 'react-redux'
import { View, StyleSheet, StatusBar, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import * as loading from 'src/actions/registration/loadingStages'
import { RootState } from 'src/reducers/'
import { Wrapper } from 'src/ui/structure/'
import I18n from 'src/locales/i18n'
import { ThunkDispatch } from 'src/store'
import strings from '../../../locales/strings'
import { Colors, Typography, Spacing } from 'src/styles'
const loaders = require('react-native-indicator')

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

const styles = StyleSheet.create({
  messageArea: {},
  loadingArea: {},
  progressArea: {
    alignItems: 'center',
  },
  dotsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Spacing.LG,
  },
  dotActive: {
    marginHorizontal: Spacing.XS,
    color: Colors.dotColorActive,
  },
  dotInactive: {
    marginHorizontal: Spacing.SM,
    color: Colors.dotColorInactive,
  },
  text: {
    ...Typography.subMainText,
    textAlign: 'center',
    color: Colors.sandLight,
  },
  smallText: {
    ...Typography.baseFontStyles,
    textAlign: 'center',
    fontSize: Typography.textXXS,
    color: Colors.sandLight,
  },
})

export const RegistrationProgressContainer: React.FunctionComponent<
  Props
> = props => (
  <Wrapper dark breathy>
    <View style={styles.messageArea}>
      <Text style={styles.text}>{I18n.t(strings.GIVE_US_A_FEW_MOMENTS)}</Text>
      <Text style={styles.text}>{I18n.t(strings.TO_SET_UP_YOUR_IDENTITY)}</Text>
    </View>
    <View testID="progressLoader" style={styles.loadingArea}>
      <loaders.RippleLoader
        size={80}
        strokeWidth={4}
        color={Colors.spinnerColor}
      />
    </View>
    <View style={styles.progressArea}>
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((prop, key) => {
          const stageNumber = loading.loadingStages.indexOf(props.loadingMsg)
          return (
            <Icon
              name="circle"
              size={prop <= stageNumber ? 15 : 10}
              style={
                prop <= stageNumber ? styles.dotActive : styles.dotInactive
              }
              key={prop}
            />
          )
        })}
      </View>
      <View testID="progressMsg">
        <Text style={styles.smallText}>{props.loadingMsg}</Text>
      </View>
    </View>
  </Wrapper>
)

const mapStateToProps = ({
  registration: {
    loading: { loadingMsg },
  },
}: RootState) => ({
  loadingMsg,
})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({})

export const RegistrationProgress = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegistrationProgressContainer)
