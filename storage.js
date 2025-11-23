/**
 * Модуль сохранения и загрузки данных игры
 * Отвечает за работу с localStorage и сохранение прогресса
 */

import { 
  coins,
  clickPower,
  clickUpgradeLevel,
  critChance,
  critMultiplier,
  helperDamageBonus,
  helperUpgradeLevel,
  totalDamageDealt,
  currentLocation,
  bogoCoinBonus,
  critChanceUpgradeLevel,
  critMultiplierUpgradeLevel,
  gameMetrics,
  updateContinueButton
} from './gameLogic.js'

// Максимальный возраст сохранения (30 дней)
const MAX_SAVE_AGE = 30 * 24 * 60 * 60 * 1000

/**
 * Сохранить игру в localStorage
 */
export function saveGame() {
  const saveData = {
    coins,
    clickPower,
    clickUpgradeLevel,
    critChance,
    critMultiplier,
    helperDamageBonus,
    helperUpgradeLevel,
    totalDamageDealt,
    currentLocation,
    bogoCoinBonus,
    gameActive: true,
    timestamp: Date.now(),
    currentDailyStreak: gameMetrics.currentDailyStreak,
    lastDailyClaim: gameMetrics.lastDailyClaim,
    dailyCycleStarted: gameMetrics.dailyCycleStarted,
    // Добавляем новые переменные в сохранение
    critChanceUpgradeLevel,
    critMultiplierUpgradeLevel
  }
  
  localStorage.setItem('cosmicBlocksSave', JSON.stringify(saveData))
}

/**
 * Загрузить игру из localStorage
 * @returns {boolean} успешно ли загружена игра
 */
export function loadGame() {
  const saved = localStorage.getItem('cosmicBlocksSave')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      const saveAge = Date.now() - (data.timestamp || 0)
      
      if (saveAge < MAX_SAVE_AGE) {
        coins = data.coins || 0
        clickPower = data.clickPower || 1
        clickUpgradeLevel = data.clickUpgradeLevel || 0
        critChance = data.critChance || 0.001
        critMultiplier = data.critMultiplier || 2.0
        helperDamageBonus = data.helperDamageBonus || 0.3
        helperUpgradeLevel = data.helperUpgradeLevel || 0
        totalDamageDealt = data.totalDamageDealt || 0
        currentLocation = data.currentLocation || 'mercury'
        bogoCoinBonus = data.bogoCoinBonus || 0
        
        // Загружаем данные ежедневных наград
        gameMetrics.currentDailyStreak = data.currentDailyStreak || 0
        gameMetrics.lastDailyClaim = data.lastDailyClaim || 0
        gameMetrics.dailyCycleStarted = data.dailyCycleStarted || Date.now()
        
        // Загружаем новые переменные с обратной совместимостью
        critChanceUpgradeLevel = data.critChanceUpgradeLevel || Math.round((critChance - 0.001) / 0.001)
        critMultiplierUpgradeLevel = data.critMultiplierUpgradeLevel || Math.round((critMultiplier - 2.0) / 0.2)
        
        return true
      } else {
        console.log('Сохранение устарело')
        localStorage.removeItem('cosmicBlocksSave')
      }
    } catch (e) {
      console.warn('Ошибка загрузки сохранения', e)
    }
  }
  return false
}

/**
 * Сохранить метрики игры
 */
export function saveGameMetrics() {
  localStorage.setItem('gameMetrics', JSON.stringify({
    blocksDestroyed: gameMetrics.blocksDestroyed,
    upgradesBought: gameMetrics.upgradesBought,
    totalClicks: gameMetrics.totalClicks,
    sessions: gameMetrics.sessions,
    currentDailyStreak: gameMetrics.currentDailyStreak,
    lastDailyClaim: gameMetrics.lastDailyClaim,
    dailyCycleStarted: gameMetrics.dailyCycleStarted,
    startTime: gameMetrics.startTime
  }))
}

/**
 * Загрузить метрики игры
 * @returns {boolean} успешно ли загружены метрики
 */
export function loadGameMetrics() {
  const saved = localStorage.getItem('gameMetrics')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      gameMetrics = {
        startTime: data.startTime || Date.now(),
        blocksDestroyed: data.blocksDestroyed || 0,
        upgradesBought: data.upgradesBought || 0,
        totalClicks: data.totalClicks || 0,
        sessions: (data.sessions || 0) + 1,
        currentDailyStreak: data.currentDailyStreak || 0,
        lastDailyClaim: data.lastDailyClaim || 0,
        dailyCycleStarted: data.dailyCycleStarted || Date.now()
      }
      saveGameMetrics()
      return true
    } catch (e) {
      console.warn('Ошибка загрузки метрик', e)
    }
  }
  return false
}

/**
 * Обновить состояние кнопки продолжения
 */
export function updateContinueButton() {
  const continueBtn = document.getElementById('continueBtn')
  if (continueBtn) {
    const hasSave = localStorage.getItem('cosmicBlocksSave') !== null
    if (hasSave) {
      continueBtn.className = 'btn save-available'
      continueBtn.textContent = 'Продолжить'
    } else {
      continueBtn.className = 'btn no-save'
      continueBtn.textContent = 'Нет сохранения'
    }
  }
}
