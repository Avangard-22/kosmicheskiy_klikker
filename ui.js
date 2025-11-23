/**
 * Модуль пользовательского интерфейса
 * Отвечает за взаимодействие с DOM-элементами, отображение HUD, всплывающих подсказок и экранов
 */

import { 
  startGame, 
  continueGame, 
  restartGame,
  buyClickPower, 
  buyHelper, 
  buyCritChance, 
  buyCritMultiplier,
  buyHelperDamage,
  checkDailyReward,
  shareResult
} from './gameLogic.js'
import { playSound } from './audio.js'

// DOM элементы
const coinsDisplay = document.getElementById("coins-value")
const clickPowerDisplay = document.getElementById("clickPower-value")
const critChanceDisplay = document.getElementById("critChance-value")
const critMultiplierDisplay = document.getElementById("critMultiplier-value")
const tooltip = document.getElementById("tooltip")

// Экраны
const welcomeScreen = document.getElementById("welcomeScreen")
const saveScreen = document.getElementById("saveScreen")
const gameOverScreen = document.getElementById("gameOverScreen")
const developmentScreen = document.getElementById("developmentScreen")
const dailyRewardsScreen = document.getElementById("dailyRewardsScreen")

// Кнопки
const startBtn = document.getElementById("startBtn")
const continueBtn = document.getElementById("continueBtn")
const loadSaveBtn = document.getElementById("loadSaveBtn")
const newGameBtn = document.getElementById("newGameBtn")
const cancelSaveBtn = document.getElementById("cancelSaveBtn")
const restartBtn = document.getElementById("restartBtn")
const restartFromDevBtn = document.getElementById("restartFromDevBtn")
const shareBtn = document.getElementById("shareBtn")
const dailyRewardBtn = document.getElementById("dailyRewardBtn")
const dailyRewardsBtn = document.getElementById("dailyRewardsBtn")
const claimDailyRewardBtn = document.getElementById("claimDailyRewardBtn")
const closeDailyRewardsBtn = document.getElementById("closeDailyRewardsBtn")
const saveBtn = document.getElementById("saveBtn")

// Кнопки улучшений
const upgradeClickBtn = document.getElementById("upgradeClickBtn")
const upgradeHelperBtn = document.getElementById("upgradeHelperBtn")
const upgradeCritChanceBtn = document.getElementById("upgradeCritChanceBtn")
const upgradeCritMultBtn = document.getElementById("upgradeCritMultBtn")
const upgradeHelperDmgBtn = document.getElementById("upgradeHelperDmgBtn")

/**
 * Обновить отображение кристаллов
 * @param {number} value - количество кристаллов
 */
export function updateCoinsDisplay(value) {
  if (coinsDisplay) coinsDisplay.textContent = Math.floor(value).toLocaleString()
}

/**
 * Обновить отображение силы клика
 * @param {number} value - сила клика
 */
export function updateClickPowerDisplay(value) {
  if (clickPowerDisplay) clickPowerDisplay.textContent = Math.round(value)
}

/**
 * Обновить отображение шанса критического удара
 * @param {number} value - шанс крита в долях единицы
 */
export function updateCritChanceDisplay(value) {
  if (critChanceDisplay) critChanceDisplay.textContent = `${(value * 100).toFixed(1)}%`
}

/**
 * Обновить отображение множителя критического урода
 * @param {number} value - множитель крита
 */
export function updateCritMultiplierDisplay(value) {
  if (critMultiplierDisplay) critMultiplierDisplay.textContent = `x${value.toFixed(1)}`
}

/**
 * Показать всплывающую подсказку
 * @param {string} text - текст подсказки
 */
export function showTooltip(text) {
  if (tooltip) {
    tooltip.innerHTML = text
    tooltip.style.opacity = "1"
  }
}

/**
 * Скрыть всплывающую подсказку
 */
export function hideTooltip() {
  if (tooltip) tooltip.style.opacity = "0"
}

/**
 * Создать текст урона
 * @param {number} damage - количество урона
 * @param {HTMLElement} block - DOM элемент блока
 * @param {string} color - цвет текста
 */
export function createDamageText(damage, block, color = '#ff4444') {
  const rect = block.getBoundingClientRect()
  const text = document.createElement('div')
  text.className = 'damage-text'
  text.textContent = `-${damage}`
  text.style.color = color
  
  let left = rect.left + rect.width / 2
  let top = rect.top
  const textWidth = 100
  
  if (left < textWidth / 2) left = textWidth / 2
  if (left > window.innerWidth - textWidth / 2) left = window.innerWidth - textWidth / 2
  if (top < 50) top = 50
  
  text.style.left = left + 'px'
  text.style.top = top + 'px'
  document.body.appendChild(text)
  
  let opacity = 1
  let yPos = parseInt(text.style.top)
  
  function animate() {
    opacity -= 0.02
    yPos -= 2
    text.style.opacity = opacity
    text.style.top = yPos + 'px'
    
    if (opacity > 0) {
      requestAnimationFrame(animate)
    } else {
      if (text.parentNode) {
        document.body.removeChild(text)
      }
    }
  }
  
  animate()
}

/**
 * Показать текст комбо
 * @param {number} combo - количество комбо
 * @param {number} bonus - бонус от комбо
 * @param {HTMLElement} block - DOM элемент блока
 */
export function showComboText(combo, bonus, block) {
  const rect = block.getBoundingClientRect()
  const text = document.createElement('div')
  text.className = 'combo-text'
  text.textContent = `Комбо x${combo}! +${bonus}`
  
  let left = rect.left + rect.width / 2
  let top = rect.top
  const textWidth = 150
  
  if (left < textWidth / 2) left = textWidth / 2
  if (left > window.innerWidth - textWidth / 2) left = window.innerWidth - textWidth / 2
  if (top < 50) top = 50
  
  text.style.left = left + 'px'
  text.style.top = top + 'px'
  document.body.appendChild(text)
  
  setTimeout(() => {
    if (text.parentNode) {
      document.body.removeChild(text)
    }
  }, 1000)
}

/**
 * Показать текст награды
 * @param {number} reward - количество награды
 * @param {HTMLElement} block - DOM элемент блока
 */
export function showRewardText(reward, block) {
  const rect = block.getBoundingClientRect()
  const text = document.createElement('div')
  text.className = 'reward-text'
  text.textContent = `+${reward} 💎`
  
  let left = rect.left + rect.width / 2
  let top = rect.top + rect.height / 2
  const textWidth = 120
  
  if (left < textWidth / 2) left = textWidth / 2
  if (left > window.innerWidth - textWidth / 2) left = window.innerWidth - textWidth / 2
  if (top < 50) top = 50
  
  text.style.left = left + 'px'
  text.style.top = top + 'px'
  document.body.appendChild(text)
  
  setTimeout(() => {
    if (text.parentNode) {
      document.body.removeChild(text)
    }
  }, 1500)
}

/**
 * Создать эффект взрыва
 * @param {HTMLElement} block - DOM элемент блока
 */
export function createExplosion(block) {
  const rect = block.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  
  // Размер взрыва
  const explosionSize = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 150 : 200
  
  // Создаем основной взрыв
  const explosion = document.createElement('div')
  explosion.className = 'explosion'
  explosion.style.left = centerX + 'px'
  explosion.style.top = centerY + 'px'
  explosion.style.width = explosionSize + 'px'
  explosion.style.height = explosionSize + 'px'
  document.body.appendChild(explosion)
  
  // Количество частиц
  const particleCount = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 20 : 25
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div')
    particle.className = 'explosion-particle'
    particle.style.left = centerX + 'px'
    particle.style.top = centerY + 'px'
    
    // Размер частиц
    const particleSize = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 10 : 12
    particle.style.width = particleSize + 'px'
    particle.style.height = particleSize + 'px'
    
    // Цвет частиц
    const location = locations[currentLocation]
    particle.style.backgroundColor = location.blockColors[Math.floor(Math.random() * location.blockColors.length)]
    
    // Расстояние разлета
    const angle = Math.random() * Math.PI * 2
    const distance = 50 + Math.random() * 100
    const tx = Math.cos(angle) * distance
    const ty = Math.sin(angle) * distance
    particle.style.setProperty('--tx', tx + 'px')
    particle.style.setProperty('--ty', ty + 'px')
    
    document.body.appendChild(particle)
    
    // Удаляем частицы после анимации
    setTimeout(() => {
      if (particle.parentNode) {
        document.body.removeChild(particle)
      }
    }, 800)
  }
  
  // Удаляем основной взрыв после анимации
  setTimeout(() => {
    if (explosion.parentNode) {
      document.body.removeChild(explosion)
    }
  }, 600)
}

/**
 * Настроить обработчики событий для UI
 * @param {Object} handlers - объект с обработчиками событий
 */
export function setupUIEventListeners(handlers) {
  // Кнопки главного экрана
  if (startBtn) {
    addClickHandler(startBtn, () => {
      saveScreen.style.display = "flex"
    })
  }
  
  if (continueBtn) {
    addClickHandler(continueBtn, () => {
      const hasSave = localStorage.getItem('cosmicBlocksSave') !== null
      if (hasSave) {
        saveScreen.style.display = "flex"
      } else {
        showTooltip("Нет сохраненной игры!")
        setTimeout(hideTooltip, 2000)
      }
    })
  }
  
  // Кнопки экрана сохранения
  if (loadSaveBtn) {
    addClickHandler(loadSaveBtn, handlers.continueGame)
  }
  
  if (newGameBtn) {
    addClickHandler(newGameBtn, () => handlers.startGame(true))
  }
  
  if (cancelSaveBtn) {
    addClickHandler(cancelSaveBtn, () => {
      if (saveScreen) saveScreen.style.display = "none"
    })
  }
  
  // Кнопки экрана завершения игры
  if (restartBtn) {
    addClickHandler(restartBtn, handlers.restartGame)
  }
  
  if (shareBtn) {
    addClickHandler(shareBtn, shareResult)
  }
  
  if (dailyRewardBtn) {
    addClickHandler(dailyRewardBtn, checkDailyReward)
  }
  
  // Кнопки ежедневных наград
  if (dailyRewardsBtn) {
    addClickHandler(dailyRewardsBtn, checkDailyReward)
  }
  
  if (claimDailyRewardBtn) {
    addClickHandler(claimDailyRewardBtn, () => {
      // Логика получения награды будет добавлена позже
      console.log('Claim daily reward')
    })
  }
  
  if (closeDailyRewardsBtn) {
    addClickHandler(closeDailyRewardsBtn, () => {
      if (dailyRewardsScreen) dailyRewardsScreen.style.display = "none"
    })
  }
  
  // Кнопки улучшений
  if (upgradeClickBtn) {
    addClickHandler(upgradeClickBtn, buyClickPower)
    upgradeClickBtn.addEventListener('mouseenter', () => 
      showTooltip('Сила удара<br>Нелинейный рост урона')
    )
    upgradeClickBtn.addEventListener('mouseleave', hideTooltip)
  }
  
  if (upgradeHelperBtn) {
    addClickHandler(upgradeHelperBtn, buyHelper)
    upgradeHelperBtn.addEventListener('mouseenter', () => 
      showTooltip('Bobo<br>Авто-атака на 1 минуту<br>+30% урона<br>+20% к кристаллам')
    )
    upgradeHelperBtn.addEventListener('mouseleave', hideTooltip)
  }
  
  if (upgradeCritChanceBtn) {
    addClickHandler(upgradeCritChanceBtn, buyCritChance)
    upgradeCritChanceBtn.addEventListener('mouseenter', () => 
      showTooltip('Шанс крита<br>+0.1% шанс крит. урона')
    )
    upgradeCritChanceBtn.addEventListener('mouseleave', hideTooltip)
  }
  
  if (upgradeCritMultBtn) {
    addClickHandler(upgradeCritMultBtn, buyCritMultiplier)
    upgradeCritMultBtn.addEventListener('mouseenter', () => 
      showTooltip('Множитель крита<br>+0.2x крит. урона')
    )
    upgradeCritMultBtn.addEventListener('mouseleave', hideTooltip)
  }
  
  if (upgradeHelperDmgBtn) {
    addClickHandler(upgradeHelperDmgBtn, buyHelperDamage)
    upgradeHelperDmgBtn.addEventListener('mouseenter', () => 
      showTooltip('Урон Bobo<br>+20% урона за апгрейд')
    )
    upgradeHelperDmgBtn.addEventListener('mouseleave', hideTooltip)
  }
  
  // Кнопка сохранения
  if (saveBtn) {
    addClickHandler(saveBtn, () => {
      // Логика сохранения игры будет добавлена позже
      showTooltip('Игра сохранена!')
      setTimeout(hideTooltip, 1500)
    })
  }
  
  // Кнопки экрана разработки
  if (restartFromDevBtn) {
    addClickHandler(restartFromDevBtn, handlers.restartGame)
  }
}

/**
 * Добавить обработчики событий клика и тача
 * @param {HTMLElement} element - DOM элемент
 * @param {Function} handler - обработчик события
 */
function addClickHandler(element, handler) {
  if (!element) return
  
  element.addEventListener('click', handler)
  element.addEventListener('touchstart', (e) => {
    e.preventDefault()
    handler()
  }, { passive: false })
}
