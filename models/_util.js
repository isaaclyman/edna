const bcrypt = require('bcryptjs')

// Get the hashed version of a password using bcrypt and a salt.
//  Considered secure as of 2018.
const getHash = password => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        reject(err)
        return
      }

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err)
          return
        }

        resolve(hash)
        return
      })
    })
  })
}

// Determine if a password "attempt" matches a password hash "realHash."
//  Note: we can't just use === with getHash because there's a salt.
const isCorrectPassword = (attempt, realHash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(attempt, realHash).then(isValid => {
      if (isValid) {
        return resolve()
      } else {
        return reject()
      }
    }, reject)
  })
}

// Add knex-flavored timestamps to an update or insert operation.
const addTimestamps = (knex, config, isUpdate) => {
  if (!isUpdate) {
    config['created_at'] = knex.raw('current_timestamp')
  }
  config['updated_at'] = knex.raw('current_timestamp')

  return config
}

module.exports = {
  getHash,
  isCorrectPassword,
  addTimestamps
}
