<template>
  <div class="wrap">
    <div class="delete">
      <h1>Is this goodbye?</h1>
      <p>To continue, type your account password below and click "Delete my account".</p>
      <div class="actions">
        <input 
          class="password-input" 
          type="password" 
          v-model="password" 
          autocomplete="off" 
          :disabled="saving">
        <button 
          v-if="!saving" 
          class="button-red" 
          @click="deleteAccount">Delete my account</button>
      </div>
      <div 
        class="error" 
        v-if="error">
        That didn't work. Please check your password and try again.
        If the problem persists, contact us for assistance.
      </div>
    </div>
    <hr>
    <div class="cancel">
      <router-link to="/account">
        <button class="button-link">Never mind, go back</button>
      </router-link>
    </div>
  </div>
</template>

<script>
import authApi from './authApi'

export default {
  data() {
    return {
      error: false,
      password: '',
      saving: false,
    }
  },
  methods: {
    deleteAccount() {
      this.saving = true
      this.error = false
      authApi.deleteAccount({ password: this.password }).then(() => {
        this.saving = false
        this.$router.push('/login')
      }, (err) => {
        this.error = true
        this.saving = false
        console.error(err)
      })
    },
  },
}
</script>

<style scoped>

</style>
