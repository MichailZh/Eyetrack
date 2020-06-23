<template lang="pug">
#app
  cookie-law(
    theme="dark-lime"
    buttonText="Verstanden!"
    :message="cookieMessage"
    buttonClass="el-button el-button--success"
  )
  el-header.top-bar(
    v-if="$route.name !== 'invalid-url'"
  )
    // el-button(@click="showRouter") show me!
    h2.title
      router-link.home-link(to="/") Balltracker
    el-menu.top-bar-menu(
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
  methods: {
    showRouter() {
      console.log('this.$router:', this.$router)
    }
  }
}
</script>

<style lang="sass" scoped>

.top-bar
  display: flex
  .top-bar-menu
    flex-grow: 1
  .title
    .home-link
      text-decoration: none
      color: inherit
    margin-right: 1em

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
