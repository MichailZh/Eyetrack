<template lang="pug">
#app
  el-header
    el-menu(
      :default-active="$router.currentRoute.path"
      mode="horizontal"
      :router="true"
      :collapse="false"
    )
      el-menu-item(index="/home")
        i.el-icon-s-home
        span(slot="title") Home
      el-menu-item(index="/callibration")
        i.el-icon-rank
        span(slot="title") Kallibrierung
      el-menu-item(index="/donate")
        i.el-icon-coin
        span(slot="title") Spenden sie
    // el-button Einstellungen
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
