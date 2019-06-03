import React from 'react'
import { connect } from 'react-redux'
import { View, Animated } from 'react-native'
import { CredentialOverview } from '../components/credentialOverview'
import { accountActions } from 'src/actions'
import { ClaimsState } from 'src/reducers/account'
import { DecoratedClaims } from 'src/reducers/account/'
import { RootState } from '../../../reducers'
import {toggleLoading} from '../../../actions/account'
import {withLoading} from '../../../actions/modifiers'

interface ConnectProps {
  setClaimsForDid: () => void
  openClaimDetails: (claim: DecoratedClaims) => void
  did: string
  claimsState: ClaimsState
  loading: boolean
  navigation: any
}

interface Props extends ConnectProps {}

interface State {
    documentScroll: Animated.Value
}

export class ClaimsContainer extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        const documentScroll = new Animated.Value(0)
        this.state = {
            documentScroll
        }
    }

    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state
        return params
    }

  public componentWillMount(): void {
      this.props.setClaimsForDid()
      console.log(this.props.navigation.setParams({tabBarHeight: this.state.documentScroll}))
  }

  public render(): JSX.Element {
    const { did, loading, claimsState, openClaimDetails } = this.props
    return (
      <View style={{ flex: 1 }}>
        <CredentialOverview
          did={did}
          claimsToRender={claimsState.decoratedCredentials}
          loading={!!loading}
        onEdit={openClaimDetails}
        scrollValue={this.state.documentScroll}
        />
      </View>
    )
  }
}

const mapStateToProps = ({
  account: {
    did: { did },
    claims: claimsState,
    loading: { loading },
  },
}: RootState) => ({ did, claimsState, loading })

const mapDispatchToProps = (dispatch: Function) => ({
  openClaimDetails: (claim: DecoratedClaims) =>
    dispatch(accountActions.openClaimDetails(claim)),
  setClaimsForDid: () => dispatch(withLoading(toggleLoading)(accountActions.setClaimsForDid())),
})

export const Claims = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClaimsContainer)
