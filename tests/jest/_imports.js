import accountTypes from '../../models/accountType'
import { app as server, knex, serverReady } from '../../server'
import request from 'supertest'
import {
  alternateUser,
  createTestUser,
  createAlternateTestUser,
  deleteTestUser,
  getTestUserId,
  makeTestUserPremium,
  route,
  setTestUserResetKey,
  setTestUserVerifyKey,
  stubRecaptcha,
  user
} from '../test_util'
import uuid from 'uuid/v1'

const app = request(server)
const getPersistentAgent = () => request.agent(server)
const boundCreateTestUser = async (overrideApp) => {
  await createTestUser(knex)
  return (
    (overrideApp || app).post(route('user/login'))
    .send(user)
    .expect(200)
    .then(() => {
      return user
    })
  )
}
const boundCreateAlternateTestUser = () => createAlternateTestUser(knex)
const boundDeleteTestUser = (email, deleteContentOnly = false) => deleteTestUser(knex, email, deleteContentOnly)
const boundGetTestUserId = () => getTestUserId(knex)
const boundMakeTestUserPremium = () => makeTestUserPremium(knex)
const boundSetTestUserResetKey = () => setTestUserResetKey(knex)
const boundSetTestUserVerifyKey = () => setTestUserVerifyKey(knex)

afterAll(async () => {
  await serverReady
  await server.server.close()
  await knex.destroy()
})

export {
  accountTypes,
  alternateUser,
  app,
  boundCreateTestUser as createTestUser,
  boundCreateAlternateTestUser as createAlternateTestUser,
  boundDeleteTestUser as deleteTestUser,
  boundMakeTestUserPremium as makeTestUserPremium,
  boundSetTestUserResetKey as setTestUserResetKey,
  boundSetTestUserVerifyKey as setTestUserVerifyKey,
  boundGetTestUserId as getTestUserId,
  getPersistentAgent,
  route,
  server,
  knex,
  serverReady,
  stubRecaptcha,
  user,
  uuid
}
