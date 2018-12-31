const accountTypes = require('../models/accountType')
const path = require('path')

module.exports = function (app, passport, db) {
  // Serve auth pages
  app.get('/auth', httpsMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/auth.html'))
  })

  // Serve main app
  app.get('/app', httpsMiddleware, isLoggedInMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/app.html'), {
      headers: {
        'Cache-Control': 'no-store'
      }
    })
  })

  // Check if the client is online (useful for PWAs)
  app.get('/api/online', isLoggedInMiddleware, (req, res) => {
    res.status(200).send()
  })

  // Serve user authentication APIs
  require('./user')(app, passport, db, isLoggedInMiddleware, isVerifiedMiddleware)
}

function isLoggedInMiddleware (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/auth')
}

function isVerifiedMiddleware (req, res, next) {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).send('Attempted an API call without authentication.')
    return
  }

  if (!req.user.verified) {
    res.redirect('/auth#/verification')
    return
  }

  return next()
}

function httpsMiddleware (req, res, next) {
  const host = req.get('host')
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1')

  if (req.protocol !== 'https' && !isLocal) {
    res.redirect(`https://${host}${req.originalUrl}`)
    return
  }

  return next()
}
