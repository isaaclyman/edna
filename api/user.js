const accountTypes = require('../models/accountType')
const Email = require('./email.helper')
const modelUtil = require('../models/_util')
const request = require('request-promise-native')
const ts = modelUtil.addTimestamps
const uuid = require('uuid/v4')

// This file deals with sensitive user data. Therefore, error messages (which could contain that data)
//  are not included in any response to the front end.

module.exports = function (app, passport, db, isLoggedInMiddleware, isVerifiedMiddleware) {
  const route = route => `/api/user/${route}`

  const verifyCaptchaToken = (req) => {
    const token = req.body && req.body.captchaResponse
    return new Promise((resolve, reject) => {
      if (!token) {
        return reject()
      }

      const postOptions = {
        method: 'POST',
        uri: 'https://www.google.com/recaptcha/api/siteverify',
        formData: {
          secret: process.env.RECAPTCHA_SECRET,
          response: token,
          remoteip: req.ip
        },
        json: true
      }

      request.post(postOptions).then((response) => {
        if (response.success) {
          resolve()
        } else {
          reject()
        }
      })
    })
  }

  // If you want to do e2e tests on your login, you'll need to have your test bot use an email ending with @example.com.
  // This bypasses the captcha check. See forgot.page.vue to see how the `integration` property is set on the front end.
  // If your e2e test could actually solve a captcha, hoo boy, we'd have trouble. Or you'd be rich.
  const captchaMiddleware = (req, res, next) => {
    if (req.body && req.body.email && req.body.email.endsWith('@example.com') && req.body.integration === true) {
      return next()
    }

    verifyCaptchaToken(req).then(() => {
      return next()
    }, () => {
      res.status(401).send('Captcha failed.')
    })
  }

  const getUserResponse = user => {
    return new Promise((resolve, reject) => {
      db.knex('users').where('id', user.id).first(
        'account_type', 'email', 'verified'
      ).then(user => {
        const accountType = user['account_type']
        resolve({
          accountType: accountTypes[accountType],
          email: user.email,
          verified: user.verified
        })
      }, err => {
        console.error(err)
        reject()
      })
    })
  }

  // Get the current user's details
  app.get(route('current'), isLoggedInMiddleware, (req, res, next) => {
    if (!req.user) {
      res.status(401).send('User not found.')
      return false
    }

    getUserResponse(req.user).then(response => {
      res.status(200).send(response)
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  // Sign up a new user with Passport
  app.post(route('signup'), captchaMiddleware, (req, res, next) => {
    passport.authenticate('local-signup', (err, user) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        return res.status(401).send('Signup failed.')
      }

      req.login(user, err => {
        if (err) {
          return next(err)
        }

        return res.status(200).send()
      })
    })(req, res, next)
  })

  // Log in an existing user with Passport
  app.post(route('login'), captchaMiddleware, (req, res, next) => {
    passport.authenticate('local-login', (err, user) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        return res.status(401).send('Authentication failed.')
      }

      req.login(user, err => {
        if (err) {
          return next(err)
        }

        return res.status(200).send({
          verified: user.verified
        })
      })
    })(req, res, next)
  })

  // Send a verification link to the user's email address
  app.post(route('send-verify-link'), isLoggedInMiddleware, (req, res, next) => {
    if (!req.user) {
      res.status(401).send('User not found.')
      return false
    }

    db.knex('users').where('id', req.user.id).first().then(user => {
      const key = user['verify_key']
      return new Email(
        [user.email],
        'Verify your account',
        'Thanks for signing up for an account. Use the link below to verify your email address:' +
        `\n\n${process.env.BASE_URL}/auth#/verify/${encodeURIComponent(user.email)}/${key}`
      ).send()
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  // Verify a user's email address after they visit a verification link
  app.post(route('verify'), (req, res, next) => {
    const { email, key } = req.body

    if (!email || !key) {
      res.status(401).send('Email and verification key must be provided.')
      return
    }

    db.knex('users').where({
      email,
      verified: false,
      'verify_key': key
    }).first().then(user => {
      if (!user || !user['verify_key']) {
        res.status(401).send('Email address or verification key is incorrect.')
        return false
      }

      return db.knex('users').where('id', user.id).update(ts(db.knex, {
        verified: true,
        'verify_key': null
      }, true)).then(() => {
        req.login(user, err => {
          if (err) {
            console.error(err)
            res.status(500).send('An error occurred while logging in.')
            return false
          }

          return res.status(200).send()
        })

        return new Email(
          [email],
          'Your account is verified',
          'Thanks for verifying your email address! Now you can log in and start using the app.'
        ).send()
      })
    }).then(undefined, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  // Log out the current user
  app.get(route('logout'), (req, res, next) => {
    req.logout()
    res.status(200).send()
  })

  // Change the user's email address in the database
  app.post(route('email'), isLoggedInMiddleware, (req, res, next) => {
    const newEmail = req.body.email

    return db.knex('users').where('email', newEmail).first().then(existingUser => {
      if (existingUser) {
        res.status(500).send('This email address is unavailable.')
        return false
      }

      return (
        db.knex('users').where('id', req.user.id).update(ts(db.knex, {
          email: newEmail,
          verified: false,
          'verify_key': uuid()
        }, true))
      )
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  // Change the user's password in the database
  app.post(route('password'), isLoggedInMiddleware, (req, res, next) => {
    return modelUtil.getHash(req.body.password).then(hash => {
      return db.knex('users').where('id', req.user.id).update(ts(db.knex, {
        password: hash
      }, true))
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  // Send a password reset email to a given user
  app.post(route('send-reset-password-link'), captchaMiddleware, (req, res, next) => {
    const email = req.body.email

    let guid
    db.knex('users').where('email', email).first().then(user => {
      if (!user) {
        const errorMessage = `A user with the email address ${email} was not found.`
        res.status(500).send(errorMessage)
        throw new Error(errorMessage)
      }

      if (user.account_type === accountTypes.DEMO.name) {
        const errorMessage = 'Cannot perform this action with a Demo account.'
        res.status(500).send(errorMessage)
        throw new Error(errorMessage)
      }

      guid = uuid()
      return modelUtil.getHash(guid)
    }).then(hash => {
      return db.knex('users').where('email', email).update(ts(db.knex, {
        'pass_reset_key': hash
      }, true))
    }).then(() => {
      return new Email(
        [email],
        'Reset your password',
        `A password reset has been requested for your account with email ${email}.` +
        '\nIf you did not request a password reset, you may delete this email and take no further action.' +
        '\nIf you would like to reset your password, please visit the link below:' +
        `\n\n${process.env.BASE_URL}/auth#/reset/${encodeURIComponent(email)}/${guid}`
      ).send()
    })
    .then(() => {
      res.status(200).send()
    }, err => {
      if (res.headersSent) {
        return
      }
      console.error(err)
      res.status(500).send()
    })
  })

  // Change a user's forgotten password when they use a password reset link
  app.post(route('authenticate-password-reset'), (req, res, next) => {
    const { email, key } = req.body

    if (!email || !key) {
      res.status(401).send('Email and reset key must be provided.')
      return
    }

    db.knex('users').where({
      email: email
    }).first().then(user => {
      if (!user || !user['pass_reset_key']) {
        res.status(401).send('Email or password reset key is incorrect.')
        return false
      }

      const realHash = user['pass_reset_key']

      return modelUtil.isCorrectPassword(key, realHash).then(() => user, () => {
        res.status(401).send('Email or password reset key is incorrect.')
        return false
      })
    }).then(user => {
      if (!user) {
        return
      }

      // Correct password
      req.login(user, err => {
        if (err) {
          console.error(err)
          res.status(500).send('Could not log in.')
          return false
        }

        db.knex('users').where('email', email).update(ts(db.knex, {
          'pass_reset_key': null
        }, true)).then(() => {
          res.status(200).send()
        }, err => {
          console.error(err)
          res.status(500).send()
        })
      })
    }).then(undefined, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  // Delete the current user's account after verifying their password
  app.post(route('delete-account'), isLoggedInMiddleware, (req, res, next) => {
    const { password } = req.body

    db.knex('users').where('id', req.user.id).first(
      'password',
    ).then(({
      password: hash
    }) => {
      return modelUtil.isCorrectPassword(password, hash).then(() => {
        // Password is correct
        const userId = req.user.id
        req.logout()
        return db.knex('users').where('id', userId).del()
      }, () => {
        res.status(401).send('Incorrect password.')
        throw new Error('Incorrect password.')
      })
    }).then(() => {
      res.status(200).send()
    }, err => {
      if (res.headersSent) {
        return
      }

      console.error(err)
      res.status(500).send()
    })
  })
}
