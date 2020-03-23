<template lang="pug">
#app
  h1 App
  eye-tracker
  cookie-law(theme="dark-lime")
</template>

<script>
import CookieLaw from 'vue-cookie-law'
import EyeTracker from './components/EyeTracker'

export default {
  components: { CookieLaw, EyeTracker }
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
