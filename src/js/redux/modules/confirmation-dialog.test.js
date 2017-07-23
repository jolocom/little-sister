/* global describe: true, it: true */
import {expect} from 'chai'
import * as confirmDialog from './confirmation-dialog'
const reducer = confirmDialog.default

describe('Confirmation dialog reducer', function() {
  describe('INIT', function() {
    it('should correctly initialize', function() {
      expect(reducer(undefined, '@INIT').toJS()).to.deep.equal({
        open: false,
        message: '',
        primaryActionText: 'Confirm',
        callback: null,
        cancelActionText: '',
        style: {}
      })
    })
  })

  describe('confirm', function() {
    it('should correctly handle the confirm action', function() {
      const callback = () => {}
      expect(reducer(reducer(undefined, '@INIT'), confirmDialog.confirm(
        'test title', 'test msg', 'Primary Action Text',
        callback
      )).toJS()).to.deep.equal({
        open: true,
        title: 'test title',
        message: 'test msg',
        primaryActionText: 'Primary Action Text',
        callback,
        cancelActionText: undefined,
        style: undefined
      })
    })
  })
})
