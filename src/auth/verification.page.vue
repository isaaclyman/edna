<template>
  <div class="wrap">
    <div 
      class="content" 
      v-if="email">
      <h1>You're almost done.</h1>
      <p>
        Before you can use our app, you'll need to verify your email address. We've sent a link to {{ email }}.
      </p>
      <p>
        Didn't get the email? Click the button to resend it.
      </p>
      <div>
        <button 
          class="button-green" 
          @click="sendLink()" 
          v-if="!sent">
          Send email
        </button>
        <p v-if="sent">
          Email sent.
        </p>
        <p 
          class="error" 
          v-if="error">
          That didn't work. Please try again later or contact us for assistance.
        </p>
      </div>
      <p>
        Once you get the email, you can click the link to verify your account.
      </p>
      <div>
        <router-link to="/login">
          <button class="button-link">Log out</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import accountTypes from '../../models/accountType'
import authApi from './authApi'

export default {
  created() {
    if (!this.user || !this.user.accountType) {
      this.$router.push('/login')
      return
    }

    this.sendLink(true)
  },
  computed: {
    email() {
      return this.user && this.user.email
    },
    user() {
      const meta = this.$route.matched.find(record => record && record.meta.getCurrentUser).meta
      return meta.getCurrentUser()
    },
  },
  data() {
    return {
      error: false,
      sent: false,
    }
  },
  methods: {
    sendLink(auto = false) {
      this.error = false
      this.sent = false

      return authApi.sendVerifyLink().then(() => {
        if (!auto) {
          this.sent = true
        }
      }, (err) => {
        this.sent = false
        this.error = true
        console.error(err)
      })
    },
  },
}
</script>

<style scoped>

</style>
