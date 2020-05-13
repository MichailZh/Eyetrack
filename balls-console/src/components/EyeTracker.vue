<template lang="pug">
div
  video#webcam(width="400" height="300" ref="webcam" autoplay)
  canvas#overlay(width="400" height="300" ref="overlay")
  canvas#eyes(width="50" height="25" ref="eyes")
  el-button#train(@click="fitModel") Train!
  #target
</template>

<script>
import clm from './clmtrackr.js'
import * as tf from '@tensorflow/tfjs'

export default {
  data() {
    return {
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
  methods: {
    updateTarget() {
      if (this.currentModel === null) {
        return
      }
      tf.tidy(() => {
        const image = this.getImage()
        const prediction = this.currentModel.predict(image)

        // Конвертируем нормализованные координаты в позицию на экране
        const targetWidth = this.$refs.target.outerWidth()
        const targetHeight = this.$refs.target.outerHeight()
        const { height, width } = this.getWindowDim()
        const x = ((prediction.get(0, 0) + 1) / 2) * (width - targetWidth)
        const y = ((prediction.get(0, 1) + 1) / 2) * (height - targetHeight)

        // Переместим в нужное место кружок:
        const target = this.$refs.target
        target.css('left', `${x}px`)
        target.css('top', `${y}px`)
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
      let batchSize = Math.floor(this.dataset.train.n * 0.1)
      if (batchSize < 4) {
        batchSize = 4
      } else if (batchSize > 64) {
        batchSize = 64
      }

      if (this.currentModel === null) {
        this.currentModel = this.createModel()
      }

      this.currentModel.fit(this.dataset.train.x, this.dataset.train.y, {
        batchSize: batchSize,
        epochs: 20,
        shuffle: true,
        validationData: [this.dataset.val.x, this.dataset.val.y]
      })
    },
    getImage() {
      // Захват текущего изображения в виде тензора
      return tf.tidy(() => {
        const image = tf.browser.fromPixels(this.$refs.eyes)
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
      const window = getWindow()
      return {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  },
  mounted() {
    // console.log('window:', window)
    // console.log('this:', this)
    // console.log('this.$el.ownerDocument.defaultView:', this.$el.ownerDocument.defaultView)
    const video = this.$refs.webcam
    const ctrack = new clm.tracker()
    ctrack.init()
    const overlay = this.$refs.overlay
    const overlayCC = overlay.getContext('2d')
    // Отслеживание перемещений мыши:

    const captureExample = () => {
      // Возьмём самое свежее изображение глаз и добавим его в набор данных
      tf.tidy(() => {
        const image = this.getImage()
        const mousePos = tf.tensor1d([this.mouse.x, this.mouse.y]).expandDims(0)

        // Решим, в какую выборку (обучающую или контрольную) его добавлять
        const subset = this.dataset[Math.random() > 0.2 ? 'train' : 'val']

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
        subset.n += 1
      })
    }

    const trackingLoop = () => {
      // Проверим, обнаружено ли в видеопотоке лицо,
      // и если это так - начнём его отслеживать.
      requestAnimationFrame(trackingLoop)

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
      trackingLoop()
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
    this.getWindow().addEventListener('keyup', function(event) {
      // Выполняется при нажатии на клавишу Пробел на клавиатуре
      console.log('event:', event)
      if (event.keyCode === 32) {
        captureExample()

        event.preventDefault()
        return false
      }
    })

    setInterval(this.updateTarget, 100)

    navigator.mediaDevices.getUserMedia({ video: true }).then(onStreaming)
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

#webcam, #overlay
  position: absolute
  top: 0
  left: 0

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
