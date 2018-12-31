<template>
  <div class="wrap">
    <div class="forgot">
      <div class="message">
        <h3>Forgot your password?</h3>
        <p>
          No problem. Enter the email address associated with your account and click the button.
          You'll get an email with a link to log in and change your password.
        </p>
      </div>
      <div class="input">
        <input 
          tabindex="1" 
          class="email-input" 
          v-model="email" 
          placeholder="edna@example.com">
      </div>
      <div class="captcha">
        <Captcha 
          :tabindex="2" 
          @change="setCaptchaResponse" 
          @expire="resetCaptchaResponse" 
          ref="captcha"/>
      </div>
      <div 
        class="actions" 
        v-if="!emailSent">
        <button 
          tabindex="3" 
          v-if="!saving" 
          class="button-green reset-button" 
          @click="reset()">Reset my password</button>
        <p 
          class="error" 
          v-if="error">
          That didn't work. Please check your email address and try again.
        </p>
      </div>
      <div 
        class="success" 
        v-if="emailSent">
        Email sent! Go check your inbox.
      </div>
      <div class="cancel">
        <router-link to="/login">
          <button 
            tabindex="4" 
            class="button-link">Back to login</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import authApi from './authApi'
import Captcha from './captcha.vue'

export default {
  components: {
    Captcha
  },
  computed: {
    isTest() {
      return this.email.endsWith('@example.com')
    },
  },
  data() {
    return {
      captchaResponse: '',
      email: '',
      error: false,
      saving: false,
      emailSent: false,
    }
  },
  methods: {
    reset() {
      this.error = false
      this.saving = true
      authApi.sendResetPasswordLink({
        email: this.email,
        captchaResponse: this.captchaResponse,
        integration: this.isTest,
      }).then(() => {
        this.saving = false
        this.emailSent = true
      }, (err) => {
        this.saving = false
        this.error = true
        this.emailSent = false
        console.error(err)
      })
    },
    resetCaptchaResponse() {
      this.captchaResponse = ''
    },
    setCaptchaResponse(response) {
      this.captchaResponse = response
    },
  },
}
</script>

<style scoped>

</style>
