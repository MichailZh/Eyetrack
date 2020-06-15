<template lang="pug">
#app
  el-menu(default-active="1" mode="horizontal")
    el-menu-item(index="1")
      router-link(to="/home") Home
    el-menu-item(index="2")
      router-link(to="/callibration") Kallibrierung
  router-view
  cookie-law(
    theme="dark-lime"
    :buttonText="'Verstanden!'"
    :message="cookieMessage"

  )
    // div(slot="message") hallo
</template>

<script>
import CookieLaw from 'vue-cookie-law'

export default {
  components: { CookieLaw },
  data() {
    return {
      cookieMessage: 'Diese Webseite verwendet cookies um ihre Nutzererfahrung zu verbessern'
    }
  }
}
</script>

<style lang="sass">
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50

#nav
  padding: 30px

  a
    font-weight: bold
    color: #2c3e50

    &.router-link-exact-active
      color: #42b983
</style>
