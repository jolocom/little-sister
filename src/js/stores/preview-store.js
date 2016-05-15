import Reflux from 'reflux'
import graphAgent from '../lib/agents/graph.js'
import previewActions from '../actions/preview-actions'
import accountActions from '../actions/account'
import graphStore from './graph-store'
import d3Convertor from '../lib/d3-converter'

import rdf from 'rdflib'
let FOAF = rdf.Namespace('http://xmlns.com/foaf/0.1/')

export default Reflux.createStore({

  listenables: [previewActions],

  init: function(){
    this.listenTo(accountActions.logout, this.onLogout)

    this.gAgent = new graphAgent()
    this.convertor = new d3Convertor()

    this.state = {
      //These state keys describe the graph
      user: null,
      center:null,
      neighbours: null,
      loaded: false,
      newNode: null,
      newLink: null,
      drawn: false,
      highlighted: null,
      linkSubject: null,
      linkObject: null,
      // Keeps track of all the nodes we navigated to.
      navHistory: [],
      //These describe the ui
      showPinned: false,
      showSearch: false,
      plusDrawerOpen: false
    }
  },

  onLogout(){
    this.state = {
      // Graph related
      user: null,
      center: null,
      neighbours: null,
      loaded: false,
      newNode: null,
      newLink: null,
      drawn: false,
      highlighted: null,
      linkSubject: null,
      navHistory: [],
      // UI related
      showPinned:false,
      showSearch: false,
      plusDrawerOpen:false
    }
  },

  onSetState: function(key, value, flag){
      // No need to trigger here, since this is always called after the state
      // of the child component has been changed.
    this.state[key] = value

    if (flag) this.trigger(this.state)
  },

  onChooseSubject: function() {
    // We choose the subject of the new link
    if (this.state.highlighted) this.state.linkSubject = this.state.highlighted
    else this.state.linkSubject = this.state.center.uri
    console.log('we chose the subject to be', this.state.linkSubject)
    this.trigger(this.state)

    previewActions.linkTriple()
  },

  onChooseObject: function() {
    // We choose the object of the new link
    if (this.state.highlighted) this.state.linkObject = this.state.highlighted
    else this.state.linkObject = this.state.center.uri
    this.trigger(this.state)
    console.log('we chose the object to be', this.state.linkObject)
  },

  onLinkTriple: function(){
    // this.state.newLink = rdf.sym(this.state.linkSubject) + FOAF('knows') + rdf.sym(this.state.linkObject)
    previewActions.writeTriple(this.state.linkSubject, FOAF('knows'), this.state.linkObject, ' ')
  },

  // This sends Graph.jsx and the Graph.js files a signal to add new ndoes to the graph
  drawNewNode: function(object){
    // This fetches the triples at the newly added file, it allows us to draw it
    // the graph accurately
    this.gAgent.fetchTriplesAtUri(object).then((result)=>{
      result.triples.uri = object
      // Now we tell d3 to draw a new adjacent node on the graph, with the info from
      // the triple file
      this.state.newNode = this.convertor.convertToD3('a', result.triples)
      this.trigger(this.state)
    })
  },

  onHighlight: function(node) {
    if(!node) this.state.highlighted = null
    else this.state.highlighted = node.uri
    this.trigger(this.state, 'highlight')
  },

  onGetState: function(){
    this.trigger( this.state)
  },

  onNavigateToNode: function(node){
    this.state.neighbours = []

    this.gAgent.getGraphMapAtUri(node.uri).then((triples) => {
      triples[0] = this.convertor.convertToD3('c', triples[0])
      // Before updating the this.state.center, we push the old center node
      // to the node history

      this.state.navHistory.push(this.state.center)
      this.state.center = triples[0]
      if(this.state.navHistory.length > 1) {
        if (this.state.center.name == this.state.navHistory[this.state.navHistory.length - 2].name) {
          this.state.navHistory.pop()
          this.state.navHistory.pop()
        }
      }

      for (var i = 1; i < triples.length; i++) {
        triples[i] = this.convertor.convertToD3('a', triples[i], i, triples.length - 1)
        this.state.neighbours.push(triples[i])
      }

      this.state.highlighted = null
      console.log('number 2')
      this.trigger(this.state, 'redraw')
    })
  }
})
