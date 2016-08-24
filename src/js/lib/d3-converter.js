import rdf from 'rdflib'
import {PRED} from './namespaces.js'
import STYLES from 'styles/app.js'

// D3 Converter takes a node (a node in this context is an array of triples that
// describe an rdf document) and then, based on that returns an array where the
// triples are represented in a different format. This array can then be fed
// to D3 to draw a graph based on the data

class D3Converter {
  convertToD3(rank, node, i, n) {
    // We need to know the index of the node and the total amount of nodes
    // in order to be able to calculate their initial position, so that they are
    // possitioned in a circle
    this.i = i + 1
    this.n = n

    let uri = node.uri
    let connection = node.connection ? node.connection : null

    let props = {
      has_blanks: false,
      uri: uri,
      name:null,
      connection: connection,
      title:null,
      description:null,
      img:null,
      type:null,
      rank: 'neighbour',
      storage: null,
      x: null,
      y: null

    }

    // We create a rdf.graph() object, and populate it with the triples, this
    // allows us to then parse them using the rdflib's function
    // rdf.graph().statementsMatching()
    let g = rdf.graph()
    for (let i = 0; i < node.length; i++) {

      g.add(node[i].subject, node[i].predicate, node[i].object)

      let triple = node[i]
      if (triple.subject.id >= 0) {

        props.has_blanks = true
        if (!props.blanks) {
          props.blanks = []
        }
         
        if (!props.blanks[triple.subject.value]){
          props.blanks[triple.subject.value] = []
        }

        props.blanks[triple.subject.value].push(triple)
      }
      
      // Make the following statements shorter
      let pred = triple.predicate.uri
      let obj = triple.object

      // Updating the attributes of the node object. 
      // The resulting object will have all of it's props filled in, and will
      // be ready to be rendered by D3
      // Note, if a triple is not present, it will be set to null.
      // If the resource is a URI, it's value is stored next to the
      // 'uri' key in the object otherwise it's value is stored in the 'value'
      // key of the object. We need to make sure we are assigning the value
      // regardless of where it's stored

      if (triple.subject.uri === uri){
        if (pred === PRED.givenName.uri) {
          props.name = obj.value ? obj.value : obj.uri
        }
        if (pred === PRED.familyName.uri) {
          props.familyName = obj.value ? obj.value : obj.uri
        }
        if (pred === PRED.fullName.uri) {
          props.fullName = obj.value ? obj.value : obj.uri
        }
        if (pred === PRED.title.uri) {
          props.title = obj.value ? obj.value : obj.uri
        }
        if (pred === PRED.description.uri) {
          props.description = obj.value ? obj.value : obj.uri
        }
        if (pred === PRED.type.uri) {
          props.type = obj.value ? obj.value : obj.uri
        }
        if (pred === PRED.image.uri) {
          props.img = obj.value ? obj.value : obj.uri
        }
        // Storage is used when adding files. Better to do it here then to send
        // extra requests upon upload.
        if (pred === PRED.storage.uri) {
          props.storage = obj.value ? obj.value : obj.uri
        }
      }
    }
    
    // @TODO Have a dedicated RDF type for bitcoin and passport nodes, so that
    // we don't need this hack.
    if (props.title == 'Bitcoin Address')
      props.type = 'bitcoin'
    else if (props.title == 'Passport')
      props.type = 'passport'
   
    // Calculating the coordinates of the nodes so we can put them in a circle
    if (i && n) {
      let angle = 0

      if (this.n<8){
        angle = (2 * Math.PI) / this.n
      }
      else {
        angle= (2 * Math.PI) / 8
      }

      let halfwidth = STYLES.width / 2
      let halfheight = STYLES.height / 2

      let largeNode = STYLES.largeNodeSize
      props.x = Math.sin(angle * (this.i%8)) * largeNode * 0.5 + halfwidth
      props.y = Math.cos(angle * (this.i%8)) * largeNode * 0.5 + halfheight

    } else if (!i && !n && rank ==='a') {
      // This takes care of nodes that are added dynamically, the mid + 30 is
      // the optimal position for spawning new nodes dynamically
      props.x = STYLES.width / 2 + 60
      props.y = STYLES.height / 2 + 60

    }

    if (node.unav) {
      props.unavailable = true
      return props
    }
    
    // We specify the rank of the node here. Center is the center node 
    // and Adjacent is a neighbour, smaller node. This data is not absolute,
    // it obviously depends on the viewport. Used for visualization purposes.
    if (rank === 'a') {
      props.rank = 'neighbour'
    }

    if (rank === 'c') { 
      props.rank = 'center'
    }

    if (!props.name && !props.familyName) {
      if (props.fullName){
        let fName = props.fullName
        props.name = fName.substring(0, fName.indexOf(' '))
        props.familyName = fName.substring(props.name.length, fName.length -1)
      }
    }
    return props
  }
}

export default D3Converter
