// NOTE: RecursivePartial implementation from https://stackoverflow.com/a/51365037
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<RecursivePartial<U>>
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P]
}

// NOTE: this is based on https://github.com/gregbacchus/jest-auto-stub
//       but with clearMocks, and Stub members defined as jest.Mock instead of
//       jest.Mock<{}>
export function stub<T extends {}>(base: RecursivePartial<T> = {}): T {
  const store: Map<string, jest.Mock> = new Map()
  const clearMocks = () => {
    store.forEach(mock => mock.mockClear())
  }
  return new Proxy(base, {
    get(target, prop) {
      prop = prop.toString()
      let ret
      if (prop === '_clearMocks') {
        ret = clearMocks
      } else if (prop in target) {
        ret = (target as any)[prop]
        if (jest.isMockFunction(ret)) store.set(prop, ret)
      } else if (prop === 'then') {
        // TODO ??
      } else if (!store.has(prop)) {
        ret = jest.fn()
        store.set(prop, ret)
      } else {
        ret = store.get(prop)
      }

      return ret
    },

    has(target, prop) {
      if (prop in target) return true
      if (prop === 'then') return false
      return true
    },
  }) as T
}

stub.clearMocks = (stubbed: any) => stubbed._clearMocks()

export type Stub<T> = {
  [P in keyof T]: jest.Mock
}

export function reveal<T extends {}>(original: T): Stub<T> {
  return (original as any) as Stub<T>
}
