/**
 * Модуль игровой логики
 * Содержит основные функции игры: управление ресурсами, прогрессом, игровым процессом
 */

import { 
  BLOCK_SPEED_MOBILE, 
  BLOCK_SPEED_DESKTOP,
  BASE_CLICK_UPGRADE_COST,
  BASE_HELPER_UPGRADE_COST,
  BASE_CRIT_CHANCE_COST,
  BASE_CRIT_MULTIPLIER_COST,
  BASE_HELPER_DMG_COST,
  RARE_BLOCKS,
  BALANCE_CONFIG,
  ASTRONOMICAL_UNITS,
  AU_TO_DAMAGE,
  LOCATION_REQUIREMENTS,
  DAILY_REWARDS
} from './constants.js'
import { createMovingBlock, getBlockSize, animateBlock, destroyBlock, hitBlock, checkLocationUpgrade, updateCracks } from './block.js'
import { updateCoinsDisplay, updateClickPowerDisplay, updateCritChanceDisplay, updateCritMultiplierDisplay } from './ui.js'
import { playSound } from './audio.js'
import { saveGame, loadGame, saveGameMetrics, loadGameMetrics, updateContinueButton } from './storage.js'
import { createHelperElement, moveHelperToRandomPosition, activateHelper, helperAttack, createHelperEffect } from './helpers.js'
import { 
  showTooltip,
  hideTooltip, 
  showComboText, 
  showRewardText, 
  createDamageText, 
  createExplosion
} from './ui.js'

// Глобальные переменные игры
let coins = 0
let totalDamageDealt = 0
let clickPower = 1
let clickUpgradeLevel = 0
let gameActive = false
let currentLocation = 'mercury'
let currentBlockHealth = 0
let currentBlock = null
let comboCount = 0
let lastDestroyTime = 0
const COMBO_TIME_WINDOW = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 1500 : 2000
let helperActive = false
let helperTimeLeft = 0
const helperDuration = 60000
let helperInterval = null
let helperUpgradeLevel = 0
const helperUpgradeMultiplier = 1.8
let critChance = 0.001
let critMultiplier = 2.0
let helperDamageBonus = 0.3
let helperElement = null
let helperPosition = { x: 0, y: 0 }
let bogoCoinBonus = 0
let critChanceUpgradeLevel = 0
let critMultiplierUpgradeLevel = 0

// Метрики игры
let gameMetrics = {
  startTime: Date.now(),
  blocksDestroyed: 0,
  upgradesBought: 0,
  totalClicks: 0,
  sessions: 1,
  currentDailyStreak: 0,
  lastDailyClaim: 0,
  dailyCycleStarted: Date.now()
}

/**
 * Инициализация игры
 * Загружает метрики и обновляет интерфейс
 */
export function initializeGame() {
  loadGameMetrics()
  updateCoinsDisplay(coins)
  updateClickPowerDisplay(clickPower)
  updateCritChanceDisplay(critChance)
  updateCritMultiplierDisplay(critMultiplier)
  updateContinueButton()
}

/**
 * Получение текущей скорости блоков
 * @returns {number} скорость движения блоков
 */
export function getCurrentSpeed() {
  const baseSpeed = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 
    BLOCK_SPEED_MOBILE : BLOCK_SPEED_DESKTOP
  const locationIndex = Object.keys(LOCATION_REQUIREMENTS).indexOf(currentLocation)
  if (locationIndex < 3) {
    return baseSpeed * 0.85
  }
  return baseSpeed
}

/**
 * Расчет здоровья блока
 * @returns {number} здоровье нового блока
 */
export function calculateBlockHealth() {
  const currentReq = LOCATION_REQUIREMENTS[currentLocation]
  const locationBonus = 1 + (currentReq.targetAU * 2)
  let baseHealth = BALANCE_CONFIG.baseHealth * locationBonus
  const targetHealth = clickPower * BALANCE_CONFIG.targetClicks
  const combinedHealth = (baseHealth + targetHealth) / 2
  const randomFactor = BALANCE_CONFIG.healthRandomRange.min + 
                      Math.random() * (BALANCE_CONFIG.healthRandomRange.max - BALANCE_CONFIG.healthRandomRange.min)
  return Math.floor(combinedHealth * randomFactor)
}

/**
 * Расчет силы клика
 * @returns {number} сила клика после всех модификаторов
 */
export function calculateClickPower() {
  const basePower = 1
  const upgradeBonus = clickUpgradeLevel
  const diminishingEffect = Math.pow(BALANCE_CONFIG.damageProgression.diminishingReturns, 
                                   Math.min(clickUpgradeLevel, BALANCE_CONFIG.damageProgression.maxLevelEffect))
  const nonLinearGrowth = Math.sqrt(clickUpgradeLevel + 1)
  return basePower + (upgradeBonus * diminishingEffect * nonLinearGrowth * BALANCE_CONFIG.damageProgression.baseMultiplier)
}

/**
 * Получение ожидаемого количества кликов для уничтожения блока
 * @param {number} blockHealth - здоровье блока
 * @param {number} playerDamage - урон игрока
 * @returns {number} ожидаемое количество кликов
 */
export function getExpectedClicks(blockHealth, playerDamage) {
  return Math.ceil(blockHealth / playerDamage)
}

/**
 * Получение типа редкого блока
 * @returns {string|null} тип редкого блока или null
 */
export function getRareBlockType() {
  const rand = Math.random()
  let cumulativeChance = 0
  for (const [type, block] of Object.entries(RARE_BLOCKS)) {
    cumulativeChance += block.chance
    if (rand <= cumulativeChance) {
      return type
    }
  }
  return null
}

/**
 * Обновление прогресс-бара
 */
export function updateProgressBar() {
  const currentReq = LOCATION_REQUIREMENTS[currentLocation]
  const nextLocation = currentReq.nextLocation
  const currentAU = totalDamageDealt / AU_TO_DAMAGE
  const targetAU = currentReq.targetAU
  const percentage = Math.min(100, (currentAU / targetAU) * 100)
  
  const progressBar = document.getElementById("progressBar")
  const progressText = document.getElementById("progressText")
  
  if (progressBar) progressBar.style.width = percentage + '%'
  if (progressText) progressText.textContent = `Прогресс: ${currentAU.toFixed(5)} / ${targetAU.toFixed(5)} а.е. (${percentage.toFixed(1)}%)`
}

/**
 * Проверка возможности перехода на следующую локацию
 */
export function checkLocationUpgrade() {
  const currentReq = LOCATION_REQUIREMENTS[currentLocation]
  const nextLocation = currentReq.nextLocation
  const currentAU = totalDamageDealt / AU_TO_DAMAGE
  const targetAU = currentReq.targetAU
  
  if (nextLocation && currentAU >= targetAU) {
    if (nextLocation === 'jupiter') {
      showDevelopmentScreen()
      return
    }
    setLocation(nextLocation)
    showTooltip(`Открыта локация: ${locations[nextLocation].name}!`)
    setTimeout(hideTooltip, 3000)
  }
  updateProgressBar()
}

/**
 * Показать экран разработки
 */
function showDevelopmentScreen() {
  const developmentScreen = document.getElementById("developmentScreen")
  if (developmentScreen) {
    developmentScreen.style.display = "flex"
    gameActive = false
  }
}

/**
 * Установить текущую локацию
 * @param {string} loc - название локации
 */
export function setLocation(loc) {
  currentLocation = loc
  const theme = locations[loc]
  const gameTitle = document.getElementById("gameTitle")
  const header = document.getElementById("header")
  
  if (gameTitle) gameTitle.textContent = theme.name
  if (header) header.style.borderColor = theme.borderColor
  
  // Обновление планетарного фона
  if (window.planetBackground) {
    window.planetBackground.setPlanet(loc)
  }
  
  const levelAnnounce = document.getElementById("levelAnnounce")
  if (levelAnnounce) {
    levelAnnounce.textContent = theme.name
    levelAnnounce.style.color = theme.color
    levelAnnounce.style.opacity = "1"
    setTimeout(() => {
      levelAnnounce.style.opacity = "0"
    }, 2000)
  }
  updateProgressBar()
}

/**
 * Обновить HUD с кристаллами
 */
export function updateCoins() {
  updateCoinsDisplay(coins)
}

/**
 * Обновить HUD
 */
export function updateHUD() {
  updateCoinsDisplay(coins)
  updateClickPowerDisplay(clickPower)
  updateCritChanceDisplay(critChance)
  updateCritMultiplierDisplay(critMultiplier)
}

/**
 * Начать новую игру
 * @param {boolean} reset - сбросить прогресс или загрузить сохранение
 */
export function startGame(reset = true) {
  if (reset) {
    // Полностью сбрасываем все параметры при начале новой игры
    coins = 0
    totalDamageDealt = 0
    currentLocation = 'mercury'
    clickPower = 1
    clickUpgradeLevel = 0
    helperUpgradeLevel = 0
    helperDamageBonus = 0.3
    critChance = 0.001
    critMultiplier = 2.0
    helperActive = false
    helperTimeLeft = 0
    bogoCoinBonus = 0
    critChanceUpgradeLevel = 0
    critMultiplierUpgradeLevel = 0
    
    // Очищаем сохранение при начале новой игры
    localStorage.removeItem('cosmicBlocksSave')
  } else {
    // Если не сбрасываем, пересчитываем урон по новой формуле
    clickPower = calculateClickPower()
    updateHUD()
    updateProgressBar()
  }
  
  // Очищаем все интервалы
  if (helperInterval) {
    clearInterval(helperInterval)
    helperInterval = null
  }
  if (helperElement && helperElement.parentNode) {
    document.body.removeChild(helperElement)
    helperElement = null
  }
  
  const gameArea = document.getElementById("gameArea")
  const welcomeScreen = document.getElementById("welcomeScreen")
  const saveScreen = document.getElementById("saveScreen")
  const developmentScreen = document.getElementById("developmentScreen")
  const gameOverScreen = document.getElementById("gameOverScreen")
  const dailyRewardsScreen = document.getElementById("dailyRewardsScreen")
  
  if (gameArea) gameArea.innerHTML = ""
  if (welcomeScreen) welcomeScreen.style.display = "none"
  if (saveScreen) saveScreen.style.display = "none"
  if (developmentScreen) developmentScreen.style.display = "none"
  if (gameOverScreen) gameOverScreen.style.display = "none"
  if (dailyRewardsScreen) dailyRewardsScreen.style.display = "none"
  
  gameActive = true
  comboCount = 0
  lastDestroyTime = 0
  gameMetrics.startTime = Date.now()
  gameMetrics.blocksDestroyed = 0
  gameMetrics.upgradesBought = 0
  gameMetrics.totalClicks = 0
  
  updateCoins()
  updateHUD()
  updateProgressBar()
  setLocation(currentLocation)
  
  setTimeout(() => {
    if (gameActive) createMovingBlock()
  }, 500)
}

/**
 * Продолжить игру из сохранения
 */
export function continueGame() {
  if (loadGame()) {
    startGame(false) // Не сбрасываем параметры
  } else {
    showTooltip("Нет сохраненной игры!")
    setTimeout(hideTooltip, 2000)
  }
}

/**
 * Перезапустить игру
 */
export function restartGame() {
  startGame(true) // Полностью сбрасываем игру
}

/**
 * Завершить игру
 * @param {string|null} customMessage - кастомное сообщение при завершении
 */
export function gameOver(customMessage = null) {
  gameActive = false
  helperActive = false
  
  // Очищаем все интервалы
  if (helperInterval) {
    clearInterval(helperInterval)
    helperInterval = null
  }
  if (helperElement && helperElement.parentNode) {
    document.body.removeChild(helperElement)
    helperElement = null
  }
  
  const sessionTime = Date.now() - gameMetrics.startTime
  console.log('🎮 [Космический Кликер] Сессия завершена:', {
    session: gameMetrics.sessions,
    duration_sec: Math.round(sessionTime / 1000),
    total_damage: totalDamageDealt,
    current_location: currentLocation,
    total_coins: coins,
    blocks_destroyed: gameMetrics.blocksDestroyed,
    upgrades_bought: gameMetrics.upgradesBought,
    total_clicks: gameMetrics.totalClicks
  })
  
  localStorage.setItem('gameSessions', gameMetrics.sessions.toString())
  
  if (currentBlock && document.getElementById("gameArea").contains(currentBlock)) {
    document.getElementById("gameArea").removeChild(currentBlock)
    currentBlock = null
  }
  
  const finalScoreDisplay = document.getElementById("finalScore")
  const gameOverScreen = document.getElementById("gameOverScreen")
  
  if (finalScoreDisplay) {
    finalScoreDisplay.textContent = `Всего урона: ${Math.floor(totalDamageDealt).toLocaleString()}`
  }
  if (gameOverScreen) {
    gameOverScreen.style.display = "flex"
  }
  
  if (customMessage) {
    const h2 = gameOverScreen.querySelector('h2')
    if (h2) h2.textContent = customMessage
  }
}

/**
 * Поделиться результатом игры
 */
export function shareResult() {
  const shareText = `🎮 Я нанес ${Math.floor(totalDamageDealt).toLocaleString()} урона и собрал ${Math.floor(coins)} Кристаллов в Космическом Кликере! 🌌
Сможешь побить мой рекорд?`
  
  if (navigator.share) {
    navigator.share({
      title: 'Мой рекорд в Космическом Кликере!',
      text: shareText
    }).then(() => {
      coins += 50
      updateCoins()
      updateHUD()
      showTooltip('+50 Кристаллов за распространение!')
      setTimeout(hideTooltip, 2000)
      saveGame()
    })
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Результат скопирован! Поделись с друзьями!')
      coins += 50
      updateCoins()
      updateHUD()
      saveGame()
    })
  }
}
