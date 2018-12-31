const accountTypes = require('../models/accountType')

exports.up = function (knex, Promise) {
  return (
    userTable(knex).then(() => {
      // This is a good place to build other tables that you know you'll need right away.
    })
  )
}

exports.down = function (knex, Promise) {
  return (
    knex.schema.dropTableIfExists('users')
    // Drop your other tables here too.
  )
}

// You can use this function to add a foreign-keyed userId column to other tables.
// Pass in the `table` parameter from the `createTable` callback.
function userIdCol (table) {
  table.integer('user_id').notNullable()
  table.foreign('user_id').references('users.id').onDelete('CASCADE')
}

function userTable (knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary()
    table.string('email').unique().notNullable()
    table.string('password').notNullable()
    table.enu('account_type', Object.keys(accountTypes)).notNullable()
    table.string('pass_reset_key')
    table.uuid('verify_key')
    table.boolean('verified').notNullable().defaultTo(false)
    table.timestamps()
  })
}
