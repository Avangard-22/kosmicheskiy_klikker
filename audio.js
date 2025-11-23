/**
 * Модуль аудио
 * Отвечает за воспроизведение звуковых эффектов в игре
 */

// Элементы аудио
const clickSound = document.getElementById('clickSound')
const breakSound = document.getElementById('breakSound')
const upgradeSound = document.getElementById('upgradeSound')
const comboSound = document.getElementById('comboSound')
const helperSound = document.getElementById('helperSound')

/**
 * Инициализация аудио
 */
export function initAudio() {
  // Добавляем обработчики ошибок для аудио
  const audioElements = [clickSound, breakSound, upgradeSound, comboSound, helperSound]
  
  audioElements.forEach(audio => {
    if (audio) {
      audio.addEventListener('error', (e) => {
        console.warn('Ошибка загрузки аудио:', e.target.src)
      })
    }
  })
}

/**
 * Воспроизвести звук
 * @param {string} soundId - ID звукового элемента
 */
export function playSound(soundId) {
  let sound = null
  
  switch(soundId) {
    case 'clickSound':
      sound = clickSound
      break
    case 'breakSound':
      sound = breakSound
      break
    case 'upgradeSound':
      sound = upgradeSound
      break
    case 'comboSound':
      sound = comboSound
      break
    case 'helperSound':
      sound = helperSound
      break
  }
  
  if (sound) {
    sound.currentTime = 0
    sound.play().catch(e => {
      console.warn('Не удалось воспроизвести звук:', soundId, e)
    })
  }
}

/**
 * Воспроизвести звук при клике
 * @param {Event} e - событие клика
 */
export function playClickSound(e) {
  playSound('clickSound')
  
  // Вибрация на мобильных устройствах
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }
}

/**
 * Воспроизвести звук разрушения блока
 */
export function playBreakSound() {
  playSound('breakSound')
}

/**
 * Воспроизвести звук улучшения
 */
export function playUpgradeSound() {
  playSound('upgradeSound')
}

/**
 * Воспроизвести звук комбо
 */
export function playComboSound() {
  playSound('comboSound')
}

/**
 * Воспроизвести звук помощника
 */
export function playHelperSound() {
  playSound('helperSound')
}
