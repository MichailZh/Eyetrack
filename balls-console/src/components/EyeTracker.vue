<template lang="pug">
div
  video#webcam(width="400" height="300" ref="webcam" autoplay)
  canvas#overlay(width="400" height="300" ref="overlay")
  canvas#mouth(width="40" height="25" ref="mouth")
  canvas#eyes(width="50" height="25" ref="eyes")
</template>

<script>
import clm from './clmtrackr.js'

export default {
  mounted() {
    const video = this.$refs.webcam
    const ctrack = new clm.tracker()
    ctrack.init()
    const overlay = this.$refs.overlay
    const overlayCC = overlay.getContext('2d')

    function getEyesRectangle(positions) {
      const minX = positions[23][0] - 5
      const maxX = positions[28][0] + 5
      const minY = positions[24][1] - 5
      const maxY = positions[26][1] + 5

      const width = maxX - minX
      const height = maxY - minY

      return [minX, minY, width, height]
    }

    function getMouthRectangle(positions) {
      const minX = positions[44][0] - 5
      const maxX = positions[50][0] + 5
      const minY = positions[46][1] - 5
      const maxY = positions[53][1] + 5

      const width = maxX - minX
      const height = maxY - minY

      return [minX, minY, width, height]
    }

    const self = this
    function trackingLoop() {
      // Ïðîâåðèì, îáíàðóæåíî ëè â âèäåîïîòîêå ëèöî,
      // è åñëè ýòî òàê - íà÷í¸ì åãî îòñëåæèâàòü.
      requestAnimationFrame(trackingLoop)

      let currentPosition = ctrack.getCurrentPosition()
      overlayCC.clearRect(0, 0, 400, 300)

      if (currentPosition) {
        // Âûâåäåì ëèíèè, ïðîâåä¸ííûå ìåæäó êîíòðîëüíûìè òî÷êàìè
        // íà ýëåìåíòå <canvas>, íàëîæåííîì íà ýëåìåíò <video>
        ctrack.draw(overlay)

        // Ïîëó÷èì ïðÿìîóãîëüíèê, îãðàíè÷èâàþùèé ãëàçà, è îáâåä¸ì åãî
        // êðàñíûìè ëèíèÿìè
        const eyesRect = getEyesRectangle(currentPosition)
        overlayCC.strokeStyle = 'red'
        overlayCC.strokeRect(eyesRect[0], eyesRect[1], eyesRect[2], eyesRect[3])

        const mouthRect = getMouthRectangle(currentPosition)
        overlayCC.strokeStyle = 'blue'
        overlayCC.strokeRect(mouthRect[0], mouthRect[1], mouthRect[2], mouthRect[3])

        // Âèäåîïîòîê ìîæåò èìåòü îñîáûå âíóòðåííèå ïàðàìåòðû,
        // ïîýòîìó íàì íóæíû ýòè êîíñòàíòû äëÿ ïåðåìàñøòàáèðîâàíèÿ
        // ïðÿìîóãîëüíèêà ñ ãëàçàìè ïåðåä îáðåçêîé
        const resizeFactorX = video.videoWidth / video.width
        const resizeFactorY = video.videoHeight / video.height

        // Âûðåçàåì ïðÿìîóãîëüíèê ñ ãëàçàìè èç âèäåî è âûâîäèì åãî
        // â ñîîòâåòñòâóþùåì ýëåìåíòå <canvas>
        const eyesCanvas = self.$refs.eyes
        const eyesCC = eyesCanvas.getContext('2d')

        const mouthCanvas = self.$refs.mouth
        const mouthCC = mouthCanvas.getContext('2d')

        eyesCC.drawImage(
          video,
          eyesRect[0] * resizeFactorX,
          eyesRect[1] * resizeFactorY,
          eyesRect[2] * resizeFactorX,
          eyesRect[3] * resizeFactorY,
          0,
          0,
          eyesCanvas.width,
          eyesCanvas.height
        )
        mouthCC.drawImage(
          video,
          mouthRect[0] * resizeFactorX,
          mouthRect[1] * resizeFactorY,
          mouthRect[2] * resizeFactorX,
          mouthRect[3] * resizeFactorY,
          0,
          0,
          mouthCanvas.width,
          mouthCanvas.height
        )
      }
    }

    function onStreaming(stream) {
      video.srcObject = stream
      ctrack.start(video)
      trackingLoop()
    }

    navigator.mediaDevices.getUserMedia({ video: true }).then(onStreaming)
  }
}
</script>

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
