'use strict'

// THIS FILE TAKES CARE OF DRAWING THE D3 GRAPH
// It is passed a state from the graph.jsx file, and then it draws
// the graph according to that state. The element itself is stateless.
// Currently I have issues with doing persistent changes here, for instance
// a moved node will not save upon refresh.
import d3 from 'd3'
import STYLES from 'styles/app'
import {
  EventEmitter
}
from 'events'

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import JolocomTheme from 'styles/jolocom-theme'
import TouchRotate from './touchRotate'

const theme = getMuiTheme(JolocomTheme)

export default class GraphD3 extends EventEmitter {

  constructor(el, mode) {

    super()

    this.mode = mode
    this.MAX_VISIBLE_NUMBER_OF_NODES = 8
    this.smallNodeSize = STYLES.smallNodeSize
    this.largeNodeSize = STYLES.largeNodeSize

    this.graphContainer = el

    this.refreshDimensions()

    this.rendered = false
    this.rotationIndex = 0

    this.svg = d3.select(this.graphContainer).append('svg:svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('svg:g')

    this.svg.append('svg:g')
      .attr('class','background-layer')
      .append('svg:g')
      .attr('class','background-layer-links')

    // TouchRotate setup
    var thisInstance = this
    var getTouchRotateCallbacks = function () {
      var lastNotchRadian = false

      return {
        move: function (touchMoveRadian) { // closure isn't functional #todo

          // Normalization of touchMoveRadian
          //   Quick fix because touchMoveRadian abruptly switches from
          // (+3/2 * PI) to (-1/2 * PI)
          //   This doesn't pose any problem when using touchMoveRadian
          // as an absolute value, but if we are comparing the new
          // touchMoveRadian to the previous one, then it is problematic
          var radianDiff = touchMoveRadian - lastNotchRadian
          if (radianDiff < -Math.PI){
            radianDiff = touchMoveRadian + Math.PI * 2 - lastNotchRadian
          }
          else if (radianDiff > Math.PI){
            radianDiff = lastNotchRadian - (touchMoveRadian + Math.PI * 2)
          }

          if (lastNotchRadian === false) // first drag
          {
            lastNotchRadian = touchMoveRadian
          }
          else if (radianDiff < -Math.PI / thisInstance.MAX_VISIBLE_NUMBER_OF_NODES) // @todo constant / not stateless
          {
            lastNotchRadian = touchMoveRadian
            if (thisInstance.rotationIndex < thisInstance.numberOfNeighbours - thisInstance.MAX_VISIBLE_NUMBER_OF_NODES) {
              thisInstance.rotationIndex++
              thisInstance.emit('change-rotation-index', thisInstance.rotationIndex)
              thisInstance.updateAfterRotationIndex()
            }
          } else if (radianDiff > Math.PI / thisInstance.MAX_VISIBLE_NUMBER_OF_NODES) // @todo constant / not stateless
          {
            lastNotchRadian = touchMoveRadian
            if (thisInstance.rotationIndex > 0) {
              thisInstance.rotationIndex--
              thisInstance.emit('change-rotation-index', thisInstance.rotationIndex)
              thisInstance.updateAfterRotationIndex()
            }
          }
        },
        end: function () {
          lastNotchRadian = false
        }
      }
    }

    new TouchRotate(this.graphContainer, getTouchRotateCallbacks())
  }

  // Function to be called when the state changes
  render = function (state) { // nodes
    console.warn("REINDEER", state)
    this.state = state;

    if (this.rendered)
      this.eraseGraph() // erase everything, including background

    this.rendered = true

    this.refreshDimensions() // ?
    this.orderNodes() // if render is the changeNodes function, then this makes sense.

    // Update dataNodes
    this.dataNodes = [state.center]
    this.visibleDataNodes = [state.center] // @TODO you can safely remove this
    this.dataLinks = []
    this.visibleDataLinks = [] // @TODO safely removable
    this.numberOfNeighbours = 0

    // Flatten the center and neighbour nodes we get from the state
    for (let i = 0; i < state.neighbours.length; i++) {
      this.dataNodes.push(state.neighbours[i])
      this.dataLinks.push({
        'source': i + 1,
        'target': 0
      })
      this.numberOfNeighbours++
    }

    // Start up everything
    this.setUpVisibleNodes()
    this.setUpForce() // <- creates force and starts it. why does it need to be done several times?
    this.drawBackground() // refresh the background in case we need to draw more things because for instance scrolling is now enabled
    this.d3update()
  }.bind(this)

  refreshDimensions = function () {
    this.width = this.graphContainer.offsetWidth || STYLES.width
    this.height = this.graphContainer.offsetHeight || STYLES.height
    this.centerCoordinates = {
      y: (this.height / 2),
      x: this.width / 2
    }
  }

  orderNodes= function () {
    this.state.neighbours.sort(function(a,b) {
      if ((a.name || a.title || 'zzzzzz').toLowerCase() > (b.name || b.title || 'zzzzzz').toLowerCase())
        return 1
      else if ((a.name || a.title || 'zzzzzz').toLowerCase() < (b.name || b.title || 'zzzzzz').toLowerCase())
        return -1
      else
        return 0
    })

  }

  // Starts the force simulation.
  setUpForce = function () {

    // now the nodes are there, we can initialize
    // Then we initialize the simulation, the force itself.
    this.force = d3.layout.force()
      .nodes(this.visibleDataNodes) // @TODO compile nodes object with object assign on-the-fly
      .links(this.visibleDataLinks)
      .charge(-100)
      .chargeDistance(STYLES.largeNodeSize * 2)
      .linkDistance((d) => {
        if (d.source.rank == 'history' && d.source.histLevel <= 0) return STYLES.largeNodeSize * 2
        else if (d.source.rank == 'history') return STYLES.smallNodeSize
        else return STYLES.largeNodeSize * 1.4
      })
      .size([this.width, this.height])
      .start()

    // We define our own drag functions, allow for greater control over the way
    // it works
    this.nodeDrag = this.force.drag()
      .on('dragend', this.dragEnd)
      .on('drag', function () {
        d3.event.sourceEvent.stopPropagation()
      })
      .on('dragstart', function () {
        d3.event.sourceEvent.stopPropagation()
      })

  }.bind(this)

  // Draws the scrolling scrollingIndicators and scrolling circle.
  drawBackground = function () {

    this.svg.selectAll('.dial, .dots, .background, .center-circle').remove();

    /*this.svg.select('g.background-layer').append('svg:rect') // used for the positioning of the lines; see if we need it
      .attr('class','background')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'transparent')
    */

    // Center cicle
    this.svg.select('g.background-layer').append('svg:circle')
      .attr('class','center-circle')
      .attr('cx', this.width * 0.5)
      .attr('cy', this.height * 0.5)
      .attr('r', this.largeNodeSize * 0.57 * 1.1)
      .style('fill', STYLES.lightGrayColor)

    if (this.numberOfNeighbours > this.MAX_VISIBLE_NUMBER_OF_NODES) {

      // Gradient
      // d3.select(this.svg.node().parentNode).select('g.background-layer').append('svg:rect').attr("x",this.width * 0.5 - 125 - this.largeNodeSize * 0.02).attr("y",(this.height * 0.5) - (11 * 10) - (this.largeNodeSize * 0.9)).attr("rx",15).attr("ry",15).attr("width", 125).attr("height", 120).attr("fill","url(#fade-to-white)");

      // Draw dotted line to indicate there are more nodes
      for (var i = 0; i < 12; i++) {
        this.svg.select('g.background-layer').append('svg:circle')
          .attr('class', 'dots')
          .attr('cx', this.width * 0.5)
          .attr('cy', (this.height * 0.5) - (i * 10) - (this.largeNodeSize * 0.9))
          .attr('r', this.largeNodeSize * 0.02)
          .style('fill', STYLES.lightGrayColor)
      }

      this.dial = this.svg.select('g.background-layer').append('path')
        .attr('class', 'dial')

      this.updateDial()

      this.drawScrollingIndicator()

    }

  }.bind(this)

  updateDial = function() {

    // Don't do anything if we haven't received the state yet; when we receive the state,
    // render() will be called, and updateDial() is called inside render()
    if (typeof this.numberOfNeighbours == 'undefined') return;

    this.arch = this.MAX_VISIBLE_NUMBER_OF_NODES / this.numberOfNeighbours

    this.archAngle = 360 / this.numberOfNeighbours

    this.arc = d3.svg.arc()
      .innerRadius(this.largeNodeSize * 0.5)
      .outerRadius(this.largeNodeSize * 0.57)
      .startAngle(0)

    let maxRotationIndex = this.numberOfNeighbours - this.MAX_VISIBLE_NUMBER_OF_NODES

    this.svg.select('.dial')
      .attr('transform', 'translate(' + this.width * 0.5 + ',' + this.height * 0.5 + ') rotate(' + (this.archAngle * (maxRotationIndex - this.rotationIndex)) + ')') // remove "maxRotationIndex -" to reverse the direction
      .datum({
          endAngle: 2 * Math.PI * this.arch
        })
      .style('fill', theme.graph.dialColor)
      .attr('d', this.arc)
  }

  drawScrollingIndicator = function(){
    let angle = Math.PI/14

    this.svg.selectAll('.scrolling-indicator').remove();

    for (let i = 0; i < 10; i++) {
      this.svg.select('.background-layer').append('svg:circle')
      .attr('class', 'scrolling-indicator')
      .attr('cx', Math.sin(angle * (i + 5.5)) * STYLES.largeNodeSize * 2.5 + this.centerCoordinates.x)
      .attr('cy', Math.cos(angle * (i + 5.5)) * STYLES.largeNodeSize * 2.5 + this.centerCoordinates.y)
      .attr('r', this.largeNodeSize * 0.25)
      .style('fill', STYLES.grayColor)
      .attr('opacity', 0)
      .transition().duration(STYLES.nodeTransitionDuration*0.3).delay(100*i)
      .attr('opacity', 1)
      .transition().duration(STYLES.nodeTransitionDuration*0.8)
      .attr('opacity', 0)
    }
  }

  // d3 "update" routine
  d3update = function () {
    let self = this

    // These make the following statements shorter
    let largeNode = this.largeNodeSize
    let smallNode = this.smallNodeSize

    // "View node info" button
    // @TODO should be in render and not inside the update pattern
    let defsFull = this.svg.append('svg:defs')
    defsFull.append('svg:pattern')
      .attr('id', 'full')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('x', (STYLES.largeNodeSize / STYLES.fullScreenButtonPosition) - STYLES.fullScreenButton / 2)
      .attr('y', -(STYLES.largeNodeSize / STYLES.fullScreenButtonPosition) - STYLES.fullScreenButton / 2)
      .attr('patternUnits', 'userSpaceOnUse')
      .append('svg:image')
      .attr('xlink:href', 'img/full.jpg')
      .attr('width', STYLES.fullScreenButton)
      .attr('height', STYLES.fullScreenButton)

    // Fade to white
    //   let defFadeToWhite = defsFull.append('svg:linearGradient').attr('id','fade-to-white').attr('x1',0).attr('x2',1).attr('y1',0).attr('y2',0)
    //   defFadeToWhite.append('svg:stop').attr('offset','0%').attr('stop-color','white').attr('stop-opacity', 0)
    //   defFadeToWhite.append('svg:stop').attr('offset','75%').attr('stop-color','white')

    // LINKS DATA JOIN
    this.link = this.svg.select('.background-layer .background-layer-links').selectAll('line').data(this.visibleDataLinks);

    // LINKS ENTER
    // We draw the lines for all the elements in the dataLinks array.
    this.link
      .enter()
        .append('line')
        .attr('class','link')
        .attr('stroke-width', () => {
          // Capped at 13, found it to look the best
          return this.width / 50 > 10 ? 10 : this.width / 50})
        .attr('stroke', STYLES.lightGrayColor) // this.link should be the enter stuff neh?

    // LINKS EXIT
    this.link
      .exit()
        .remove()


    // NODES DATA JOIN
    this.node = this.svg.selectAll('.node').data(this.visibleDataNodes, (d) => {
        return (d.uri + d.connection)
    })

    // NODES ENTER
    // We draw a node for each element in the dataNodes array
    let nodeEnter = this.node
      .enter()
        .append('g')
        .attr('class', 'node')
        .call(this.nodeDrag)

    // NODES EXIT
    this.node
      .exit()
        .remove()

    // add avatars
    // @todo review following code / integrate better

    let defsImages = nodeEnter.append('svg:defs')
    defsImages.append('svg:pattern')
      .attr('id', (d) => d.uri + d.connection)
      .attr('class', 'image')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('x', (d) => {
        return d.rank == 'center' ? -largeNode / 2 : -smallNode / 2
      })
      .attr('y', (d) => {
        return d.rank == 'center' ? -largeNode / 2 : -smallNode / 2
      })
      .attr('patternUnits', 'userSpaceOnUse')
      .append('svg:image')
      .attr('xlink:href', (d) => d.img)
      .attr('width', (d) => {
        return d.rank == 'center' ? largeNode : smallNode
      })
      .attr('height', (d) => {
        return d.rank == 'center' ? largeNode : smallNode
      })
      .attr('preserveAspectRatio', 'xMinYMin slice')

    // These will be later used in the add node function, therefore they have
    // to be reachable
    this.defsFilter = this.svg.append('svg:defs')
    this.filter = this.defsFilter.append('filter')
      .attr('id', 'darkblur')

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    // This basically takes care of blurring
    this.filter.append('feGaussianBlur')
      .attr('stdDeviation', 1.5)
    this.componentTransfer = this.filter.append('feComponentTransfer')
    this.componentTransfer.append('feFuncR')
      .attr('type', 'linear')
      .attr('slope', 0.3)
    this.componentTransfer.append('feFuncG')
      .attr('type', 'linear')
      .attr('slope', 0.3)
    this.componentTransfer.append('feFuncB')
      .attr('type', 'linear')
      .attr('slope', 0.3)

    let defsShadow = this.svg.append('svg:defs')

    let filterShadow = defsShadow.append('filter')
      .attr('id', 'drop-shadow')

    filterShadow.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 1)
      .attr('result', 'blur')

    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    filterShadow.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', -1.5)
      .attr('dy', 1.5)
      .attr('result', 'offsetBlur')

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    let feMerge = filterShadow.append('feMerge')

    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur')
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic')


    // Used as a background circle for image nodes
    nodeEnter.append('circle')
      .attr('class', 'nodeback')
      .attr('r', (d) => {
        if (d.rank == 'center')
          return largeNode / 2
        else if (d.rank == 'history') {
          return smallNode / 3
        } else return smallNode / 2
      })
      .attr('fill','#000BB')
      .transition()
      .duration(750)
      .attr('fill', theme.graph.imageNodeColor)

    nodeEnter.append('circle')
      .attr('class', 'nodecircle')
      .attr('r', (d) => {
        if (d.rank == 'center')
          return largeNode / 2
        else if (d.rank == 'history') {
          return smallNode / 3
        } else return smallNode / 2
      })
      .attr('fill',theme.graph.transitionStartNodeColor)
      .transition()
      .duration(750)
      .attr('fill',(d) => {
        if (d.img && d.rank != 'history') return 'url(#' + d.uri + d.connection + ')'
        else {
          if (d.rank == 'history') {
            return STYLES.grayColor
          } else if (d.rank == 'unavailable') {
            return STYLES.grayColor
          } else if (d.rank === 'center') {
            return theme.graph.centerNodeColor
          } else {
            return theme.graph.textNodeColor
          }
        }
      })



    // The name of the person, displays on the node
    nodeEnter.append('svg:text')
      .attr('class', 'nodetext')
      .style('fill', '#F0F7F5')
      .attr('text-anchor', 'middle')
      .attr('opacity', (d) => {
        if (d.img && d.rank != 'history') return 0
        else return 1
      })
      .attr('dy', '.35em')
      .attr('font-size', (d) => d.rank == 'history' ? STYLES.largeNodeSize / 12 : STYLES.largeNodeSize / 8)
      .style('font-weight', 'bold')
      // In case the rdf card contains no name
      .text((d) => {
        if (d.name) return d.name
        else if (d.fullName) return d.fullName
        else if (d.title) {
          if (d.title.length > 7) return d.title.substring(0, 7) + '...'
          else return d.title
        } else return 'Not Found'
      })

    // The text description of a person
    nodeEnter.append('svg:text')
      .attr('class', 'nodedescription')
      .style('fill', '#F0F7F5')
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .attr('dy', '0.5em')
      .style('font-size', '80%')
      .text(function (d) {
        // In case the person has no description available.
        if (d.description) {
          if (d.description.length > 45) return (d.description.substring(0, 45) + '...')
          else return d.description
        }
      })
      // This wraps the description nicely.
      .call(this.wrap, STYLES.largeNodeSize * 0.75, ' ', ' ')

    let full = nodeEnter.append('circle')
      .attr('class', 'nodefullscreen')
      .attr('r', 0)
      .style('fill', 'url(#full)')
      .attr('cy', -STYLES.largeNodeSize / STYLES.fullScreenButtonPosition)
      .attr('cx', STYLES.largeNodeSize / STYLES.fullScreenButtonPosition)
      .style('filter', 'url(#drop-shadow)')

    // Subscribe to the click listeners
    this.node.on('click', function (data) {
      self.onClick(this, data)
    })
    this.node.on('dblclick', function (data) {
      self.onDblClick(this, data)
    })

    full.on('click', function (data) {
      self.onClickFull(this, data)
    })


    this.force.on('tick', this.tick)
  }.bind(this)

  // This function fires upon tick, around 30 times per second?
  tick = function (e) {
    this.refreshDimensions()

    let k = 1 * e.alpha
    d3.selectAll('g .node').attr('d', (d) => { // @TODO overwriting the force coordinates, maybe not good
      if (d.rank == 'center') {
        d.x = this.centerCoordinates.x
        d.y = this.centerCoordinates.y
      } else if (d.rank === 'history') {
        d.x += (this.centerCoordinates.x - d.x) * k
        if (d.histLevel == 0) {
          d.y += (this.centerCoordinates.y - d.y + STYLES.largeNodeSize * 2) * k
        } else d.y += (this.centerCoordinates.y - d.y + STYLES.largeNodeSize * 2 + (STYLES.smallNodeSize*0.8) *(d.histLevel)) * k
      }
    })

    if (this.numberOfNeighbours > this.MAX_VISIBLE_NUMBER_OF_NODES) {
      d3.selectAll('.node').attr('d', (d) => {
        if (d.rank == 'neighbour') {
          d.x += (this.nodePositions[d.position].x - d.x) * k
          d.y += (this.nodePositions[d.position].y - d.y) * k
        }
      })
    }

    // Update the link positions. @TODO shouldn't be needed? Call d3update() ?
    d3.selectAll('.link')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      // Update the node positions. We use translate because we are working with
      // a group of elements rather than just one.
    d3.selectAll('g .node').attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')')
  }.bind(this)

  // We check if the node is dropped in the center, if yes we navigate to it.
  // We also prevent the node from bouncing away in case it's dropped to the middle
  dragEnd = function (node) {
    if (node.rank == 'center' || node.rank == 'unavailable') {
      this.force.start()
        // In here we would have the functionality that opens the node's card
    } else if (node.rank == 'neighbour' || node.rank == 'history') {
      // We check if the node is dropped on top of the center node
      let w = this.width
      let h = this.height
      let size = STYLES.largeNodeSize
      let x = node.x > w / 2 - size / 2 && node.x < w / 2 + size / 2
      let y = node.y > h / 2 - size / 2 && node.y < h / 2 + size / 2

      // If yes, we change the perspective
      if (x && y) {
        this.force.stop()
        this.emit('center-changed', node)
      }
    }
  }.bind(this)

  // Enlarges and displays extra info about the clicked node, while setting
  // all other highlighted nodes back to their normal size


  setUpVisibleNodes = function () {

    // No scrolling

    if (this.numberOfNeighbours <= this.MAX_VISIBLE_NUMBER_OF_NODES) {
      this.visibleDataNodes = this.dataNodes
      this.visibleDataLinks = this.dataLinks
      return
    }

    // Yes scrolling (more than 8 visible nodes)

    // Smooth radial scrolling animation
    //  d3.select('.dial').transition()
    //   .duration(100)
    //   .call(this.arcTween, 2*Math.PI*(this.rotationIndex+1)/this.numberOfNeighbours)

    // Position nodes manually
    this.nodePositions = []

    let angle = (2 * Math.PI) / this.MAX_VISIBLE_NUMBER_OF_NODES, num = 0
    for (let i = 0; i < this.numberOfNeighbours; i++) { // @TODO should modify .x inside the node
      let pos = {
        x: Math.sin(angle * (num + 3.5)) * STYLES.largeNodeSize * 1.4 + this.centerCoordinates.x,
        y: Math.cos(angle * (num + 3.5)) * STYLES.largeNodeSize * 1.4 + this.centerCoordinates.y
      }
      this.nodePositions.push(pos)
      num --
    }

    // Hydrate visibleDataNodes based on rotationIndex
    // @TODO iterate through this.neighbours rather; have this.neighbourNodes, this.center, this.historyNodes and not have this.dataNodes (where 0 = xx)
    this.visibleDataNodes = []
    this.visibleDataNodes[0] = this.dataNodes[0] // @TODO not intuitive
    this.visibleDataLinks = []
    let nodeCount = 0
    let first = true
    for (let i = this.rotationIndex + 1; i != this.rotationIndex; i = (i + 1) % this.dataNodes.length) {

      if (this.dataNodes[i].rank == 'neighbour' && nodeCount < this.MAX_VISIBLE_NUMBER_OF_NODES) {
        this.visibleDataNodes.push(this.dataNodes[i])
        this.visibleDataNodes[this.visibleDataNodes.length - 1].position = nodeCount
        this.visibleDataNodes[this.visibleDataNodes.length - 1].x = this.nodePositions[nodeCount].x
        this.visibleDataNodes[this.visibleDataNodes.length - 1].y = this.nodePositions[nodeCount].y
        this.visibleDataNodes[this.visibleDataNodes.length - 1].px = this.nodePositions[nodeCount].x
        this.visibleDataNodes[this.visibleDataNodes.length - 1].py = this.nodePositions[nodeCount].y
        this.visibleDataLinks.push({
          'source': this.visibleDataNodes.length - 1,
          'target': 0
        })
        nodeCount++
      }

    }

    // Add history nodes to visibleDataNodes
    for (var i = 0; i < this.dataNodes.length; i++) {
      if (this.dataNodes[i].rank == 'history') {
        this.visibleDataNodes.push(this.dataNodes[i])
        if (first) {
          this.visibleDataLinks.push({
            'source': this.visibleDataNodes.length - 1,
            'target': 0
          })
          first = false
        } else {
          this.visibleDataLinks.push({
            'source': this.visibleDataNodes.length - 1,
            'target': this.visibleDataNodes.length - 2
          })
        }
      }
    }

  }.bind(this)

  arcTween = function (transition, newAngle) {
    let arc = d3.svg.arc()
        .innerRadius(this.largeNodeSize* 0.5)
        .outerRadius(this.largeNodeSize* 0.57)
        .startAngle(0)

    transition.attrTween('d', function(d) {

      var interpolate = d3.interpolate(d.endAngle, newAngle)

      return function(t) {

        d.endAngle = interpolate(t)

        return arc(d)
      }
    })
  }.bind(this)

  onClickFull = function (node, data) {
    //stops propagation to node click handler
    this.emit('view-node', data, node)
    d3.event.stopPropagation()
  }

  onClick = function (node, data) {
    d3.event.stopPropagation()

    this.emit('select', data, node)

    // d3.event.defaultPrevented returns true if the click event was fired by
    // a drag event. Prevents a click being registered upon drag release.
    if (data.rank == 'history' || d3.event.defaultPrevented) return

    let smallSize = STYLES.smallNodeSize
    let largeSize = STYLES.largeNodeSize

    data.wasHighlighted = data.highlighted

    // @TODO this could be done using d3js and modifying ".selected" from the nodes (.update()), no?

    // Reset size of all circles
    d3.selectAll('g .node')
      .filter(function (d) {
        return d.highlighted
      })
      .selectAll('.nodecircle')
      .transition('reset').duration(STYLES.nodeTransitionDuration)
      .attr('r', (d) => {
        return d.rank == 'center' ? largeSize / 2 : smallSize / 2
      })

    // Reset colour of all circles
    d3.selectAll('g .node').filter(function (d) {
      return d.highlighted && !d.img
    })
      .select('.nodecircle')
      .transition('resetcolor').duration(STYLES.nodeTransitionDuration)
      .style('fill', (d) => {
        if (d.rank == 'history') {
          return STYLES.grayColor
        } else if (d.rank == 'unavailable') {
          return STYLES.grayColor
        } else if (d.rank === 'center') {
          return theme.graph.centerNodeColor
        } else {
          return theme.graph.textNodeColor
        }
      })

    // Reset sizes of all patterns
    d3.selectAll('g .node').filter(function (d) {
      return d.highlighted
    })
      .selectAll('pattern')
      .transition('pattern').duration(STYLES.nodeTransitionDuration)
      .attr('x', (d) => {
        return d.rank == 'center' ? -largeSize / 2 : -smallSize / 2
      })
      .attr('y', (d) => {
        return d.rank == 'center' ? -largeSize / 2 : -smallSize / 2
      })

    // Reset sizes of all images
    d3.selectAll('g .node')
      .filter(function (d) {
        return d.highlighted
      })
      .selectAll('image')
      .transition('image').duration(STYLES.nodeTransitionDuration)
      .attr('width', (d) => {
        return d.rank == 'center' ? largeSize : smallSize
      })
      .attr('height', (d) => {
        return d.rank == 'center' ? largeSize : smallSize
      })
      .style('filter', null)

    // We set the name of the node to invisible in case it has a profile picture
    // In case the node has no picture, we display its name.
    d3.selectAll('g .node')
      .filter(function (d) {
        return d.highlighted
      })
      .selectAll('.nodetext')
      .transition('reset').duration(STYLES.nodeTransitionDuration)
      .attr('dy', '.35em')
      .attr('opacity', (d) => {
        return d.img ? 0 : 1
      })

    // Hide the descriptions of all nodes
    d3.selectAll('g .node')
      .filter(function (d) {
        return d.highlighted
      })
      .selectAll('.nodedescription')
      .transition('description').duration(STYLES.nodeTransitionDuration)
      .attr('opacity', 0)

    // Make the fullscreen button of all nodes smaller
    d3.selectAll('g .node')
      .filter(function (d) {
        return d.highlighted
      })
      .selectAll('.nodefullscreen')
      .transition('reset').duration(STYLES.nodeTransitionDuration)
      .attr('r', 0)

    // Un-highlight all nodes
    d3.selectAll('g .node')
      .attr('d', (d) => d.highlighted = false)

    if (data.wasHighlighted) {
      data.highlighted = false
      this.emit('deselect')
    } else {
      // NODE signifies the node that we clicked on. We enlarge it.


      // Enlarge the node
      d3.select(node).select('.nodecircle')
        .transition('grow').duration(STYLES.nodeTransitionDuration)
        .attr('r', STYLES.largeNodeSize / 2)
        .attr('opacity', 1)
        .each('start', (d) => {
          if (!d.img) {
            d3.select(node).select('.nodecircle')
              .transition('highlight').duration(STYLES.nodeTransitionDuration)
              .style('fill', theme.graph.centerNodeColor)
          }
        })

      // Enlarge the pattern of the node we clicked on
      d3.select(node).select('pattern')
        .transition('pattern').duration(STYLES.nodeTransitionDuration)
        .attr('x', -STYLES.largeNodeSize / 2)
        .attr('y', -STYLES.largeNodeSize / 2)

      if (this.mode !== 'preview'){
      // Enlarge full screen button
      d3.select(node).select('.nodefullscreen')
        .transition('highlight').duration(STYLES.nodeTransitionDuration)
        .attr('r', STYLES.fullScreenButton / 2)
      }
      // Enlarge the image of the node we clicked on
      // We also blur it a bit and darken it, so that the text displays better
      d3.select(node).select('image')
        .transition('image').duration(STYLES.nodeTransitionDuration)
        .attr('width', STYLES.largeNodeSize)
        .attr('height', STYLES.largeNodeSize)
        .style('filter', 'url(#darkblur)')

      // There is a slight bug when if you click on nodes really quickly, the text
      // on some fails to disappear; needs further investigation

      // Fade in the description
      d3.select(node).selectAll('text')
        .transition('description').duration(STYLES.nodeTransitionDuration)
        .attr('opacity', 0.9)

      // Fade in the node name and make the text opaque
      d3.select(node).select('.nodetext')
        .transition('highlight').duration(STYLES.nodeTransitionDuration)
        .attr('dy', (d) => d.description ? '-.5em' : '.35em')
        .attr('opacity', 1)
      data.highlighted = true
    }
  }.bind(this)

  updateHistory = function (history) {

    if (typeof history !== 'undefined' && history.length > 0) {

      this.force.stop()
      for (var j = history.length-1, rank=0;
           j >= 0;
           j--, rank++) {

        let already_exists = false
        for (let dataNode of this.dataNodes)
        {
          if (dataNode['uri'] === history[j]['uri'] && dataNode['rank']=== 'history')
          {
            already_exists = true
          }
        }
        if (already_exists) continue

        history[j].connection = 'hist'
        history[j].rank = 'history'
        history[j].histLevel = rank

        if (rank == 0) {
          this.dataNodes.push(history[j])
          this.dataLinks.push({
            source: this.dataNodes.length - 1,
            target: 0
          })
        } else {
          this.dataNodes.push(history[j])
          this.dataLinks.push({
            source: this.dataNodes.length - 1,
            target: this.dataNodes.length - 2
          })
        }
      }
      this.setUpVisibleNodes()
      this.force.nodes(this.visibleDataNodes)
      this.force.links(this.visibleDataLinks)
      this.d3update()
      this.force.start()
    }
    this.d3update()
  }.bind(this)

  // Wraps the description of the nodes around the node.
  // http://bl.ocks.org/mbostock/7555321
  wrap = function (text, width, separator, joiner) {
    if (separator == undefined) {
      separator = /\s+/
      joiner = ' '
    }
    let hasWrapped = []
    text.each(function () {
      let text = d3.select(this)
      let words = text.text().split(separator)
      let line = []
      let lineNumber = 0
      let lineHeight = 1 // ems
      let y = text.attr('y')
      let dy = parseFloat(text.attr('dy'))
      let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em')

      for (var word of words) {
        line.push(word)
        tspan.text(line.join(joiner))
        if (tspan.node().getComputedTextLength() > width) {
          hasWrapped.push(this)
          line.pop()
          tspan.text(line.join(joiner))
          line = [word]
          lineNumber++
          tspan = text
            .append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', ((lineNumber == 0) ? (dy + 'em') : (lineHeight + 'em'))) //++lineNumber * lineHeight + dy + 'em') NOTE(philipp): dy is relative to previous sibling (== lineheight for all but first line)
            .text(word)
        }
      }
    })
    return hasWrapped
  }

  // Erases all the elements on the svg, but keeps the svg.
  // .background-layer must be the first element of this.svg, and its first element must be .background-layer-links
  eraseGraph = function () {
    if (this.force) this.force.stop()
    this.svg.selectAll('.background-layer .background-layer-links *, .background-layer ~ *').remove()
  }.bind(this)

  // Alternative to dragging the node to the center. Does the same thing pretty much
  onDblClick = function (node, data) {
    if (data.rank != 'center') {
      this.emit('center-changed', data)
    }
  }.bind(this)

  // Function called after deleting a node; render() is not called after, so that we can do a smooth animation.
  deleteNodeAndRender = function (state) {

    let deletedNodeUri = d3.select(state.selected).datum().uri

    // Deletion animations

    d3.selectAll('.node').filter(function (d) {
      return d.uri == deletedNodeUri && d.rank == 'neighbour'
    })
      .select('pattern')
      .transition().duration(STYLES.nodeTransitionDuration / 3).delay(100)
      .attr('x', STYLES.largeNodeSize*0.8 )
      .attr('y', STYLES.largeNodeSize*0.8 )

    d3.selectAll('.node').filter(function (d) {
      return d.uri == deletedNodeUri && d.rank == 'neighbour'
    })
      .select('image')
      .transition().duration(STYLES.nodeTransitionDuration / 3).delay(100)
      .attr('width', STYLES.largeNodeSize*0.8)
      .attr('height', STYLES.largeNodeSize*0.8)

    d3.selectAll('.node').filter(function (d) {
      return d.uri == deletedNodeUri && d.rank == 'neighbour'
    })
      .select('circle')
      .transition().duration(STYLES.nodeTransitionDuration / 3).delay(100)
      .attr('r', STYLES.largeNodeSize/2.2) // STYLES.largeNodeSize / 2.2
      .each('end', () => {

        for (var i = 1; i < this.dataNodes.length; i++) {
          if (this.dataNodes[i].uri == deletedNodeUri && this.dataNodes[i].rank == 'neighbour'){
            console.log('FOUND YOU!')
            this.dataNodes.splice(i, 1)
          }
        }

        for (var i = 0; i < this.dataLinks.length; i++) {
          if (this.dataLinks[i].source.uri == deletedNodeUri && this.dataLinks[i].source.rank == 'neighbour'){
            console.log('FOUND YOU! link')
            this.dataLinks.splice(i, 1)
          }
        }

        this.numberOfNeighbours--
        this.force.stop()
        this.setUpVisibleNodes()
        this.force.nodes(this.visibleDataNodes)
        this.force.links(this.visibleDataLinks)
        this.d3update()
        this.force.start()


        // Once the animation is ended, we re-render everything
        // It updates the visibility of the radial scrollbar and updates this.dataNodes etc

        // this.render(state)

        // Smooth radial scrolling
        // d3.select('.dial').transition()
        //  .duration(100)
        //  .call(this.arcTween, 2*Math.PI*(this.numberOfNodes/this.numberOfNeighbours))
      })
  }

  updateAfterRotationIndex = function() {
    this.updateDial()
    if (this.force)
    {
      // @TODO do we realy need to do all of the following?
      this.force.stop()
      this.setUpVisibleNodes()
      this.force.nodes(this.visibleDataNodes)
      this.force.links(this.visibleDataLinks)
      this.d3update()
      this.force.start()
    }
  }.bind(this)

  // Called from graph.jsx
  setRotationIndex = function (rotationIndex) {
    this.rotationIndex = rotationIndex // @todo only execute updateAfterRot if index changed
    this.updateAfterRotationIndex()
  }.bind(this)

  // This is not implemented apparently.
  onResize = function () {
    this.setSize()
  }.bind(this)

  // Not yet implemented.
  setSize = function () {
    this.width = this.graphContainer.offsetWidth
    this.height = this.graphContainer.offsetHeight
    this.svg.attr('width', this.width).attr('height', this.height)
  }.bind(this)
}
