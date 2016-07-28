import Reflux from 'reflux'
import graphAgent from '../lib/agents/graph.js'
import graphActions from '../actions/graph-actions'
import accountActions from '../actions/account'
import d3Convertor from '../lib/d3-converter'

export default Reflux.createStore({
  listenables: [graphActions],

  init: function(){
    this.listenTo(accountActions.logout, this.onLogout)
    this.gAgent = new graphAgent()
    this.convertor = new d3Convertor()
    this.loaded = false


    this.state = {
      //These state keys describe the graph
      user: null,
      center: null,
      neighbours: null,
      loaded: false,
      newNode: null,
      navHistory: [],
      selected: null,
      rotationIndex: 0,
      //These describe the ui
      showPinned: false,
      showSearch: false,
      plusDrawerOpen: false,
      activeNode: null
    }
  },

  onLogout() {
    this.loaded = false
    this.state = {
      // Graph related
      user: null,
      center: null,
      neighbours: null,
      loaded: false,
      newNode: null,
      navHistory: [],
      selected: null,
      // UI related
      showPinned: false,
      showSearch: false,
      plusDrawerOpen: false,
      activeNode: null
    }
  },

  // These two are needed in order to transition between the preview graph and
  // The actual graph.
  onEraseGraph: function () {
    this.trigger(null, 'erase')
  },

  onSetState: function(key, value, flag){
    this.state[key] = value
    if (flag) this.trigger(this.state)
  },

  onChangeRotationIndex: function (rotationIndex, flag) {
    this.state['rotationIndex'] = rotationIndex
    if (flag) this.trigger(this.state, 'changeRotationIndex')
  },

  deleteNode: function(node){
    console.log('THIS ONE')
    let nodeId = node.index > 0 ? node.index : node.uri
    for (let i = 0; i < this.state.neighbours.length; i++){
     let sourceId = node.index > 0 ? this.state.neighbours[i].index
       : this.state.neighbours[i].uri
     if (sourceId == nodeId)
       this.state.neighbours.splice(i, 1)
    }
    this.state.activeNode = node
    this.trigger(this.state, 'nodeRemove')
  },

  dissconnectNode: function(){
    // Animation / removing from the neighb array will go here.
  },



  // This sends Graph.jsx and the Graph.js files a signal to add new ndoes to the graph
  drawNewNode: function(object, predicate){
    // This fetches the triples at the newly added file, it allows us to draw it
    // the graph accurately
    this.gAgent.fetchTriplesAtUri(object).then((result) => {
      // Adding the extra value to the object, the URI, it's usefull later.
      result.triples.uri = object
        // Now we tell d3 to draw a new adjacent node on the graph, with the info from
        // the triiple file
      console.log('We are drawing using', predicate)
      result.triples.connection = predicate
      this.state.newNode = this.convertor.convertToD3('a', result.triples)
      this.state.neighbours.push(this.state.newNode)
      this.trigger(this.state)
    })
  },

  // Is called by both graph.jsx and preview.jsx, we differentiate the caller
  // this way making sure that we update the right component.
  onGetState: function(source){
    this.trigger(this.state, source)
    if (!this.loaded) {
      this.loaded = true
      this.onGetInitialGraphState()
    }
  },

  onGetInitialGraphState: function () {
    this.gAgent.getGraphMapAtWebID().then((triples) => {
      triples[0] = this.convertor.convertToD3('c', triples[0])
      for (let i = 1; i < triples.length; i++) {
        triples[i] = this.convertor.convertToD3('a', triples[i], i, triples.length - 1)
      }
      graphActions.getInitialGraphState.completed(triples)
    })
  },

  onGetInitialGraphStateCompleted: function (result) {
    this.state.center = result[0]
    this.state.neighbours = result.slice(1, result.length)
    this.state.loaded = true
    this.state.user = result[0]
    this.trigger(this.state)
  },

  drawAtUri: function (uri, number) {
    this.state.neighbours = []
    this.gAgent.getGraphMapAtUri(uri).then((triples) => {
      triples[0] = this.convertor.convertToD3('c', triples[0])
      this.state.center = triples[0]
      for (let i = 1; i < triples.length; i++) {
        triples[i] = this.convertor.convertToD3('a', triples[i], i, triples.length - 1)
        this.state.neighbours.push(triples[i])
      }
      for (let i = 0; i < number; i++)
        this.state.navHistory.pop()
      this.trigger(this.state)
    })
  },

  onNavigateToNode: function (node) {
    this.state.neighbours = []
    this.state.rotationIndex = 0

    this.gAgent.getGraphMapAtUri(node.uri).then((triples) => {
      triples[0] = this.convertor.convertToD3('c', triples[0])
        // Before updating the this.state.center, we push the old center node
        // to the node history

      this.state.navHistory.push(this.state.center)
      this.state.center = triples[0]

      if (this.state.navHistory.length > 1) {
        if (this.state.center.uri === this.state.navHistory[this.state.navHistory.length - 2].uri) {
          this.state.navHistory.pop()
          this.state.navHistory.pop()
        }
        // Removed the brackets, one liners.
        else if (this.state.navHistory.length > 1)
          for (var j = 0; j < this.state.navHistory.length - 1; j++)
            if (this.state.center.uri == this.state.navHistory[this.state.navHistory.length - 2 - j].uri)
              for (var k = 0; k < j + 2; k++)
                this.state.navHistory.pop()
      }

      for (var i = 1; i < triples.length; i++) {
        triples[i] = this.convertor.convertToD3('a', triples[i], i, triples.length - 1)
        this.state.neighbours.push(triples[i])
      }
      this.trigger(this.state)
    })
  },

  onViewNode(node) {
    this.state.activeNode = node
    this.trigger(this.state)
  }
})
