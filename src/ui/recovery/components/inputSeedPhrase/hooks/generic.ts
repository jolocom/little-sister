export const useDelay = (callback: () => void, timeout = 2500) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      try {
        callback()
        res()
      } catch (e) {
        rej(e)
      }
    }, timeout)
  })
}
