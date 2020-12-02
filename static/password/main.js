(function () {
  const app = angular.module('screepsmod-auth', []) // jshint-ignore-line no-undef
  class Password {
    constructor ($window, API) {
      this.token = ''
      $window.addEventListener('message', (e) => {
        let data = JSON.parse(e.data)
        API.setToken(data.token)
        this.status = '正在设置密码...'
        API.password(this.oldpass, this.newpass)
          .then((res) => {
            if (res.ok) {
              this.status = '密码设置成功!'
            } else {
              this.status = `密码设置失败! ${res.error}`
            }
          })
      })
    }
    steam ($event) {
      if (this.newpass) {
        if (this.newpass !== this.newpass2) {
          this.status = '两次密码不匹配!'
        } else if (this.newpass.length < 4) {
          this.status = '密码太短!'
        } else {
          this.status = '正在连接到 Steam...'
          return
        }
      }
      $event.preventDefault()
    }
    github ($event) {
      if (this.newpass) {
        if (this.newpass !== this.newpass2) {
          this.status = '两次密码不匹配!'
        } else if (this.newpass.length < 4) {
          this.status = '密码太短!'
        } else {
          this.status = '正在连接到 GitHub...'
          return
        }
      }
      $event.preventDefault()
    }
  }
  class API {
    constructor ($http) {
      this.$http = $http
    }
    req (method, url, data = {}) {
      let params = {}
      if (method === 'GET') {
        params = data
        data = null
      }
      let headers = {
        'X-Token': this.token,
        'X-Username': this.token
      }
      return this.$http({ method, url, params, data, headers })
        .then(res => res.data)
        .catch(res => res.data)
    }
    setToken (token) {
      this.token = token
    }
    password (oldPassword, password) {
      return this.req('POST', '/api/user/password', { oldPassword, password })
    }
  }
  app.controller('password', Password)
  app.service('API', API)
})()
