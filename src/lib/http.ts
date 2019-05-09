type HttpAgent = {
  getRequest<T>(endpoint: string): Promise<T>
  postRequest<T>(endpoint: string, headers: any, data: any): Promise<T>
  headRequest(endpoint: string): Promise<{ status: number }>
}

enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  HEAD = 'HEAD',
}

export const httpAgent: HttpAgent = {
  getRequest: <T>(endpoint: string): Promise<T> => {
    return fetch(endpoint, {
      method: HttpMethods.GET,
    }).then(res => res.json())
  },
  headRequest(endpoint: string) {
    return fetch(endpoint, {
      method: HttpMethods.HEAD,
    }).then(res => res.json())
  },
  postRequest<T>(endpoint: string, headers: any = {}, data: any): Promise<T> {
    return fetch(endpoint, {
      method: HttpMethods.POST,
      headers,
      body: typeof data === 'string' ? data : JSON.stringify(data),
    }).then(res => res.json())
  },
}
