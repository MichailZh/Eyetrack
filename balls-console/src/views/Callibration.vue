<template lang="pug">
div
  el-alert.cam-error(
    v-if="webCamErrorCode !== null"
    type="error"
    :title="webcamErrorMessage"
    show-icon
  )
  div.webcam-view
    video#webcam(width="400" height="300" ref="webcam" autoplay)
    canvas#overlay(width="400" height="300" ref="overlay")
  canvas#eyes(width="50" height="25" ref="eyes" v-show="false")
  el-button#train(
    @click="fitModel"
    type="primary"
    :loading="trainloading"
  ) Train!
  // popup code
  // el-button(@click="popup") Hallo
  #target(
    v-show="targetPos.x !== null"
    :style="{top: targetPos.x + 'px', left: targetPos.y + 'px'}"
    ref="target"
  )
</template>

<script>
import clm from '../components/clmtrackr.js'
import * as tf from '@tensorflow/tfjs'

export default {
  data() {
    return {
      webCamErrorCode: null,
      interrupt: false,
      camErrorMessages: {
        0: 'Bitte geben sie uns Zugriff auf ihre Webcam',
        8: 'Keine Webcam erkannt: Bitte verbinden sie eine Kamera/Webcam'
      },
      targetPos: {
        x: null,
        y: null
      },
      trainloading: false,
      dataset: {
        train: {
          n: 0,
          x: null,
          y: null
        },
        val: {
          n: 0,
          x: null,
          y: null
        }
      },
      mouse: {
        x: null,
        y: null
      },
      currentModel: null
    }
  },
  computed: {
    webcamErrorMessage() {
      if (this.webCamErrorCode === null) return

      const message =
        this.camErrorMessages[this.webCamErrorCode] ||
        'Ein Fehler ist mit ihre Webcam aufgetreten bitte versuchen sie es nochmal'
      return message + ' und laden sie die Seite neu'
    }
  },
  methods: {
    updateTarget() {
      if (this.currentModel === null) {
        return
      }
      tf.tidy(() => {
        const image = this.getImage()
        const prediction = this.currentModel.predict(image)

        // Конвертируем нормализованные координаты в позицию на экране

        const targetWidth = this.$refs.target.offsetWidth
        const targetHeight = this.$refs.target.offsetHeight

        const slope = targetHeight / targetWidth

        const { height, width } = this.getWindowDim()
        const x = ((prediction.get(0, 0) + 1) / 2) * (width - targetWidth)
        const y = ((prediction.get(0, 1) + 1) / 2) * (height - targetHeight)

        // Переместим в нужное место кружок:
        // const target = this.$refs.target
        this.targetPos.x = x
        this.targetPos.y = y
      })
    },
    createModel() {
      const model = tf.sequential()

      model.add(
        tf.layers.conv2d({
          kernelSize: 5,
          filters: 20,
          strides: 1,
          activation: 'relu',
          inputShape: [this.$refs.eyes.height, this.$refs.eyes.width, 3]
        })
      )

      model.add(
        tf.layers.maxPooling2d({
          poolSize: [2, 2],
          strides: [2, 2]
        })
      )

      model.add(tf.layers.flatten())

      model.add(tf.layers.dropout(0.2))

      // Два выходных значения x и y
      model.add(
        tf.layers.dense({
          units: 2,
          activation: 'tanh'
        })
      )

      // Используем оптимизатор Adam с коэффициентом скорости обучения 0.0005 и с функцией потерь MSE
      model.compile({
        optimizer: tf.train.adam(0.0005),
        loss: 'meanSquaredError'
      })

      return model
    },
    fitModel() {
      console.log('this.dataset:', this.dataset)
      let batchSize = Math.max(Math.floor(this.dataset.train.n * 0.1), 1)
      if (batchSize < 4) {
        batchSize = 4
      } else if (batchSize > 64) {
        batchSize = 64
      }

      if (this.currentModel === null) {
        this.currentModel = this.createModel()
      }
      tf.tidy(() => {
        this.currentModel.fit(this.dataset.train.x, this.dataset.train.y, {
          batchSize: batchSize,
          epochs: 20,
          shuffle: true,
          validationData: [this.dataset.val.x, this.dataset.val.y],
          onTrainEnd: () => {
            this.trainloading = false
          },
          onTrainBegin: () => {
            this.trainloading = true
          }
        })
      })
    },
    getImage() {
      // Захват текущего изображения в виде тензора
      return tf.tidy(() => {
        const image = tf.fromPixels(this.$refs.eyes)
        // Добавление <i><font color="#999999">измерения</font></i>:
        const batchedImage = image.expandDims(0)
        // Нормализация и возврат данных:
        return batchedImage
          .toFloat()
          .div(tf.scalar(127))
          .sub(tf.scalar(1))
      })
    },
    getWindow() {
      return this.$el.ownerDocument.defaultView
    },
    getWindowDim() {
      const window = this.getWindow()
      return {
        width: window.innerHeight,
        height: window.innerWidth
      }
    },
    processKeyDown(event) {
      console.log('captured')
      // Выполняется при нажатии на клавишу Пробел на клавиатуре
      if (event.keyCode === 32) {
        this.captureExample()

        event.preventDefault()
        return false
      }
    },
    captureExample() {
      // Возьмём самое свежее изображение глаз и добавим его в набор данных
      tf.tidy(() => {
        const image = this.getImage()
        const mousePos = tf.tensor1d([this.mouse.x, this.mouse.y]).expandDims(0)

        // Решим, в какую выборку (обучающую или контрольную) его добавлять

        const subset = this.dataset[
          this.dataset.train.n === 0 || Math.random() > 0.2 ? 'train' : 'val'
        ]

        if (subset.x === null) {
          // Создадим новые тензоры
          subset.x = tf.keep(image)
          subset.y = tf.keep(mousePos)
        } else {
          // Конкатенируем их с существующими тензорами
          const oldX = subset.x
          const oldY = subset.y

          subset.x = tf.keep(oldX.concat(image, 0))
          subset.y = tf.keep(oldY.concat(mousePos, 0))
        }

        // Увеличим счётчик
        subset.n++
      })
    },
    captureMouseCoords({ x, y }) {
      this.mouse.x = (x / this.getWindow().innerWidth) * 2 - 1
      this.mouse.y = (y / this.getWindow().innerHeight) * 2 - 1
      // mouse.x = (event.clientX / $(window).width()) * 2 - 1;
      // mouse.y = (event.clientY / $(window).height()) * 2 - 1;
    },
    popup() {
      this.getWindow().open('/donate', 'spezial', 'width=700,height=500')
    }
  },
  mounted() {
    const video = this.$refs.webcam
    const ctrack = new clm.tracker()
    ctrack.init()
    const overlay = this.$refs.overlay
    const overlayCC = overlay.getContext('2d')
    // Отслеживание перемещений мыши:

    const trackingLoop = origin => () => {
      if (this.interrupt) {
        return
      }
      // Проверим, обнаружено ли в видеопотоке лицо,
      // и если это так - начнём его отслеживать.
      requestAnimationFrame(trackingLoop('requestAnimationFrame'))

      let currentPosition = ctrack.getCurrentPosition()
      overlayCC.clearRect(0, 0, 400, 300)

      if (currentPosition) {
        // Выведем линии, проведённые между контрольными точками
        // на элементе <canvas>, наложенном на элемент <video>
        ctrack.draw(overlay)

        // Получим прямоугольник, ограничивающий глаза, и обведём его
        // красными линиями
        const eyesRect = getEyesRectangle(currentPosition)
        overlayCC.strokeStyle = 'red'
        overlayCC.strokeRect(eyesRect[0], eyesRect[1], eyesRect[2], eyesRect[3])

        // Видеопоток может иметь особые внутренние параметры,
        // поэтому нам нужны эти константы для перемасштабирования
        // прямоугольника с глазами перед обрезкой
        const resizeFactorX = video.videoWidth / video.width
        const resizeFactorY = video.videoHeight / video.height

        // Вырезаем прямоугольник с глазами из видео и выводим его
        // в соответствующем элементе <canvas>
        const eyesCanvas = this.$refs.eyes
        const eyesCC = eyesCanvas.getContext('2d')

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
      }
    }

    function onStreaming(stream) {
      video.srcObject = stream
      ctrack.start(video)
      trackingLoop('onStreaming')()
    }
    function getEyesRectangle(positions) {
      const minX = positions[23][0] - 5
      const maxX = positions[28][0] + 5
      const minY = positions[24][1] - 5
      const maxY = positions[26][1] + 5

      const width = maxX - minX
      const height = maxY - minY

      return [minX, minY, width, height]
    }
    this.getWindow().addEventListener('mousemove', this.captureMouseCoords)
    this.getWindow().addEventListener('keydown', this.processKeyDown)

    this.intervalLoop = setInterval(this.updateTarget, 100)

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(onStreaming)
      .catch(err => {
        this.webCamErrorCode = err.code
      })
  },
  beforeDestroy() {
    clearInterval(this.intervalLoop)
    this.interrupt = true
    this.getWindow().removeEventListener('mousemove', this.captureMouseCoords)
    this.getWindow().removeEventListener('keydown', this.processKeyDown)
  }
}
</script>

<style lang="sass" scoped>
#eyes
  position: absolute
  top: 0
  right: 1000px

#mouth
  position: absolute
  top: 50px
  left: 500px

.webcam-view
  position: relative
  margin: 3em
  #webcam, #overlay
    position: absolute
    top: 0
    left: 0

.cam-error
  margin: 0.8em
  width: 99%

#train
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  font-size: 24pt

#target
  background-color: lightgreen
  position: absolute
  border-radius: 50%
  height: 40px
  width: 40px
  transition: all 0.1s ease
  box-shadow: 0 0 20px 10px white
  border: 4px solid rgba(0, 0, 0, 0.5)
</style>
