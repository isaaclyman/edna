<template>
  <div class="wrap">
    <div class="signup-section username">
      <div class="signup-field">
        <label 
          class="signup-label" 
          for="signup-email">Email address:</label>
        <input 
          class="signup-input" 
          :class="{ 'invalid': warnEmail }" 
          id="signup-email" 
          type="text"
          tabindex="1" 
          v-model.trim="email" 
          placeholder="greg@example.com">
      </div>
      <button 
        class="field-info" 
        :class="{ 'invalid': warnEmail }" 
        v-html="infoSvg" 
        ref="emailInfo"
        :title="emailInfo"/>
    </div>
    <div class="signup-section password">
      <div class="signup-field">
        <label 
          class="signup-label" 
          for="signup-password">Password:</label>
        <input 
          class="signup-input" 
          :class="{ 'invalid': warnPassword }" 
          id="signup-password" 
          type="password"
          tabindex="2" 
          v-model="password">
      </div>
      <button 
        class="field-info" 
        :class="{ 'invalid': warnPassword }" 
        v-html="infoSvg" 
        ref="passwordInfo"
        :title="passwordInfo"/>
    </div>
    <div class="captcha">
      <Captcha 
        :tabindex="4" 
        @change="setCaptchaResponse" 
        @expire="resetCaptchaResponse" 
        ref="captcha"/>
    </div>
    <div class="message">
      <p class="message-text">{{ message }}</p>
    </div>
    <div class="actions">
      <button 
        tabindex="7" 
        class="button-green" 
        v-if="!loading" 
        @click="submit()" 
        :disabled="!canSignUp">
        Create account
      </button>
    </div>
  </div>
</template>

<script>
import authApi from './authApi'
import Captcha from './captcha.vue'

const emailRegex = /^.+@.+\..+$/
const infoIcon = '<svg version="1.1" width="14" height="14" viewBox="0 0 14 16" class="octicon octicon-info" aria-hidden="true"><path fill-rule="evenodd" d="M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"></path></svg>'

export default {
  components: {
    Captcha
  },
  computed: {
    canSignUp() {
      return (
        this.validEmail &&
        this.validPassword
      )
    },
    isTest() {
      return this.email.endsWith('@example.com')
    },
    warnEmail() {
      return this.email && !this.validEmail
    },
    warnPassword() {
      return this.password && !this.validPassword
    },
    validEmail() {
      return (
        !!this.email &&
        emailRegex.test(this.email) &&
        !this.email.includes(' ')
      )
    },
    validPassword() {
      return (
        !!this.password &&
        this.password.length >= 12
      )
    },
  },
  data() {
    return {
      captchaResponse: '',
      email: '',
      emailInfo: 'Please enter a valid email address so you can verify your account. We won\'t email you unless it\'s important.',
      infoSvg: infoIcon,
      loading: false,
      message: '',
      password: '',
      passwordInfo: 'Please choose a long password (12 characters or more).',
    }
  },
  methods: {
    resetCaptchaResponse() {
      this.captchaResponse = ''
    },
    setCaptchaResponse(response) {
      this.captchaResponse = response
    },
    submit() {
      this.message = ''

      if (!this.captchaResponse && !this.isTest) {
        this.message = 'Please indicate that you are not a robot.'
        return
      }

      this.loading = true

      authApi.signUp({
        captchaResponse: this.captchaResponse,
        email: this.email,
        password: this.password,
        integration: this.isTest,
      }).then(() => {
        this.loading = false
      }, () => {
        this.loading = false
        this.$refs.captcha.reset()
        this.message = 'Signup failed. Please check your email/password and try again.'
      })
    },
  }
}
</script>

<style scoped>

</style>
