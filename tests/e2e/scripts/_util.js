let seedArgs = []
function resetSeed () {
  seedArgs = []
}

function runSeed (cy) {
  if (!seedArgs.length) {
    return
  }
  
  const seedString = seedArgs.join(' ')
  resetSeed()
  const seedCommand = `node tests/e2e/scripts/seedData.js ${seedString}`
  console.log(`seeding: ${seedCommand}`)
  return cy.exec(seedCommand)
}

export function seed(cy, callback) {
  resetSeed()
  const callbackResp = callback()
  if (callbackResp && callbackResp.then) {
    return callbackResp.then(() => runSeed(cy))
  }
  return runSeed(cy)
}

export function createTestUser () {
  seedArgs.push('--user')
}

export function deleteTestUser () {
  seedArgs.unshift('--delete')
  cy.clearLocalStorage()
}

export function logIn (cy, email, password) {
  cy.request(
    'POST',
    '/api/user/login',
    { email, password, integration: true }
  )
  cy.getCookie('connect.sid').should('exist')
}

export function makeTestUserPremium () {
  seedArgs.push('--premium')
}

export function setTestUserVerifyKey () {
  seedArgs.push('--verify-key')
}

export function setTestUserResetKey () {
  seedArgs.push('--reset-key')
}
