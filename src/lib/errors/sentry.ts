import * as Sentry from '@sentry/react-native'
import VersionNumber from 'react-native-version-number'
import { sentryDSN } from 'src/config'
import { ErrorReport } from 'src/lib/errors/types'

export function reportErrorToSentry(report: ErrorReport, extraData?: object) {
  Sentry.withScope(scope => {
    if (extraData) scope.setExtras(extraData)
    Sentry.captureException(report.error)
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

      return { ...event, contexts, extra }
    },
  })
}
