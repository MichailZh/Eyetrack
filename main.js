$(document).ready(function() {
  const video = $('#webcam')[0];
const ctrack = new clm.tracker();
ctrack.init();
const overlay = $('#overlay')[0];
const overlayCC = overlay.getContext('2d');

function getEyesRectangle(positions) {
  const minX = positions[23][0] - 5;
  const maxX = positions[28][0] + 5;
  const minY = positions[24][1] - 5;
  const maxY = positions[26][1] + 5;

  const width = maxX - minX;
  const height = maxY - minY;

  return [minX, minY, width, height];
}
function getMouthRectangle(positions) {
  const minX = positions[44][0] - 5;
  const maxX = positions[50][0] + 5;
  const minY = positions[46][1] - 5;
  const maxY = positions[53][1] + 5;

  const width = maxX - minX;
  const height = maxY - minY;

  return [minX, minY, width, height];
}

function trackingLoop() {
  // Проверим, обнаружено ли в видеопотоке лицо, 
  // и если это так - начнём его отслеживать.
  requestAnimationFrame(trackingLoop);

  let currentPosition = ctrack.getCurrentPosition();
  overlayCC.clearRect(0, 0, 400, 300);

 //  if (currentPosition) {
 //  ctrack.draw(overlay);
 // }
if (currentPosition) {
  // Выведем линии, проведённые между контрольными точками 
  // на элементе <canvas>, наложенном на элемент <video>
  ctrack.draw(overlay);

  // Получим прямоугольник, ограничивающий глаза, и обведём его
  // красными линиями
  const eyesRect = getEyesRectangle(currentPosition);
  overlayCC.strokeStyle = 'red';
  overlayCC.strokeRect(eyesRect[0], eyesRect[1], eyesRect[2], eyesRect[3]); 

  const mouthRect = getMouthRectangle(currentPosition);
  overlayCC.strokeStyle = 'blue';
  overlayCC.strokeRect(mouthRect[0], mouthRect[1], mouthRect[2], mouthRect[3]);


  // Видеопоток может иметь особые внутренние параметры, 
  // поэтому нам нужны эти константы для перемасштабирования
  // прямоугольника с глазами перед обрезкой
  const resizeFactorX = video.videoWidth / video.width;
  const resizeFactorY = video.videoHeight / video.height;

  // Вырезаем прямоугольник с глазами из видео и выводим его
  // в соответствующем элементе <canvas>
  const eyesCanvas = $('#eyes')[0];
  const eyesCC = eyesCanvas.getContext('2d');

  const mouthCanvas = $('#mouth')[0];
  const mouthCC = mouthCanvas.getContext('2d');


  eyesCC.drawImage(
    video,
    eyesRect[0] * resizeFactorX, eyesRect[1] * resizeFactorY,
    eyesRect[2] * resizeFactorX, eyesRect[3] * resizeFactorY,
    0, 0, eyesCanvas.width, eyesCanvas.height
  );
 mouthCC.drawImage(
    video,
    mouthRect[0] * resizeFactorX, mouthRect[1] * resizeFactorY,
    mouthRect[2] * resizeFactorX, mouthRect[3] * resizeFactorY,
    0, 0, mouthCanvas.width, mouthCanvas.height
  );
}
}

  function onStreaming(stream) {
    video.srcObject = stream;
	ctrack.start(video);
	trackingLoop();
  }

  navigator.mediaDevices.getUserMedia({ video: true }).then(onStreaming);
});