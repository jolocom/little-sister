import { createStore, applyMiddleware, AnyAction } from 'redux'

import thunk, {
  ThunkDispatch as OriginalThunkDispatch,
  ThunkAction as OriginalThunkAction,
} from 'redux-thunk'
import { RootState, rootReducer } from 'src/reducers'

import { JolocomTypeormStorage, Agent } from 'react-native-jolocom'

import { createConnection, getConnection } from 'typeorm'
import typeormConfig from '../ormconfig'

const initConnection = async () => {
  let connection
  try {
    // *** this will clear the database
    // *** used for resetting the did
    // await getConnection().synchronize(true)
    // console.log('DB was cleaned')

    connection = getConnection()
  } catch (e) {
    connection = await createConnection(typeormConfig)
  }
  return connection
}

export async function initTypeorm() {
  const connection = await initConnection()
  await connection.synchronize()
  return new JolocomTypeormStorage(connection)
}

export function initStore(agent: Agent) {
  /*
   * The {} as RootState type assertion:
   * The second argument, "preloadedState" is mandatory, and typed as RootState.
   * We provide an empty object. The store will have the correct default state
   * after all reducers initialise.
   */
  const backendMiddleware = agent
  return createStore(
    rootReducer,
    {} as RootState,
    applyMiddleware(thunk.withExtraArgument(backendMiddleware)),
  )
}

export type ThunkDispatch = OriginalThunkDispatch<
  RootState,
  Agent,
  AnyAction
>
export type ThunkAction<
  R = AnyAction | Promise<AnyAction | void>
> = OriginalThunkAction<R, RootState, Agent, AnyAction>
