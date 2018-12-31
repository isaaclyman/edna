import axiosBase from 'axios'

const axios = axiosBase.create({
  headers: {
    Pragma: 'no-cache',
    'Cache-Control': 'no-store',
  },
})

const route = route => `/api/${route}`

class Api {
  constructor () {
    this.isOnlineCached = null
  }

  isOnline() {
    const promise = this.simpleGet(route('online'))
    promise.then(() => {
      this.isOnlineCached = true
    }, () => {
      this.isOnlineCached = false
    })
    return promise
  }

  simpleGet(route) {
    return axios.get(route).then(response => response.data)
  }

  simplePost(route, body) {
    return axios.post(route, body).then(response => response.data)
  }
}

export default new Api()
