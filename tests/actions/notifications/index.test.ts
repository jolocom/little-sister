import MockDate from 'mockdate'
import { createMockStoreWithReducers } from 'tests/utils'
import {
  invokeDismiss,
  invokeInteract,
  removeNotification,
  scheduleNotification,
  setActiveNotificationFilter,
} from 'src/actions/notifications'
import {
  createInfoNotification,
  createStickyNotification,
  Notification,
  NotificationFilter,
} from 'src/lib/notifications'

jest.useFakeTimers()

describe('Notifications Actions', () => {
  let curId = 1
  let mockStore: ReturnType<typeof createMockStoreWithReducers>
  const getId = () => curId++
  const timeout = 3000
  beforeEach(() => {
    mockStore = createMockStoreWithReducers()
    curId = 1
  })

  const newSticky = (notif: Partial<Notification> = {}) =>
    createStickyNotification({
      id: getId().toString(),
      title: 'hello',
      message: 'sup',
      ...notif,
    })

  const newSlidy = (notif: Partial<Notification> = {}) =>
    createInfoNotification({
      id: getId().toString(),
      title: 'hello',
      message: 'sup',
      ...notif,
    })

  describe('scheduleNotification', () => {
    beforeEach(() => {
      mockStore.reset()
      MockDate.set(0)
    })
    afterEach(() => MockDate.reset())

    it('should set an active notification if there are none in queue', () => {
      mockStore.dispatch(scheduleNotification(newSlidy()))
      expect(mockStore.getActions()).toMatchSnapshot()
    })

    it('should not change the active notification if it is not expired', () => {
      const notification = newSlidy()
      notification.dismiss = { timeout }

      mockStore.dispatch(scheduleNotification(notification))
      MockDate.set(timeout / 2)
      mockStore.dispatch(
        scheduleNotification({
          ...notification,
          id: '2',
        }),
      )

      expect(mockStore.getActions()).toMatchSnapshot()
      jest.runAllTimers()
      expect(mockStore.getActions()).toMatchSnapshot()
    })

    it('should change to the next notification when active expires', () => {
      const notification = newSlidy()
      notification.dismiss = { timeout }
      mockStore.dispatch(scheduleNotification(notification))

      MockDate.set(timeout / 2)

      mockStore.dispatch(
        scheduleNotification({
          ...notification,
          id: '2',
        }),
      )

      expect(mockStore.getActions()).toMatchSnapshot()

      MockDate.set(timeout + 100)
      jest.runAllTimers()
      expect(mockStore.getActions()).toMatchSnapshot()
    })

    it('should change to the next notification immediately if active is non-dismissible', () => {
      const sticky = newSticky()
      const slidy = newSlidy()
      slidy.dismiss = { timeout }

      mockStore.dispatch(scheduleNotification(sticky))
      mockStore.dispatch(scheduleNotification(slidy))
      expect(mockStore.getActions()).toMatchSnapshot()

      MockDate.set(timeout + 100)
      jest.runAllTimers()
      expect(mockStore.getActions()).toMatchSnapshot()
    })

    it('should not change to a new non-dismissible if active is dismissible', () => {
      const sticky = newSticky()
      const slidy = newSlidy()
      slidy.dismiss = { timeout }

      mockStore.dispatch(scheduleNotification(slidy))
      mockStore.dispatch(scheduleNotification(sticky))
      expect(mockStore.getActions()).toMatchSnapshot()

      MockDate.set(timeout + 100)
      jest.runAllTimers()
      expect(mockStore.getActions()).toMatchSnapshot()
    })

    it('should null the active notification when it is filtered out from the queue', () => {
      const sticky = newSticky()

      mockStore.dispatch(scheduleNotification(sticky))
      mockStore.dispatch(
        setActiveNotificationFilter(NotificationFilter.onlyDismissible),
      )
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(mockStore.getState().notifications).toMatchSnapshot()
    })

    it('should not timeout the active notification after it was filtered', () => {
      const slidy = newSlidy()

      mockStore.dispatch(scheduleNotification(slidy))
      mockStore.dispatch(setActiveNotificationFilter(NotificationFilter.none))
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(mockStore.getState().notifications).toMatchSnapshot()
      MockDate.set(timeout + 200)
      jest.runAllTimers()
      mockStore.dispatch(setActiveNotificationFilter(NotificationFilter.all))
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(mockStore.getState().notifications).toMatchSnapshot()
    })
  })

  describe('invokeDismiss', () => {
    beforeEach(() => {
      mockStore.reset()
      MockDate.set(0)
    })
    afterEach(() => MockDate.reset())

    it('should call the onDismiss callback and remove the notification', () => {
      const onDismiss = jest.fn()
      const slidy = newSticky({
        dismiss: { onDismiss },
      })

      mockStore.dispatch(scheduleNotification(slidy))
      expect(mockStore.getActions()).toMatchSnapshot()
      mockStore.dispatch(invokeDismiss(slidy))
      jest.runAllTimers()
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('should call onDismiss callback and replace the notification with the next one from queue', () => {
      const onDismiss = jest.fn()
      const slidy1 = newSlidy({
        dismiss: { onDismiss },
      })
      const slidy2 = newSlidy()

      mockStore.dispatch(scheduleNotification(slidy1))
      MockDate.set(timeout / 2)
      mockStore.dispatch(scheduleNotification(slidy2))
      expect(mockStore.getActions()).toMatchSnapshot()
      mockStore.dispatch(invokeDismiss(slidy1))
      expect(mockStore.getActions()).toMatchSnapshot()
      jest.runAllTimers()
      expect(mockStore.getState().notifications).toMatchSnapshot()
    })
  })

  describe('invokeInteract', () => {
    beforeEach(() => {
      mockStore.reset()
      MockDate.set(0)
    })
    afterEach(() => MockDate.reset())

    it('should call the onInteract callback and remove the notification', () => {
      const onInteract = jest.fn()
      const sticky = newSticky({
        interact: {
          label: 'DO IT',
          onInteract,
        },
      })

      mockStore.dispatch(scheduleNotification(sticky))
      expect(mockStore.getActions()).toMatchSnapshot()
      mockStore.dispatch(invokeInteract(sticky))
      jest.runAllTimers()
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(onInteract).toHaveBeenCalledTimes(1)
    })

    it('should call onInteract callback and replace the notification with the next one from queue', () => {
      const onInteract = jest.fn()
      const slidy1 = newSlidy({
        interact: {
          label: 'CLICK',
          onInteract,
        },
      })
      const slidy2 = newSlidy()

      mockStore.dispatch(scheduleNotification(slidy1))
      MockDate.set(timeout / 2)
      mockStore.dispatch(scheduleNotification(slidy2))
      expect(mockStore.getActions()).toMatchSnapshot()
      mockStore.dispatch(invokeInteract(slidy1))
      expect(mockStore.getActions()).toMatchSnapshot()
      jest.runAllTimers()
      expect(mockStore.getState().notifications).toMatchSnapshot()
    })

    it('should keep the notification if onInteract returns true', () => {
      const onInteract = jest.fn().mockReturnValue(true)
      const sticky = newSticky({
        interact: {
          label: 'DO IT',
          onInteract,
        },
      })

      mockStore.dispatch(scheduleNotification(sticky))
      expect(mockStore.getActions()).toMatchSnapshot()
      mockStore.dispatch(invokeInteract(sticky))
      expect(mockStore.getActions()).toMatchSnapshot()
      jest.runAllTimers()
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(onInteract).toHaveBeenCalledTimes(1)
    })
  })

  describe('removeNotification', () => {
    beforeEach(() => {
      mockStore.reset()
      MockDate.set(0)
    })
    afterEach(() => MockDate.reset())

    it('should remove the notification from the queue', () => {
      const slidy = newSlidy()
      const slidy2 = newSlidy()

      mockStore.dispatch(scheduleNotification(slidy))
      mockStore.dispatch(scheduleNotification(slidy2))
      mockStore.dispatch(removeNotification(slidy2))
      expect(mockStore.getActions()).toMatchSnapshot()
      jest.runAllTimers()
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(mockStore.getState().notifications).toMatchSnapshot()
    })

    it('should remove the notification from the queue, and unset it if it was active', () => {
      const slidy = newSlidy()
      mockStore.dispatch(scheduleNotification(slidy))
      mockStore.dispatch(removeNotification(slidy))
      expect(mockStore.getActions()).toMatchSnapshot()
      jest.runAllTimers()
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(mockStore.getState().notifications).toMatchSnapshot()
    })
  })
})
