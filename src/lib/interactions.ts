import { JSONWebToken, JWTEncodable } from 'jolocom-lib/js/interactionTokens/JSONWebToken';
import { CredentialOfferRequest } from 'jolocom-lib/js/interactionTokens/credentialOfferRequest';

/**
 * Protocols
 * Defined as a generator to be used as follows:
 *
 * const protoIter = protocolGenerator(API)
 * let protoRequirement = protoIter.next()
 * let nextInput = handleRequirement(protoRequirement)
 *
 * protoRequirement = protoIter.next(nextInput)
 *
 *
 * ----
 * Protocol Generators need access to some form of API to:
 * - send messages: send(message)
 * - verify
 *
 *
 *
 *
 * NOTES:
 *
 * https://github.com/hyperledger/aries-rfcs/tree/master/features/0037-present-proof
 * `yield` is for crossing boundaries and getting values out of choice diamonds
 *
 * Protocol state can be reconstructed by applying on all stored events in an
 * interaction.
 *
 * `send` needs wrapping to not actually re-send if we are just reconstructing
 * protocol state
 *
 *
 * REMEMBER: simplify interfaces across lib -- SW divide
 *
 *
 * Requirements:
 * - wait for response / recieved protocol messages
 * - user input data
 *  - yes/no decision
 * - 
 */

const presentProofVerifierProtocol = function*({ send }) {
  // send presentation request
  send(yield { type: '' })
  let response = null
  while (response === null) {
    // get response
    response = yield
    if (response === 'presentation') {
      if (verify(response)) {
        // send ack
        send(yield)
        return
      } else {
        throw new Error('invalid response')
      }
    } else if (response == 'presentation proposal') {
      // if continue
      send(response.proposal)
      response = null // go again
    }
  }
}

const presentProofProoverProtocol = function*(send) {
  // get request
  const request = yield
  // user consent
  if (yield) {
    // send presentation
    send(yield)
    // recieve ack
    yield
  } else {
    // send rejection
    send(yield)
  }
}

async function validateJWT<T extends JWTEncodable, A extends JWTEncodable>(
  receivedJWT: JSONWebToken<T>,
  sendJWT?: JSONWebToken<A>,
): Promise<void> {
}

class UserInterrupt extends Error { }

export const credentialOfferRequest = {
  actor1: function*({ send }) {
    // send CredentialOfferRequest
    send(yield)

  },

  actor2: async function*() {
    // recieve CredentialOfferRequest
    const credOfferRequest: JSONWebToken<CredentialOfferRequest> = yield
    await validateJWT(credOfferRequest)
    const { interactionToken } = credOfferRequest

    // continue?
    // how is a decision made?
    // should generator summarize info and present it to the consumer?
    // should consumer not "understand" toekns/messages and protocol flow?
    const proceed: boolean = yield { type: 'boolean', tag: 'SHOULD_PROCEED' }
    if (!proceed) throw new UserInterrupt()

    const { callbackURL } = interactionToken
  }
}


export async function consumeCredentialOffer(credOfferReq) {
  const iter = credentialOfferRequest.actor2()
  const result = iter.next()
  while (!result.done) {
    // get next requirement
    const req = result.value
    if (req.
  }
}

consumeCredentialOffer(a2)
