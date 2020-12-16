interface ActionI<T> {
  type: T
  payload?: any
}

const partiallyAppliedAction = <T>(type: T) => {
  return (payload?: any): ActionI<T> => ({
    type,
    payload,
  })
}

export default partiallyAppliedAction
