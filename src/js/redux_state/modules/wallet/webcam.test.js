import { expect } from 'chai'
import Immutable from 'immutable'
import reducer from './webcam'

describe('# Wallet webcam redux module', () => {
  it('should initialize properly', () => {
    const state = reducer(undefined, '@INIT')
    expect(state.toJS()).to.deep.equal({
      numberOfPhotos: 1,
      photos: [],
      onSave: state.toJS().onSave,
      onCancel: state.toJS().onCancel
    })
  })
  it('should initiate correclty', () => {
    const onSave = () => { return 'saved' }
    const onCancel = () => { return 'canceled' }
    const initiate = () => {}
    const initiatePhotoScreen = {
      type: '/wallet/webCam/INITIATE_PHOTO_SCREEN',
      initiate,
      onSave,
      onCancel
    }
    const state = reducer(undefined, initiatePhotoScreen)
    expect(state.toJS()).to.deep.equal({
      numberOfPhotos: 1,
      photos: [],
      onSave,
      onCancel
    })
    const saved = state.toJS().onSave()
    const canceled = state.toJS().onCancel()
    expect(saved).to.equal('saved')
    expect(canceled).to.equal('canceled')
  })
  it('should call onSave with proper params on save', () => {
    const onSave = () => {}
    const onCancel = () => {}
    const state = Immutable.fromJS({
      numberOfPhotos: 4,
      photos: ['test'],
      onSave,
      onCancel
    })
    const save = {
      type: '/wallet/webCam/SAVE'
    }
    const { numberOfPhotos, photos } = reducer(state, save).toJS()
    expect(numberOfPhotos).to.equal(1)
    expect(photos).to.deep.equal([])
  })
  it('should set the number of pictures properly', () => {
    const action = {
      type: '/wallet/webCam/SET_NUMBER_OF_PHOTOS',
      value: 4
    }

    const { numberOfPhotos } = reducer(undefined, action).toJS()
    expect(numberOfPhotos).to.equal(4)
  })
  it('should add a new picture properly', () => {
    const action = {
      type: '/wallet/webCam/ADD_PHOTO',
      value: 'data',
      index: 0
    }

    const { photos } = reducer(undefined, action).toJS()
    expect(photos).to.deep.equal([{value: 'data'}])
  })
  it('should delete a picture properly', () => {
    const action = {
      type: '/wallet/webCam/DELETE_PHOTO',
      index: 0
    }
    const state = Immutable.fromJS({
      photos: [{value: 'data0'}, {value: 'data1'}]
    })

    const { photos } = reducer(state, action).toJS()
    expect(photos).to.deep.equal([{value: 'data1'}])
  })
})
