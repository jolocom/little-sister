
/*
 * Fetch triples at uri
 * check if it's an acl file
 * if not try to recover and discover the acl file
 * go on
 */

import rdf from 'rdflib'
import GraphAgent from 'lib/agents/graph.js'
import Util from 'lib/util'
import {PRED} from 'lib/namespaces'
import {Writer} from '../rdf.js'

class AclAgent {
  // TODO Check here if the user can modify the acl and throw error if not.
  constructor(uri){

    this.uri = uri
    // TODO, fetch and parse the link header
    this.aclUri = `${this.uri}.acl`
    this.g = rdf.graph()
    this.gAgent = new GraphAgent()
    this.Writer = new Writer()

    this.predMap = {
      write: PRED.write,
      read: PRED.read,
      control: PRED.control
    }
  }

  fetchInfo() {
    return this.gAgent.fetchTriplesAtUri(this.aclUri).then((result)=>{
      let {triples} = result
      for (let triple in triples) {
        let {subject, predicate, object} = triples[triple]
        this.Writer.addTriple(subject,predicate,object)
      }
    }).then(()=>{
      if(this.Writer.g.statementsMatching(undefined, PRED.type, PRED.auth).length === 0)
      {
        // TODO have recovery here
        throw new Error('Link is not an ACL file')
      }
    }) 
  }

  allow(user, mode){
    let policyName

    if (mode !== 'read' && mode !== 'write') {
      throw new Error('Invalid mode supplied!')
    }

    if (typeof user === 'string') {
      user = rdf.sym(user) 
    }
    
    // Check if the triple is already present.
    mode = this.predMap[mode]
    let existing = this.Writer.g.statementsMatching(undefined, PRED.agent, user)

    if (existing.length > 0){
      policyName = existing[0].subject 

      let trip = this.Writer.g.statementsMatching(policyName, PRED.mode, mode )
      // If true, the triple already exists.
      if (trip.length > 0) {
        return  
      // Else, the policy is present but the triple not, so we add the triple.
      } else {
        this.Writer.addTriple(policyName, PRED.mode, mode) 
      }
    // Else this user is not mentioned in the acl file at all so we create a new
    // policy
    } else {
      policyName = rdf.sym(`${this.aclUri}#${Util.randomString(5)}`)
      this.Writer.addTriple(policyName, PRED.type, PRED.auth)
      this.Writer.addTriple(policyName, PRED.access, rdf.sym(this.uri))
      this.Writer.addTriple(policyName, PRED.mode, mode)
      this.Writer.addTriple(policyName, PRED.agent, user)
    }
  }


  commit() {
    return fetch(Util.uriToProxied(this.aclUri), {
      method: 'PUT',
      credentials: 'include',
      body: this.Writer.end(),
      headers: {
        'Content-Type': 'text/turtle',
      }
    }) 
  }

  removeAllow(){
  
  }
  
  allowedPermissions(){
  
  } 

  isAllowed(){
  
  }
}

export default AclAgent
