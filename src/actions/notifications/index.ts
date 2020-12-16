import { ThunkAction } from 'src/store'
import { Notification, NotificationFilter } from 'src/lib/notifications'
import {
  SET_ACTIVE_NOTIFICATION,
  SCHEDULE_NOTIFICATION,
  REMOVE_NOTIFICATION,
  CLEAR_NOTIFICATIONS,
  SET_ACTIVE_FILTER,
} from 'src/reducers/notifications'
import { RootState } from '../../reducers'

/**
 * @description Add a notification to the queue, to be displayed at an
 *              appropriate time in the future, or right away if possible
 */
export const scheduleNotification = (
  notification: Notification,
): ThunkAction => dispatch => {
  dispatch({
    type: SCHEDULE_NOTIFICATION,
    notification,
  })
  return dispatch(updateNotificationsState)
}

/**
 * @description Invoke the notification interact callback and remove it from
 *              queue and active. Should be dispatched on interaction with the
 *              notification's "call to action" button
 *
 */
export const invokeInteract = (
  notification: Notification,
): ThunkAction => async dispatch => {
  let keepNotification = false
  const { interact } = notification
  if (interact && interact.onInteract) {
    /** NOTE @mnzaki
     * onInteract callback can't be async because using await causes updateNotificationState
     * to sometimes null the activeNotification, which causes the notifications container
     * to flicker the animation, because another hide animation is already in progress
     *
     * TO FIX IT: wait for animations to finish before starting new animations in
     *            the container
     */

    //keepNotification = (await interact.onInteract()) === true
    keepNotification = interact.onInteract() === true
  }

  if (!keepNotification) {
    return dispatch(removeNotification(notification))
  }
}

/**
 * @description Invoke the notification dismiss callback and remove it from
 *              queue and active. Should be dispatched on interaction with the
 *              notification's "dismiss" button
 */
export const invokeDismiss = (
  notification: Notification,
): ThunkAction => dispatch => {
  const { dismiss } = notification
  if (typeof dismiss === 'object' && dismiss.onDismiss) {
    /** NOTE @mnzaki
     * onDismiss can't be async because of issue similar to invokeInteract
     * see NOTE in invokeInteract
     */
    // await dismiss.onDismiss()
    dismiss.onDismiss()
  }

  return dispatch(removeNotification(notification))
}

/**
 * @description Clear all notifications from queue and from active
 */
export const clearAllNotifications = (): ThunkAction => dispatch => {
  dispatch({ type: CLEAR_NOTIFICATIONS })
  return dispatch(updateNotificationsState)
}

/**
 * @description Remove a notification from queue
 *              Should generally not need to be dispatched directly, but is
 *              exported for testing purposes.
 *              No callbacks are invoked.
 */
export const removeNotification = (
  notification: Notification,
  clearActive = true,
): ThunkAction => (dispatch, getState) => {
  dispatch({
    type: REMOVE_NOTIFICATION,
    notification,
  })

  if (clearActive) {
    const { active } = getState().notifications
    if (active && active.id === notification.id) {
      dispatch(clearActiveNotification())
    }
  }

  return dispatch(updateNotificationsState)
}

/**
 * @description Set the active notification filter
 *              see NotificationFilter in src/lib/notifications
 *              only notifications matching the filter will be considered for
 *              the "active" notification
 */
export const setActiveNotificationFilter = (
  filter: NotificationFilter,
): ThunkAction => dispatch => {
  dispatch({
    type: SET_ACTIVE_FILTER,
    value: filter,
  })
  return dispatch(updateNotificationsState)
}

/**
 * NOTE
 * These are internal to the notifications action system on purpose
 * to reduce complexity on consumer side. They should not be exported.
 *
 * In a perfect case scenario, we should never need to manually call for an
 * update action.
 */

/**
 * @description Set the active notification and the timestamp at which it will
 *              expire
 */
const setActiveNotification = (
  notification: Notification | null,
  expiry?: number,
) => ({
  type: SET_ACTIVE_NOTIFICATION,
  notification,
  expiry,
})

let nextUpdateTimeout: number | null = null
let updateInProgress = false

const getActiveNotificationState = (getState: () => RootState) => {
  const curTs = Date.now()
  const { active, activeExpiryTs } = getState().notifications
  const isActiveExpired =
    !active || (active.dismiss && activeExpiryTs && curTs >= activeExpiryTs)
  const isActiveSticky = active && !active.dismiss
  return { active, isActiveExpired, curTs, isActiveSticky }
}

// ThunkActions must always return an AnyAction, unless they are async
// This is async just so it can some times return nothing (when there is another
// update already running, as a side-effect of some change), to avoid recursion.
const updateNotificationsState: ThunkAction = async (dispatch, getState) => {
  if (updateInProgress) return
  updateInProgress = true
  let ret

  let {
    isActiveExpired,
    isActiveSticky,
    active,
    curTs,
  } = getActiveNotificationState(getState)

  let next = null,
    nextExpiry

  // un-queue the active notification if it is expired
  if (active && isActiveExpired) {
    dispatch(removeNotification(active, false))
  }

  // clear the active notification if it should be filtered
  if (active && !isActiveExpired) {
    const { activeFilter } = getState().notifications

    if (!notificationMatchesFilter(activeFilter, active)) {
      ret = dispatch(clearActiveNotification())
      ;({
        isActiveExpired,
        isActiveSticky,
        active,
        curTs,
      } = getActiveNotificationState(getState))

      if (nextUpdateTimeout) {
        clearTimeout(nextUpdateTimeout)
        nextUpdateTimeout = null
      }
    }
  }

  // we only attempt to find a next notification if the active one is
  // expired or sticky (non-dismissible)
  if (isActiveExpired || isActiveSticky) {
    const { queue: fullQueue, activeFilter } = getState().notifications
    const queue = fullQueue.filter(
      notificationMatchesFilter.bind(null, activeFilter),
    )
    if (queue.length) {
      // find the next dismissible notification, or otherwise take the first in
      // queue. Note that this means we do not support showing two non-dismissible
      // notifications
      next = queue.find(notification => !!notification.dismiss) || queue[0]
    } else if (active) {
      // NOTE: active notification is cleared twice if it's a sticky and the queue is empty
      ret = dispatch(clearActiveNotification())
    }
  } else if (active) {
    // active notification should not be changed
    next = active
  }

  // if there's a next and it is not the already active notification
  if (next && next !== active) {
    // if next should be automatically dismissed, setup a timeout for it
    if (next.dismiss && next.dismiss.timeout) {
      if (nextUpdateTimeout) {
        // this should normally never be the case.... but
        clearTimeout(nextUpdateTimeout)
      }
      nextUpdateTimeout = setTimeout(() => {
        nextUpdateTimeout = null
        dispatch(updateNotificationsState)
        // +5 for good taste
      }, next.dismiss.timeout + 5)

      nextExpiry = curTs + next.dismiss.timeout
    }
    ret = dispatch(setActiveNotification(next, nextExpiry))
  }

  updateInProgress = false
  return ret
}

const clearActiveNotification = () => setActiveNotification(null, 0)

const notificationMatchesFilter = (
  filter: NotificationFilter,
  notification: Notification,
): boolean => {
  switch (filter) {
    case NotificationFilter.all:
      return true
    case NotificationFilter.onlyDismissible:
      return !!notification.dismiss
    default:
      return false
  }
}
