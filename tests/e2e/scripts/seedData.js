require('./setUp')
const util = require('../../../compiled/test_util')
const knex = require('../../../db')
const orderPromises = require('../../../compiled/utilities').orderPromises

const seedPromiseFns = []
const seedArgs = {
  '--delete': () => util.deleteTestUser(knex),
  '--user': () => util.createTestUser(knex),
  '--premium': () => util.makeTestUserPremium(knex),
  '--reset-key': () => util.setTestUserResetKey(knex),
  '--verify-key': () => util.setTestUserVerifyKey(knex)
}

process.argv.slice(2).forEach((val) => {
  if (!Object.keys(seedArgs).includes(val)) {
    throw new Error(`Invalid argument "${val}" to the seedData script.`)
  }

  seedPromiseFns.push(seedArgs[val])
})

orderPromises(seedPromiseFns).then(() => {
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})
