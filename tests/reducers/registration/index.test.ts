import { registrationReducer } from 'src/reducers/registration/'

describe('registration reducer', () => {
  it('should initialize correctly', () => {
    expect(registrationReducer({}, { type: '@INIT' })).toMatchSnapshot()
  })
})
