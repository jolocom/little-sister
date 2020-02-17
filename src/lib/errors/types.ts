import { routeList } from 'src/routeList'
import { ErrorCode } from './codes'

export { ErrorCode }

export interface IAppError {
  origError: any
  navigateTo: routeList
}

export interface UserReport {
  userError: string | undefined
  userDescription: string
  userContact: string
  sendPrivateData: boolean
}

export interface ErrorReport extends UserReport {
  error: IAppError | Error | undefined
}
