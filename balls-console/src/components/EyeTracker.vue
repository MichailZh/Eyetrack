<template lang="pug">
div
  video#webcam(width="400" height="300" autoplay)
  canvas#overlay(width="400" height="300")
  canvas#mouth(width="40" height="25")
  canvas#eyes(width="50" height="25")
</template>

<style lang="sass" scoped>
#eyes
  position: absolute
  top: 0
  left: 500px

#mouth
  position: absolute
  top: 50px
  left: 500px

#webcam, #overlay
  position: absolute
  top: 0
  left: 0
</style>
