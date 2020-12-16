import {
  default as originalCreateMockStore,
  MockStoreEnhanced,
} from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Agent } from '@jolocom/sdk'
import { stub, RecursivePartial } from 'tests/utils/stub'
import { RootState } from 'src/reducers'
import { ThunkDispatch } from 'src/store'
import { AnyAction } from 'redux'

interface MockStoreWithMockBackend
  extends MockStoreEnhanced<RootState, ThunkDispatch> {
  reset: () => void
  backendMiddleware: Agent
}

export function createMockStoreWithReducers(
  initialState?: RecursivePartial<RootState>,
  backendMiddlewareStub: RecursivePartial<Agent> = {},
) {
  const { rootReducer } = require('src/reducers')
  if (!initialState) initialState = rootReducer(undefined, { type: '@INIT' })
  const getState = (actions: AnyAction[]) =>
    actions.reduce(
      (accm, action) => rootReducer(accm, action),
      initialState,
    ) as RootState
  return createMockStore(getState, backendMiddlewareStub)
}

export function createMockStore(
  initialState:
    | RecursivePartial<RootState>
    | ((actions: AnyAction[]) => RootState) = {},
  backendMiddlewareStub: RecursivePartial<Agent> = {},
) {
  const mockBackendMiddleware = stub<Agent>(backendMiddlewareStub)
  const mockStore = originalCreateMockStore<RootState, ThunkDispatch>([
    thunk.withExtraArgument(mockBackendMiddleware),
  ])(initialState as RootState) as MockStoreWithMockBackend

  mockStore.reset = () => {
    mockStore.clearActions()
    stub.clearMocks(mockBackendMiddleware)
  }

  mockStore.backendMiddleware = mockBackendMiddleware

  return mockStore
}
