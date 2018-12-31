import Vue from 'vue'
import Router from 'vue-router'

import Home from './Home.vue'
import NotFound from './NotFound.vue'

import userApi from './api/userApi'
import api from './api/api'

Vue.use(Router)

// Use this route guard to protect Premium-only routes.
const assertPremium = () => userApi.getUser().then((user) => {
  if (user.account_type === 'PREMIUM') {
    return true
  }
  throw new Error('Can\'t access this route without a Premium account.')
})

// Use this route guard to protect routes that should only be available with an Internet connection.
const assertOnline = () => api.isOnline().then(
  () => true,
  () => {
    throw new Error('Can\'t access this route while offline.')
  },
)

/*
Use this to combine route guards (like assertPremium and assertOnline).
We shouldn't use next(false) in any guard because there's no global hook that's called
 when navigation is cancelled. This could leave the app in a 'loading' state forever.
 Instead, we need to use next(error) to cancel navigation.
*/
const compose = (...guards) => function (to, from, next) {
  const guardPromises = guards.map(guard => guard())
  Promise.all(guardPromises).then((...results) => {
    const blocks = results.filter(res => res !== true)
    if (blocks.length === 0) {
      return next()
    }

    const nav = results.filter(res => typeof res === 'object')[0]
    if (nav) {
      return next(nav)
    }

    return next(new Error('Navigation was not allowed.'))
  }, err => next(err))
}

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '*',
      name: 'Page does not exist',
      component: NotFound,
    },
  ],
})
