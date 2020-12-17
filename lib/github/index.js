const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const passport = require('passport')
const GitHubStrategy = require('passport-github').Strategy

const authlib = require(path.join(path.dirname(require.main.filename), '../lib/authlib'))
const auth = require(path.join(path.dirname(require.main.filename), '../lib/game/api/auth'))

const app = new express.Router()

module.exports = function (config) {
  const clientId = process.env.GITHUB_CLIENT_ID || (config.auth.screepsrc.github && config.auth.screepsrc.github.clientId) || null
  const clientSecret = process.env.GITHUB_CLIENT_SECRET || (config.auth.screepsrc.github && config.auth.screepsrc.github.clientSecret) || null
  const enabled = !!(clientId && clientSecret)

  config.auth.info.github = enabled
  let registered = false

  app.use(cookieParser())

  app.get('/', (req, res, next) => {
    let { token } = req.query
    if (token) res.cookie('auth_token', token)
    if (!registered) {
      registered = true
      let proto = req.get('X-Forwarded-Proto') || req.protocol || 'http'
      let baseUrl = `${proto}://${req.get('host')}`
      passport.use('github', new GitHubStrategy({
        callbackURL: baseUrl + '/api/auth/github/return',
        clientID: clientId,
        clientSecret
      }, (accessToken, refreshTokem, profile, done) => done(null, profile)))
    }
    setTimeout(next, 100)
  }, passport.authenticate('github'))

  app.get('/return', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    let user = null
    let token = req.cookies.auth_token
    res.clearCookie('auth_token')
    if (token) user = authlib.checkToken(token)
    githubFindOrCreateUser(user, req.user)
      .then(user => authlib.genToken(user._id))
      .then(token => {
        let json = JSON.stringify({ user: req.user, token })
        res.end(`<html><body><script type="text/javascript">opener.postMessage(JSON.stringify(${json}), '*');window.close();</script></body>`)
      })
      .catch(err => res.end('Failed to auth'))
  })
    // })
  config.auth.router.use('/api/auth/github', app)
  config.auth.router.post('/api/user/unlink-github', auth.tokenAuth, (req, res) => {
    if (!req.user) return
    config.common.storage.db.users.update({ _id: req.user._id }, { $unset: { github: true }})
    res.json({ ok: 1 })
  })

  function githubFindOrCreateUser(user, profile) {
    let { db, env } = config.common.storage
    if (user) {
      return user.then((user)=>{
        return db.users.update({ _id: user._id }, { $set: { github: { id: profile.id }}})
          .then(()=>user)
      })
    }
    return db.users.findOne({ 'github.id': profile.id })
      .then((user) => {
        if (user) return user
        user = {
          github: { id: profile.id },
          username: profile.username,
          usernameLower: profile.username.toLocaleLowerCase(),
          cpu: 100,
          cpuAvailable: 0,
          registeredDate: new Date(),
          money: 0,
          gcl: 0
        };

        if (Array.isArray(profile.emails)) {
          user.email = profile.emails[0].value;
        }

        return db.users.insert(user)
          .then(result => {
            user = result;
            return db['users.code'].insert({
              user: user._id,
              modules: {main: ''},
              branch: 'default',
              activeWorld: true,
              activeSim: true
            })
          })
          .then(() => env.set('scrUserMemory:'+user._id, JSON.stringify({})))
          .then(() => user)
      })
  }
}
