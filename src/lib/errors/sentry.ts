import * as Sentry from '@sentry/react-native'
import VersionNumber from 'react-native-version-number'
import { sentryDSN } from 'src/config'
import { ErrorReport } from '@jolocom/sdk/js/src/lib/errors/types'

export function reportToSentry(errorReport: ErrorReport) {
  Sentry.withScope(scope => {
    const { error, ...report } = errorReport
    if (report) scope.setExtras(report)
    Sentry.captureException(error)
  })
}

export function initSentry() {
  Sentry.init({
    dsn: sentryDSN,
    release: `${VersionNumber.bundleIdentifier}@${VersionNumber.appVersion}`,

    // disable automatic reporting of errors/rejections without user consent
    integrations: defaultIntegrations =>
      defaultIntegrations.filter(i => i.name !== 'ReactNativeErrorHandlers'),

    /**
     * @param event
     * @dev TODO Decide if event.contexts.app should be stripped
     */

    beforeSend: event => {
      const { extra, contexts } = event

      if (extra && contexts) {
        if (!extra.sendPrivateData) {
          delete contexts.device
          delete contexts.os
        }

        delete extra.sendPrivateData
      }
      console.log({ extra, contexts })

      return { ...event, contexts, extra }
    },
  })
}
