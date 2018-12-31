module.exports = function (knex) {
  const db = {
    knex,
    DemoUser: null
  }

  // Run all migrations that have not been run
  const dbReady = knex.migrate.latest().then(() => {
    // If your database requires initial setup (e.g. a default user or seed data)
    //  this is a good place to check if it's been done and do it if needed
  })

  return { db, dbReady }
}
