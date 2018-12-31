import Vue from 'vue'

import router from './auth/router'
import Auth from './auth/Auth.vue'

import './main.css'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { Auth },
  router,
  render(h) {
    return h('Auth')
  },
})
