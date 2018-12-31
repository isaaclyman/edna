// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import router from './app/router'
import App from './app/App.vue'

import './assets/yui-cssreset.css'

import './main.css'

Vue.config.productionTip = false

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('SW registered: ', registration)
    }).catch((registrationError) => {
      console.log('SW registration failed: ', registrationError)
    })
  })
}

/* eslint-disable no-new */
export default new Vue({
  el: '#app',
  components: { App },
  router,
  render(h) {
    return h('App')
  },
})
