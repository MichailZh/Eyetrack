<template lang="pug">
.donations-page
  h1 Spenden sie
  p.main-text
    | Wenn sie dieses Project unterstützen möchten können sie gerne Spenden.
    | Überflüssige spenden werden an helfende Organisation weitergegeben. Falls
    | sie auf einer anderen Art spenden möchten können sie uns gerne unter
    copyable-text(text="unsere-email@ballstracker.test-email.com")
    | kontaktieren
  .donations
    .donation(v-for="method in donationMethods" :key="method.address")
      img(:src="loadImage(method.img)")
      p
        | {{ method.text }}
        br
        copyable-text(
          :text="method.address"
        )
</template>

<script>
import CopyableText from '../components/CopyableText'
export default {
  components: { CopyableText },
  data() {
    return {
      donationMethods: [
        {
          text: 'Bitcoin:',
          address: 'bc1qa9hmg56jermp4wlen3zs5psx79vts99z0g9mjd',
          img: 'btc.png'
        },
        {
          text: 'Ethereum oder diverse ERC-20 tokens:',
          address: '0xA45Bad46778b2b2267FD76fc487f83159FC01BEC',
          img: 'eth.png'
        },
        {
          text: 'Monero:',
          address:
            '84JtJJx3P9J2YC6m8qqv2gRbzcZXd1CQaS8NnzHSRautKXXoKRcv8irbsS6ePp7RcvcS2QiD7JjbJQFLWcUpJTDyNEMNUVW',
          img: 'xmr.png'
        }
      ]
    }
  },
  methods: {
    getWindow() {
      return this.$el.ownerDocument.defaultView
    },
    loadImage(addr) {
      const images = require.context('../assets/', false, /\.png$/)
      return images(`./${addr}`)
    }
  }
}
</script>

<style lang="sass" scoped>
.donations-page
  display: flex
  flex-direction: column
  align-items: center

.main-text
  width: 60%
  font-size: large


.donations
  display: flex
  justify-content: space-around

  .donation
    display: flex
    flex-direction: column
    img
      width: 30em
    p
      word-wrap: break-word
      width: 30em
    .copy-button
      margin-left: 0.4em
      height: 1.9em
      padding: 0.4em 1em 0.4em 1em
//    margin: 0.3em
//    padding: 0.2em
//    border: 2px solid blue
//    border-radius: 50%
</style>
