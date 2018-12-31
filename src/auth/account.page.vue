<template>
  <div class="wrap">
    <div class="account">
      <h1 class="type">You have a {{ accountType }}.</h1>
      <h4 
        class="thanks" 
        v-if="isPremium">Thanks for supporting our app!</h4>
    </div>
    <hr>
    <div class="delete">
      <router-link to="/delete-account">
        <button class="button-link">Delete my account</button>
      </router-link>
    </div>
    <hr>
    <div class="cancel">
      <button 
        class="button-link" 
        @click="cancel()">
        Go back to the app
      </button>
    </div>
  </div>
</template>

<script>
import { goToApp } from './shared'

export default {
  created() {
    if (!this.user || !this.user.accountType) {
      this.$router.push('/login')
    }
  },
  computed: {
    accountType() {
      return this.user.accountType.displayName
    },
    user() {
      const meta = this.$route.matched.find(record => record && record.meta.getCurrentUser).meta
      return meta.getCurrentUser()
    },
  },
  data() {
    return {
      error: false,
      saving: false
    }
  },
  methods: {
    cancel() {
      goToApp()
    },
    showSuccessPage() {
      this.$router.push('/success')
    }
  }
}
</script>

<style scoped>

</style>
