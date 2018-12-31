import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha
} from '../_imports'

stubRecaptcha(test)

test('log in as premium user', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  const user = await createTestUser(app)
  await makeTestUserPremium()

  return (
    app.get(route('user/current'))
    .expect(200)
    .expect(res => {
      const userRes = res.body
      expect(userRes.email).toBe(user.email)
      expect(userRes.isPremium).toBe(true)
      expect(userRes.accountType.name).toBe('PREMIUM')
    })
  );
})
