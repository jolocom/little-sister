// local rdf namespace mappings
import rdf from 'rdflib'
const cert = 'http://www.w3.org/ns/auth/cert#'

let SCHEMA = rdf.Namespace('https://schema.org/')
let FOAF = rdf.Namespace('http://xmlns.com/foaf/0.1/')
let TERMS = rdf.Namespace('http://www.w3.org/ns/solid/terms#')
let NIC = rdf.Namespace('http://www.w3.org/ns/pim/space#')
let SIOC = rdf.Namespace('http://rdfs.org/sioc/ns#')

export {SCHEMA, FOAF, TERMS, NIC, SIOC}

export const USER = {
  givenName: FOAF('givenName'), 
  familyName: FOAF('familyName'), 
  fullName: FOAF('name'),
  image: FOAF('img'),
  email: FOAF('mbox'),
  inbox: TERMS('inbox'),
  storage: NIC('storage'),
  knows: FOAF('knows'),
  isRelatedTo: SCHEMA('isRelatedTo')
}

export const CERT = {
  exponent: `${cert}exponent`,
  key: `${cert}key`,
  modulus: `${cert}modulus`
}

const ldp = 'http://www.w3.org/ns/ldp#'
export const LDP = {
  BasicContainer: `${ldp}BasicContainer`
}

const ssn = 'http://purl.oclc.org/NET/ssnx/ssn#'
export const SSN = {
  hasValue: `${ssn}hasValue`,
  observes: `${ssn}observes`,
  Sensor: `${ssn}Sensor`
}
