<template lang="pug">
#app
  cookie-law(
    theme="dark-lime"
    buttonText="Verstanden!"
    :message="cookieMessage"
    buttonClass="el-button el-button--success"
    @accept="accept"
    ref="cookies"
  )
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
//   el-footer
//     span footer
</template>

<script>
import CookieLaw from 'vue-cookie-law'

export default {
  components: { CookieLaw },
  data() {
    return {
      cookieMessage: 'Diese Webseite verwendet cookies um ihre Nutzererfahrung zu verbessern'
    }
  },
  mounted() {
    console.log('this.$refs.cookies.getVisited():', this.$refs.cookies.getVisited())
  },
  methods: {
    accept() {
      console.log('accepted')
    }
  }
}
</script>

<style lang="sass" scoped>

footer
  position: absolute
  bottom: 0
  left: 0.5em
  right: 0.5em
  border: 1px solid
</style>

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
