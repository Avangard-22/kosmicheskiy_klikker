/**
 * Точка входа в приложение
 * Импортирует все модули и инициализирует игру
 */
import { initPlanetBackground, planetBackground } from './engine.js'
import {
  startGame,
  continueGame,
  restartGame,
  gameOver,
  shareResult,
  updateCoins,
  updateHUD,
  updateProgressBar,
  setLocation,
  initializeGame
} from './gameLogic.js'
import { setupUIEventListeners } from './ui.js'
import { initAudio } from './audio.js'
import { loadGameMetrics, updateContinueButton } from './storage.js'

// Инициализация игры при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
  // Инициализация аудио
  initAudio()
  
  // Инициализация планетарного фона
  initPlanetBackground()
  
  // Инициализация игры
  initializeGame()
  
  // Настройка обработчиков событий UI
  setupUIEventListeners({
    startGame,
    continueGame,
    restartGame
  })
  
  // Слушатель событий для изменения размера окна
  window.addEventListener('resize', function() {
    planetBackground.setCanvasSize()
  })
  
  // Блокировка жестов масштабирования и выделения
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }, { passive: false })
  
  document.addEventListener('gesturestart', function(e) {
    e.preventDefault()
  }, { passive: false })
  
  document.addEventListener('gesturechange', function(e) {
    e.preventDefault()
  }, { passive: false })
  
  document.addEventListener('gestureend', function(e) {
    e.preventDefault()
  }, { passive: false })
  
  console.log('🎮 [Космический Кликер] Игра успешно инициализирована')
})
