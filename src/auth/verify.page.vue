<template>
  <div class="wrap">
    <div v-if="!failed">
      <h1>
        Verifying...
      </h1>
    </div>
    <div v-if="failed">
      <h1>
        Verification failed.
      </h1>
      <p>
        Please try again. If you keep having trouble, email us for assistance.
      </p>
    </div>
  </div>
</template>

<script>
import authApi from './authApi'

export default {
  beforeCreate() {
    const { email, key } = this.$route.params
    authApi.verify({ email, key }).then(() => {
      this.$router.push('/limited')
    }, () => {
      this.failed = true
    })
  },
  data() {
    return {
      failed: false,
    }
  },
}
</script>

<style scoped>

</style>
