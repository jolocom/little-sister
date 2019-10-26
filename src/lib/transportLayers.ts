import {
  JSONWebToken,
  JWTEncodable,
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'

type ResponseRoute = string

export type SendResponse = (
  route: ResponseRoute,
  token: JSONWebToken<JWTEncodable>,
) => Promise<boolean>
