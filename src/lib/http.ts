import {HttpAgent} from 'jolocom-lib-stax-connector/js/types'

enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  HEAD = 'HEAD',
}

export const httpAgent: HttpAgent = {
  getRequest: <T>(endpoint: string): Promise<T> =>
    fetch(endpoint, {
      method: HttpMethods.GET,
    }).then(res => res.json()),
  headRequest(endpoint: string) {
    return fetch(endpoint, {
      method: HttpMethods.HEAD,
    })
  },
  postRequest<T>(endpoint: string, headers: any = {}, data: any): Promise<T> {
    return fetch(endpoint, {
      method: HttpMethods.POST,
      headers,
      body: typeof data === 'string' ? data : JSON.stringify(data),
    }).then(res => res.json())
  },
}
