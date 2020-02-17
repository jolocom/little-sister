import { routeList } from 'src/routeList'
import strings from 'src/locales/strings'
import { ErrorReport, ErrorCode, IAppError } from './types'
export { ErrorCode }

import { reportErrorToSentry, initSentry } from 'src/lib/errors/sentry'

export class AppError extends Error implements IAppError {
  // private code: ErrorCode
  public origError: any
  public navigateTo: routeList

  public constructor(
    code = ErrorCode.Unknown,
    origError?: any,
    navigateTo: routeList = routeList.AppInit,
  ) {
    super(strings[code] || strings[ErrorCode.Unknown])
    // this.code = code
    this.origError = origError
    this.navigateTo = navigateTo
  }
}

export const errorTitleMessages = [strings.DAMN, strings.OH_NO, strings.UH_OH]

export function reportError(report: ErrorReport) {
  let extraData
  if (report.error instanceof AppError && report.error.origError) {
    extraData = {
      AppError: report.error.message,
      UserError: report.userError,
      UserDescription: report.userDescription,
      UserContact: report.userContact,
      sendPrivateData: report.sendPrivateData,
    }
    report.error = report.error.origError
  }
  return reportErrorToSentry(report, extraData)
}

export const initErrorReporting = initSentry
