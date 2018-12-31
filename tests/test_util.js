const accountTypes = require('../models/accountType')
const guid = require('uuid/v1')
const modelUtil = require('../models/_util')

const orderPromises = function (promiseFns) {
  if (!Array.isArray(promiseFns) || (promiseFns.length && typeof promiseFns[0] !== 'function')) {
    throw new TypeError(`orderPromises expects an array of functions. Received: ${JSON.stringify(promiseFns)}`)
  }

  if (!promiseFns.length) {
    return Promise.resolve()
  }

  const promise = promiseFns[0]()

  if (!promise.then) {
    throw new TypeError(`A function in the array passed to orderPromises did not return a promise. Returned: ${JSON.stringify(promise)}`)
  }

  return promise.then(() => orderPromises(promiseFns.slice(1)))
}


/*
  ROUTES
*/

const route = route => `/api/${route}`

/*
  TEST USER
*/

const user = {
  email: 'trash@edwardtheapp.com',
  password: 'thisismysecurepassword',
  captchaResponse: 'token',
  resetKey: '5cf197a4-1029-4250-91cc-6f0ef75bca77',
  verifyKey: '5cf197a4-1029-4250-91cc-6f0ef75bca77'
}

const alternateUser = {}
Object.assign(alternateUser, user, { email: 'trash2@edwardtheapp.com' })

function getTestUserId (knex) {
  return knex('users').where('email', user.email).first('id').then(({ id }) => id)
}

function createTestUser (knex) {
  return modelUtil.getHash(user.password).then(hash => {
    return (
      knex('users').insert(modelUtil.addTimestamps(knex, {
        email: user.email,
        password: hash,
        'account_type': accountTypes.LIMITED.name,
        verified: true,
        payment_period_end: knex.raw(`(SELECT 'now'::timestamp + '1 days'::interval)`)
      })).returning(['id', 'email', 'account_type']).then(([user]) => user)
    )
  })
}

function createAlternateTestUser (knex) {
  return modelUtil.getHash(alternateUser.password).then(hash => {
    return (
      knex('users').insert(modelUtil.addTimestamps(knex, {
        email: alternateUser.email,
        password: hash,
        'account_type': accountTypes.LIMITED.name,
        verified: true,
        payment_period_end: knex.raw(`(SELECT 'now'::timestamp + '1 days'::interval)`)
      })).returning(['id', 'email', 'account_type']).then(([user]) => user)
    )
  })
}

function deleteTestUser(knex, email) {
  email = email || user.email
  return knex('users').where('email', email).del()
}

function makeTestUserPremium(knex) {
  return (
    knex('users').where('email', user.email).update({
      'account_type': accountTypes.PREMIUM.name
    })
  )
}

function setTestUserVerifyKey(knex) {
  return (
    knex('users').where('email', user.email).update({
      'verify_key': user.verifyKey
    })
  )
}

function setTestUserResetKey(knex) {
  return (
    modelUtil.getHash(user.resetKey).then(hash => {
      return knex('users').where('email', user.email).update({
        'pass_reset_key': hash
      })
    })
  )
}

/*
  EXTERNAL REQUEST STUBBING
*/

const request = require('request-promise-native')

function stubRecaptcha() {
  beforeAll(() => {
    const oldPost = request.post
    jest.spyOn(request, 'post').mockImplementation(body => {
      if (body.uri === 'https://www.google.com/recaptcha/api/siteverify') {
        return Promise.resolve({ success: true })
      }
      return oldPost.apply([...arguments])
    })
  })
}

export {
  user,
  alternateUser,
  createTestUser,
  createAlternateTestUser,
  deleteTestUser,
  getTestUserId,
  makeTestUserPremium,
  route,
  setTestUserResetKey,
  setTestUserVerifyKey,
  stubRecaptcha
}
