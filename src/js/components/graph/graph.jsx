// @see http://nicolashery.com/integrating-d3js-visualizations-in-a-react-app/
// This file renders the whole graph component. Takes care of all the nuances. It is also stateless,
// Figuring out now how to make it maintain some changes through refreshes.
import Reflux from 'reflux'
import React from 'react'
import ReactDOM from 'react/lib/ReactDOM'
import Radium from 'radium'
import GraphAgent from 'lib/agents/graph.js'
import GraphD3 from 'lib/graph'
import FabMenu from 'components/common/fab-menu.jsx'
import FabMenuItem from 'components/common/fab-menu-item.jsx'
import PinnedNodes from './pinned.jsx'
import D3Converter from '../../lib/d3-converter'
import GraphStore from '../../stores/graph-store'
import graphActions from '../../actions/graph-actions'
import solid from 'solid-client'
import rdf from 'rdflib'
import {Writer} from '../../lib/rdf.js'
let FOAF = rdf.Namespace('http://xmlns.com/foaf/0.1/')

let graphAgent = new GraphAgent()
let convertor = new D3Converter()
let Graph = React.createClass({

  mixins : [Reflux.listenTo(GraphStore, 'onStateUpdate')],

  // Custom methods

  getGraphEl: function() {
      return ReactDOM.findDOMNode(this.refs.graph)
  },


  onStateUpdate: function(data, signal) {

    this.setState(data)

    if (!this.state.loaded) {
      graphActions.getInitialGraphState()
    }

    if (this.state.loaded && !this.state.drawn){
      this.graph = new GraphD3(this.getGraphEl())
      this.graph.setUpForce(this.state)
      this.graph.drawBackground()
      this.graph.drawNodes()

      // Update the state of the parent, not sure if this is good practice or not
      this.state.drawn = true
      graphActions.setState(this.state)
    }

    if (this.state.newNode) {
      this.graph.addNode(this.state.newNode)

      // We update the state of the store to be in line with the state of the child
      this.state.newNode = null
      graphActions.setState(this.state)
    }

    if(signal == 'redraw'){
      this.graph.eraseGraph()
      this.graph.setUpForce(this.state)
      this.graph.drawNodes()
    } else if ( signal == 'highlight') {
      this.state.highlighted = data.highlighted
    } else if (signal == 'link') {
    }
  },

  // When we finish linking, we select the subjet of the triple.
  linkSubject: function() {
    graphActions.chooseSubject()
  },

  //When we start the linking, we first select the Object of the triple
  linkObject: function() {
    graphActions.chooseObject()
  },

  testAdd(){
    // let destination = this.state.center
    graphActions.createAndConnectNode('test', 'description')
  },

  addNode: function() {
    // This takes a triple describing the new node added!
    // For now it will add a friend relationship to Justas. Reason is we do not have a proper input field yet
    // And also because everyone would be happy to have a friend like Justas.
    let target = prompt()
    graphActions.writeTriple(rdf.sym(this.state.center.uri), FOAF('knows'), rdf.sym(target), 'displayInGraph')
  },

  // Lifecycle methods below
  componentWillMount: function() {
  },

  componentDidMount: function() {
    // Make sure we refresh our state every time we mount the component, this
    // then fires the drawing function from onStateUpdate
    graphActions.getState()
  },

  componentWillUpdate: function(nextProp, nextState){
  },

  componentDidUpdate: function() {
  },

  componentWillUnmount: function(){
    this.state.drawn = false
    this.state.highlighted = null
    graphActions.setState(this.state)
    if (this.graph) this.graph.eraseGraph()
  },

  getStyles: function() {
    let styles = {
      container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      },
      chart: {
        flex: 1
      },
      menu: {
        position: 'absolute',
        bottom: '16px',
        right: '16px'
      }
    }
    return styles
  },

  // We are using the buttons as placeholders, when the frontend is implemented, we will use the actuall buttons
  render: function() {
    let styles = this.getStyles()
    return (
      <div style={styles.container}>
        <FabMenu style={styles.menu}>
          <FabMenuItem icon="comment" label="Comment" onClick={() => {this.addNode('comment')}}/>
          <FabMenuItem icon="insert_photo" label="Image" onClick={() => {this.testAdd()}}/>
          <FabMenuItem icon="person" label="Contact" onClick={() => {this.addNode('person')}}/>
          <FabMenuItem icon="attachment" label="File" onClick={() => {this.linkSubject()}}/>
          <FabMenuItem icon="wb_sunny" label="Sensor" onClick={() => {this.linkObject()}}/>
        </FabMenu>

        <div style={styles.chart} ref="graph"></div>

        {this.props.children}

        <PinnedNodes/>
      </div>
   )
  }
})
export default Radium(Graph)
