import { navigationReducer as reducer } from 'src/reducers/navigation/'

describe.only('navigation reducer', () => {
  it('should initialize correctly', () => {
    const test = reducer(undefined, { type: 'Navigation/INIT' })
    expect(test.routes[0].routeName).toBe('Landing')
  })
})
