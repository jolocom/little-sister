import { ErrorCodes as LibErrorCode } from 'jolocom-lib/js/errors'
import { ErrorCode as SDKErrorCode } from '@jolocom/sdk'
import { ThunkAction } from '../../store'
import { AppError, ErrorCode } from '../../lib/errors'
import { interactionHandlers } from '..'
import I18n from 'src/locales/i18n'
import { scheduleNotification } from '../notifications'
import { createWarningNotification } from 'src/lib/notifications'
import strings from 'src/locales/strings'

// FIXME NOTE
// this mapping seems unnecessary because ErrorCode and SDKErrorCode
// actually have similar/same values because SDKErrorCode started out
// as a copy of ErrorCode from the SmartWallet
//
// The SDK error codes will probably diverge away at some point,
// and also the AppError codes should be reduced dramatically to only
// ones that are actually important / used in the interface
const SDKErrorToAppError = {
  [SDKErrorCode.TokenExpired]: ErrorCode.TokenExpired,
  [SDKErrorCode.InvalidSignature]: ErrorCode.InvalidSignature,
  [SDKErrorCode.WrongFlow]: ErrorCode.WrongFlow,
  [SDKErrorCode.WrongNonce]: ErrorCode.WrongNonce,
  [SDKErrorCode.WrongDID]: ErrorCode.WrongDID,
  [SDKErrorCode.InvalidToken]: ErrorCode.WrongFlow, // FIXME
  [SDKErrorCode.ParseJWTFailed]: ErrorCode.ParseJWTFailed,
}

export const consumeInteractionToken = (jwt: string): ThunkAction => async (
  dispatch,
  getState,
  sdk,
) => {
  // TODO FIXME
  // - findInteraction should never throw but return undefined
  let interxn = await sdk.findInteraction(jwt)
    .catch(() => null)

  // if the interaction has already been interacted with then we consider it
  // ended
  if (interxn && interxn.getMessages().length > 1) {
    throw new AppError(ErrorCode.TokenExpired)
  }

  if (!interxn) {
    // we only process this token if the interaction was not previously created
    // otherwise it will fail because the token was already processed
    try {
      interxn = await sdk.processJWT(jwt)
    } catch (e) {
      console.log('processJWT failed', SDKErrorToAppError[e.message], e)
      if (e instanceof SyntaxError) {
        throw new AppError(ErrorCode.ParseJWTFailed, e)
      } else {
        throw new AppError(SDKErrorToAppError[e.message] || ErrorCode.ParseJWTFailed, e)
      }
    }
  }

  const handler = interactionHandlers[interxn.flow.type];
  if (!handler) {
    return dispatch(scheduleNotification(
      createWarningNotification({
        title: I18n.t(strings.DAMN),
        message: I18n.t(strings.IT_SEEMS_LIKE_WE_CANT_DO_THIS)
      })
    ))
  }

  try {
    return dispatch(handler(interxn))
  } catch (e) {
    // FIXME we should not be seeing jolocom-lib errors here, they should
    // be wrapped up by SDK errors, but this needs a fix in the SDK
    if (e.message === LibErrorCode.IDWInvalidJWTSignature) {
      throw new AppError(ErrorCode.InvalidSignature, e)
    } else if (e.message === LibErrorCode.IDWNotIntendedAudience) {
      throw new AppError(ErrorCode.WrongDID, e)
    } else if (e.message === LibErrorCode.IDWIncorrectJWTNonce) {
      throw new AppError(ErrorCode.WrongNonce, e)
    } else {
      throw new AppError(ErrorCode.Unknown, e)
    }
  }
}
