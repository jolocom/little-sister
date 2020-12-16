import { AppError } from '../lib/errors'

interface NotificationMessage {
  title: string
  message?: string
}

/**
 * A notification is either dismissible or not
 * if it is dismissible it can also optionally have
 * - a label (for the dismiss button)
 * - a timeout (to auto-dismiss)
 * - a callback
 */

export interface NotificationDismiss {
  dismiss?:
    | false
    | {
        label?: string
        timeout?: number
        onDismiss?: (...args: any) => void
      }
}

/**
 * A notification may have a call to action button,
 * with a label and an onInteract callback
 * It is not possible to simply specify a boolean, because if an interaction is
 * expected then a callback and label are required.
 */
interface NotificationInteract {
  interact?: {
    label: string
    onInteract: (...args: any) => void | boolean | Promise<void | boolean>
  }
}

/**
 * The payload is either a message if the type is warning or info, or an error
 * if the type is error.
 */

type NotificationPayload = {
  type: NotificationType.warning | NotificationType.info
  error?: AppError
} & NotificationMessage

interface NotificationBase {
  id: string
  type: NotificationType
}

type PartialNotification = Partial<NotificationBase> &
  NotificationInteract &
  NotificationDismiss

let notifIds = 0

const createNotificationFactory = (
  template: PartialNotification & Omit<NotificationBase, 'id'>,
) => (overrides: PartialNotification & NotificationMessage): Notification =>
  ({
    id: notifIds++,
    ...template,
    ...overrides,
  } as Notification)

export type Notification = NotificationBase &
  NotificationInteract &
  NotificationDismiss &
  NotificationPayload

export enum NotificationFilter {
  none,
  all,
  onlyDismissible,
}

export enum NotificationType {
  error = 'error',
  info = 'info',
  warning = 'warning',
}

export const createInfoNotification = createNotificationFactory({
  type: NotificationType.info,
  dismiss: {
    timeout: 3000,
  },
})

export const createWarningNotification = createNotificationFactory({
  type: NotificationType.warning,
  dismiss: {
    timeout: 3000,
  },
})

export const createStickyNotification = createNotificationFactory({
  type: NotificationType.info,
  dismiss: false,
})
