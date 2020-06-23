<template lang="pug">
.not-found
  h1 404 Nicht gefunden
  p Die URL '{{ $route.fullPath }}' wurde leider nicht gefunden
  el-button(
    @click="slowRoute('home')"
    :loading="loading"
  )
    | Zurück zur Homepage
    i.el-icon-right.return-icon

</template>

<script>
export default {
  data() {
    return {
      loading: false
    }
  },
  methods: {
    slowRoute(destPath) {
      this.loading = true
      setTimeout(() => {
        this.$router.replace({ path: destPath })
        this.loading = false
      }, 350)
    }
  }
}
</script>

<style lang="sass" scoped>
.not-found
  position: fixed
  top: 30%
  left: 50%
  transform: translate(-50%, -50%)
  // flex-direction: column
  .return-icon
    $return-icon-margin: 0.3em
    margin-left: $return-icon-margin
    margin-right: $return-icon-margin
</style>
