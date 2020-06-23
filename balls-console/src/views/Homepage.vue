<template lang="pug">
.home
  el-carousel.main-infos(
    arrow="always"
    indicator-position="outside"
    trigger="click"
    :autoplay="false"
    height="50em"
  )
    el-carousel-item.content(v-for="(text, i) in carouselTexts" :key="i") 
      h3 {{ text.title }}
      p.item-text(v-html="text.text")
</template>

<script>
export default {
  data() {
    return {
      carouselTexts: [
        {
          title: 'Wilkommen zu unser Projekt!',
          text: `
            Ballstracker ist ein von Schülern des
            <a href="https://www.mpg-muenchen.de/" target="new">
              Max-Planck Gymnasiums
            </a> entwickeltes Eyetracking-System, welches für den Einsatz an
            Förderschulen konzipiert wurde, um zu überprüfen, ob die Schüler
            die Fähigkeit haben, mit ihren Augen bestimmte Positionen
            anzusteuern
          `
        }
      ]
    }
  }
}
</script>

<style lang="sass" scoped>
.home
  display: flex
  flex-direction: column
  .main-infos
    width: 90%
    margin-left: auto
    margin-right: auto
    .content
      display: flex
      flex-direction: column
      justify-content: center
      align-items: center
      .item-text
        $item-text-margin: 8em
        margin-left: $item-text-margin
        margin-right: $item-text-margin
</style>
