<template>
  <div class="wrap">
    <hr class="divider">
    <div class="username">
      <label for="login-username-input">Email address:</label>
      <input 
        tabindex="1" 
        id="login-username-input" 
        class="login-field" 
        type="text" 
        v-model="email">
    </div>
    <div class="password">
      <label for="login-password-input">Password:</label>
      <input 
        tabindex="2" 
        id="login-password-input" 
        class="login-field" 
        type="password" 
        v-model="password">
      <router-link to="/forgot">
        <button 
          tabindex="3" 
          class="button-link forgot-button">Forgot your password?</button>
      </router-link>
    </div>
    <div class="captcha">
      <Captcha 
        :tabindex="4" 
        @change="setCaptchaResponse" 
        @expire="resetCaptchaResponse" 
        ref="captcha"/>
    </div>
    <div class="messages">
      <p>{{ loginMessage }}</p>
    </div>
    <div class="actions">
      <pulse-loader v-if="loading"/>
      <button 
        tabindex="5" 
        v-if="!loading" 
        class="login-button button-green" 
        :disabled="!canLogin" 
        @click="logIn()">Log In</button>
    </div>
    <hr class="divider">
    <div class="sign-up">
      <div class="sign-up-text">Don't have an account?</div>
      <button 
        tabindex="6" 
        class="sign-up-link button-link" 
        @click="signUp()">Sign up for free.</button>
    </div>
  </div>
</template>

<script>
import authApi from './authApi'
import Captcha from './captcha.vue'
import { goToApp } from './shared'

export default {
  beforeCreate() {
    authApi.logOut()
  },
  components: {
    Captcha
  },
  computed: {
    canLogin() {
      return (
        !!this.email.trim() &&
        !!this.password.trim()
      )
    },
    isTest() {
      return this.email.endsWith('@example.com')
    },
  },
  data() {
    return {
      captchaResponse: '',
      email: '',
      loading: false,
      loginMessage: '',
      password: '',
    }
  },
  methods: {
    logIn() {
      this.loginMessage = ''

      if (!this.captchaResponse && !this.isTest) {
        this.loginMessage = 'Please indicate that you are not a robot.'
        return
      }

      this.loading = true

      authApi.logIn({
        email: this.email,
        password: this.password,
        captchaResponse: this.captchaResponse,
        integration: this.isTest,
      }).then((result) => {
        this.loading = false

        if (!result.verified) {
          this.$router.push('/verification')
        } else if (!result.isPremium) {
          this.$router.push('/limited')
        } else {
          goToApp()
        }
      }, () => {
        this.loading = false
        this.$refs.captcha.reset()
        this.loginMessage = 'Login failed. Please try again.'
      })
    },
    resetCaptchaResponse() {
      this.captchaResponse = ''
    },
    setCaptchaResponse(response) {
      this.captchaResponse = response
    },
    signUp() {
      this.$router.push('/signup')
    }
  },
}
</script>

<style scoped>

</style>
