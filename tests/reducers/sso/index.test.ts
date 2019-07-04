import { ssoReducer } from 'src/reducers/sso'
import { ssoActions as actions } from 'src/actions/'
import {initialState} from '../../../src/reducers/sso'

describe('sso reducer', () => {
  it('should initialize correctly', () => {
    expect(ssoReducer(undefined, { type: '@INIT' })).toMatchSnapshot()
  })

  // TODO Use realistic values
  it('should handle the SET_CREDENTIAL_REQUEST action ', () => {
    expect(
      ssoReducer(
        undefined,
        actions.setCredentialRequest({
          requester: {
            did: 'did:jolo:mock',
          },
          callbackURL: 'http://example.com/myendpoint/',
          availableCredentials: [{
            type: 'Email',
            verifications: [],
            values: ['test@email.com']
          }],
          requestJWT: 'request_jwt'
        }),
      ),
    ).toMatchSnapshot()
  })

  it('should handle the CLEAR_CREDENTIAL_REQUEST action ', () => {
    expect(
      ssoReducer(initialState, actions.clearInteractionRequest),
    ).toMatchSnapshot()
  })
})
