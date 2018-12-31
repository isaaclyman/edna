<template>
  <div 
    id="app" 
    class="app">
    <div 
      class="error"
      v-if="incompatible">
      <p>
        This web browser does not support all the features of our app.
        For the best experience, the latest version of Chrome or Firefox is recommended.
      </p>
    </div>
    <div class="page">
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      incompatible: (
        typeof ''.includes !== 'function' ||
        !('serviceWorker' in navigator) ||
        !('storage' in navigator) ||
        typeof window.Promise !== 'function'
      ),
    }
  }
}
</script>

<style scoped>

</style>
