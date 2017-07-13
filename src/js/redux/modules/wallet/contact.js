import Immutable from 'immutable'
import { makeActions } from '../'
import * as router from '../router'
import WebIdAgent from 'lib/agents/webid'

import {
mapAccountInformationToState,
validateChanges,
addNewField,
updateOriginalValue,
submitChanges,
setNewFieldValue
} from '../../../lib/edit-contact-util'

const actions = module.exports = makeActions('wallet/contact', {
  saveChanges: {
    expectedParams: [],
    async: true,
    creator: (params) => {
      return (dispatch, getState, {services, backend}) => {
        dispatch(actions.validate())
        const {information, showErrors} = getState().toJS().wallet.contact
        const webId = getState().toJS().wallet.identity.webId
        if (!showErrors) {
          dispatch(actions.saveChanges.buildAction(params,
          () => submitChanges(backend, services, information, webId)
          )).then(() => {
            dispatch(router.pushRoute('/wallet/identity'))
            dispatch(actions.setReloadFromBackend(true))
          })
        }
      }
    }
  },
  validate: {
    expectedParams: []
  },
  exitWithoutSaving: {
    expectedParams: [],
    creator: (params) => {
      return (dispatch, getState) => {
        dispatch(actions.setReloadFromBackend(true))
        dispatch(router.pushRoute('/wallet/identity'))
      }
    }
  },
  setReloadFromBackend: {
    expectedParams: ['value']
  },
  getUserInformation: {
    expectedParams: [],
    async: true,
    creator: (params) => {
      return (dispatch, getState, {services, backend}) => {
        dispatch(actions.getUserInformation
        .buildAction(params, () => {
          return backend.solid.getUserInformation(new WebIdAgent().getWebId())
        }))
      }
    }
  },
  setInformation: {
    expectedParams: ['field', 'index', 'value']
  },
  setAddressField: {
    expectedParams: ['age', 'field', 'index', 'value']
  },
  deleteInformation: {
    expectedParams: ['age', 'field', 'index'],
    creator: (...params) => {
      return (dispatch, getState, {services, backend}) => {
        dispatch(actions.deleteInformation.buildAction(...params))
        const {originalInformation, newInformation} = getState()
          .toJS().wallet.contact.information
        if ([...originalInformation.phones, ...newInformation.phones]
          .every(phone => phone.delete)) {
          dispatch(actions.addNewEntry('phones', newInformation.phones.length))
        } else if ([...originalInformation.emails, ...newInformation.emails]
          .every(email => email.delete)) {
          dispatch(actions.addNewEntry('emails', newInformation.emails.length))
        }
      }
    }
  },
  updateInformation: {
    expectedParams: ['field', 'index', 'value']
  },
  addNewEntry: {
    expectedParams: ['field', 'index']
  }
})

const initialState = Immutable.fromJS({
  information: {
    newInformation: {
      phones: [],
      emails: [],
      addresses: []
    }
  },
  originalInformation: {
    phones: [],
    emails: [],
    addresses: []
  },
  getDataFromBackend: true,
  loading: true,
  showErrors: false
})

module.exports.default = (state = initialState, action = {}) => {
  switch (action.type) {
    case actions.saveChanges.id:
      return state.setIn(['loading'], true)

    case actions.saveChanges.id_success:
      return state.setIn(['loading'], false)

    case actions.getUserInformation.id:
      return state.setIn(['loading'], true)

    case actions.getUserInformation.id_success:
      return mapAccountInformationToState(action.result.contact)

    case actions.setInformation.id:
      return setNewFieldValue(state, action)

    case actions.setAddressField.id:
      return state.mergeIn(
      ['information', action.age, 'addresses', action.index, action.field], {
        value: action.value
      })

    case actions.deleteInformation.id:
      return state.mergeIn(['information', action.age, action.field,
        action.index], {
          delete: true
        })

    case actions.updateInformation.id:
      return updateOriginalValue(state, action)

    case actions.addNewEntry.id:
      return addNewField(state, action)

    case actions.validate.id:
      return validateChanges(state)

    case actions.setReloadFromBackend.id:
      return state.mergeDeep({
        getDataFromBackend: action.value
      })

    default:
      return state
  }
}
