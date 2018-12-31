import {
  accountTypes,
  app,
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  knex,
  makeTestUserPremium,
  route,
  serverReady,
  setTestUserResetKey,
  setTestUserVerifyKey,
  stubRecaptcha,
  user
} from '../_imports'
import { paymentSucceeded } from '../../../api/payments.events'

stubRecaptcha(test)

test('sign up and log in', async () => {
  await deleteTestUser()
  await serverReady

  await (
    app.post(route('user/signup'))
    .send(user)
    .expect(200)
    .expect('set-cookie', /connect\.sid/)
  )

  return (
    app.post(route('user/login'))
    .send(user)
    .expect(200)
    .expect('set-cookie', /connect\.sid/)
  )
})

test('get current user', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  const user = await createTestUser(app)

  return (
    app.get(route('user/current'))
    .expect(200)
    .expect(res => {
      const userRes = res.body
      expect(userRes.email).toBe(user.email)
      expect(userRes.isPremium).toBe(false)
      expect(userRes.accountType.name).toBe('LIMITED')
    })
  );
})

test(`can't log in with wrong password`, async () => {
  await deleteTestUser()
  await serverReady
  const user = await createTestUser()

  return (
    app.post(route('user/login'))
    .send({ email: user.email, password: 'notthecorrectpassword!', captchaResponse: 'token' })
    .expect(401)
  )
})

test('log out', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)

  await (
    app.get(route('user/current'))
    .expect(200)
  )

  await (
    app.get(route('user/logout'))
    .expect(200)
  )

  return (
    app.get(route('user/current'))
    .expect(302)
  )
})

test('change user email', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  const user = await createTestUser(app)
  const newEmail = `${user.email}-1`

  await deleteTestUser(newEmail)

  await (
    app.post(route('user/email'))
    .send({ email: newEmail })
    .expect(200)
  )

  await (
    app.get(route('user/current'))
    .expect(200)
    .expect(res => {
      const userRes = res.body
      expect(userRes.email).toBe(newEmail)
    })
  )

  await (
    app.get(route('user/logout'))
    .expect(200)
  )

  return (
    app.post(route('user/login'))
    .send({ email: newEmail, password: user.password, captchaResponse: 'token' })
    .expect(200)
  )
})

test('change user password', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  const user = await createTestUser(app)

  const newPassword = `${user.password}-1`
  await (
    app.post(route('user/password'))
    .send({ password: newPassword })
    .expect(200)
  )

  await (
    app.get(route('user/current'))
    .expect(200)
  )

  await (
    app.get(route('user/logout'))
    .expect(200)
  )

  return (
    app.post(route('user/login'))
    .send({ email: user.email, password: newPassword, captchaResponse: 'token' })
    .expect(200)
  )
})

test('change user email and password', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  const user = await createTestUser(app)

  const newPassword = `${user.password}-1`
  await (
    app.post(route('user/password'))
    .send({ password: newPassword })
    .expect(200)
  )

  const newEmail = `${user.email}-1`
  await deleteTestUser(newEmail)

  await (
    app.post(route('user/email'))
    .send({ email: newEmail })
    .expect(200)
  )

  await (
    app.get(route('user/current'))
    .expect(200)
    .expect(res => {
      const userRes = res.body
      expect(userRes.email).toBe(newEmail)
    })
  )

  await (
    app.get(route('user/logout'))
    .expect(200)
  )

  return (
    app.post(route('user/login'))
    .send({ email: newEmail, password: newPassword, captchaResponse: 'token' })
    .expect(200)
  )
})

test('verify account', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady

  await (
    app.post(route('user/signup'))
    .send(user)
    .expect(200)
    .expect('set-cookie', /connect\.sid/)
  )

  await (
    app.post(route('user/send-verify-link'))
    .expect(200)
  )

  await (
    app.get(route('user/logout'))
    .expect(200)
  )

  await setTestUserVerifyKey()

  await (
    app.post(route('user/verify'))
    .send({
      email: user.email,
      key: user.verifyKey
    })
    .expect(200)
  )

  return (
    app.get(route('user/current'))
    .expect(200)
    .expect(res => {
      const userRes = res.body
      expect(userRes.email).toBe(user.email)
      expect(userRes.isPremium).toBe(false)
      expect(userRes.accountType.name).toBe('LIMITED')
    })
  );
})

test('cannot verify account with null or incorrect key', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady

  await (
    app.post(route('user/signup'))
    .send(user)
    .expect(200)
    .expect('set-cookie', /connect\.sid/)
  )

  await (
    app.post(route('user/send-verify-link'))
    .expect(200)
  )

  await (
    app.get(route('user/logout'))
    .expect(200)
  )

  await setTestUserVerifyKey()

  await (
    app.post(route('user/verify'))
    .send({
      email: user.email,
      key: null
    })
    .expect(401)
  )

  await (
    app.post(route('user/verify'))
    .send({
      email: user.email,
      key: '00000000-1029-4250-91cc-6f0ef75bca77'
    })
    .expect(401)
  )

  await (
    app.get(route('user/current'))
    .expect(302)
  )
})

test('reset password', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady

  await (
    app.post(route('user/signup'))
    .send(user)
    .expect(200)
    .expect('set-cookie', /connect\.sid/)
  )

  await (
    app.get(route('user/logout'))
    .expect(200)
  )

  await (
    app.post(route('user/send-reset-password-link'))
    .send({ email: user.email, captchaResponse: user.captchaResponse, integration: true })
    .expect(200)
  )

  await setTestUserResetKey()

  await (
    app.post(route('user/authenticate-password-reset'))
    .send({
      email: user.email,
      key: user.resetKey
    })
    .expect(200)
  )

  const newPassword = `${user.password}-updated`
  await (
    app.post(route('user/password'))
    .send({ password: newPassword })
    .expect(200)
  )

  await (
    app.get(route('user/logout'))
    .expect(200)
  )

  const newUser = {}
  Object.assign(newUser, user, { password: newPassword })
  return (
    app.post(route('user/login'))
    .send(newUser)
    .expect(200)
    .expect('set-cookie', /connect\.sid/)
  )
})

test('cannot reset password with null or incorrect key', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady

  await (
    app.post(route('user/signup'))
    .send(user)
    .expect(200)
    .expect('set-cookie', /connect\.sid/)
  )

  await (
    app.get(route('user/logout'))
    .expect(200)
  )

  await (
    app.post(route('user/send-reset-password-link'))
    .send({ email: user.email, captchaResponse: user.captchaResponse, integration: true })
    .expect(200)
  )

  await setTestUserResetKey()

  await (
    app.post(route('user/authenticate-password-reset'))
    .send({
      email: user.email,
      key: null
    })
    .expect(401)
  )

  const newPassword = `${user.password}-updated`
  await (
    app.post(route('user/password'))
    .send({ password: newPassword })
    .expect(302)
  )

  await (
    app.post(route('user/authenticate-password-reset'))
    .send({
      email: user.email,
      key: '00000000-1029-4250-91cc-6f0ef75bca77'
    })
    .expect(401)
  )

  await (
    app.post(route('user/password'))
    .send({ password: newPassword })
    .expect(302)
  )

  const newUser = {}
  Object.assign(newUser, user, { password: newPassword })
  await (
    app.post(route('user/login'))
    .send(newUser)
    .expect(401)
  )
})

test(`can delete account with correct password`, async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)

  await (
    app.post(route('user/delete-account'))
    .send({ password: user.password })
    .expect(200)
  )

  await (
    app.get(route('user/current'))
    .expect(302)
  )
  
  await (
    app.post(route('user/login'))
    .send(user)
    .expect(401)
  )
})

test(`cannot delete account with incorrect password`, async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)

  await (
    app.post(route('user/delete-account'))
    .send({ password: 'NOT THE CORRECT PASSWORD' })
    .expect(401)
  )

  await (
    app.get(route('user/current'))
    .expect(200)
  )
  
  await (
    app.post(route('user/login'))
    .send(user)
    .expect(200)
  )
})
