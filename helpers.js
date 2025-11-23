/**
 * Модуль помощников игры
 * Отвечает за логику работы помощника Bobo и связанных эффектов
 */

import {
  clickPower,
  helperDamageBonus,
  helperUpgradeLevel,
  helperActive,
  gameActive,
  currentBlock,
  currentBlockHealth,
  totalDamageDealt,
  gameMetrics,
  bogoCoinBonus,
  coins
} from './gameLogic.js'
import { createDamageText } from './ui.js'
import { playSound } from './audio.js'

let helperElement = null
let helperPosition = { x: 0, y: 0 }
let helperInterval = null
let helperTimeLeft = 0
const helperDuration = 60000

/**
 * Переместить помощника в случайную позицию
 */
export function moveHelperToRandomPosition() {
  if (!helperElement) return
  
  // Получаем позицию текущего блока
  let blockRect = { left: window.innerWidth/2, top: window.innerHeight/2 }
  if (currentBlock) {
    blockRect = currentBlock.getBoundingClientRect()
  }
  
  // Находим позицию вдали от блока
  let attempts = 0
  let validPosition = false
  const safeDistance = 150
  
  while (!validPosition && attempts < 20) {
    attempts++
    // Генерируем случайную позицию
    const randomX = Math.random() * (window.innerWidth - 60) + 30
    const randomY = Math.random() * (window.innerHeight - 120) + 60 // Избегаем верхней части с UI
    
    // Проверяем расстояние от блока
    const distance = Math.sqrt(
      Math.pow(randomX - (blockRect.left + blockRect.width/2), 2) + 
      Math.pow(randomY - (blockRect.top + blockRect.height/2), 2)
    )
    
    // Проверяем, что позиция не слишком близко к краям и не перекрывает UI
    const safeFromEdges = randomX > 60 && randomX < window.innerWidth - 60 && 
                        randomY > 100 && randomY < window.innerHeight - 60
    
    if (distance > safeDistance && safeFromEdges) {
      helperPosition = { x: randomX, y: randomY }
      validPosition = true
    }
  }
  
  // Если не нашли хорошую позицию, используем последнюю или центральную
  if (!validPosition) {
    helperPosition = {
      x: window.innerWidth * 0.7,
      y: window.innerHeight * 0.7
    }
  }
  
  // Устанавливаем позицию
  helperElement.style.left = helperPosition.x + 'px'
  helperElement.style.top = helperPosition.y + 'px'
}

/**
 * Создать элемент помощника
 */
export function createHelperElement() {
  if (helperElement && helperElement.parentNode) {
    document.body.removeChild(helperElement)
  }
  
  helperElement = document.createElement('div')
  helperElement.className = 'helper'
  document.body.appendChild(helperElement)
  moveHelperToRandomPosition()
  
  // Добавляем плавное появление
  helperElement.style.opacity = '0'
  setTimeout(() => {
    if (helperElement) helperElement.style.opacity = '1'
  }, 100)
}

/**
 * Активировать помощника Bobo
 */
export function activateHelper() {
  if (helperActive) return
  
  helperActive = true
  helperTimeLeft = helperDuration
  bogoCoinBonus = 0.2 // +20% к кристаллам
  
  // Создаем элемент помощника
  createHelperElement()
  
  helperInterval = setInterval(() => {
    if (helperActive && currentBlock && gameActive) {
      helperAttack()
    }
  }, 1500)
  
  const helperTimer = setInterval(() => {
    if (!helperActive) {
      clearInterval(helperTimer)
      return
    }
    
    helperTimeLeft -= 1000
    if (helperTimeLeft <= 0) {
      helperActive = false
      clearInterval(helperInterval)
      clearInterval(helperTimer)
      bogoCoinBonus = 0 // Сбрасываем бонус к кристаллам
      
      // Плавное исчезание помощника
      if (helperElement) {
        helperElement.style.opacity = '0'
        setTimeout(() => {
          if (helperElement && helperElement.parentNode) {
            document.body.removeChild(helperElement)
            helperElement = null
          }
        }, 300)
      }
      
      // updateUpgradeButtons() будет вызвано из gameLogic.js
      showTooltip('Bobo закончил работу!')
      setTimeout(hideTooltip, 1500)
    }
  }, 1000)
  
  // updateUpgradeButtons() будет вызвано из gameLogic.js
  // updateHUD() будет вызвано из gameLogic.js
  showTooltip('Bobo активирован на 1 минуту!<br>Бонус к кристаллам: +20%')
  setTimeout(hideTooltip, 2500)
  
  // saveGame() будет вызвано из gameLogic.js
}

/**
 * Атака помощника
 */
export function helperAttack() {
  if (!currentBlock || !helperActive || !helperElement) return
  
  // Создаем визуальный эффект атаки
  createHelperEffect()
  
  const baseHelperDmg = clickPower * (1 + helperDamageBonus)
  const upgradedHelperDmg = baseHelperDmg * (1 + helperUpgradeLevel * 0.2)
  
  currentBlockHealth -= upgradedHelperDmg
  totalDamageDealt += upgradedHelperDmg
  gameMetrics.totalClicks++
  
  createDamageText(Math.round(upgradedHelperDmg), currentBlock, '#69f0ae')
  // checkLocationUpgrade() будет вызвано из gameLogic.js
  
  if (currentBlockHealth <= 0) {
    // destroyBlock() будет вызвано из gameLogic.js
  } else {
    currentBlock.textContent = Math.floor(currentBlockHealth)
    // updateCracks() будет вызвано из gameLogic.js
  }
}

/**
 * Создать эффект атаки помощника
 */
export function createHelperEffect() {
  if (!currentBlock || !helperElement) return
  
  const blockRect = currentBlock.getBoundingClientRect()
  const helperRect = helperElement.getBoundingClientRect()
  
  const beam = document.createElement('div')
  beam.className = 'helper-beam'
  beam.style.left = helperRect.left + 15 + 'px'
  beam.style.top = helperRect.top + 30 + 'px'
  beam.style.width = '2px'
  beam.style.height = '0'
  document.body.appendChild(beam)
  
  // Анимация луча
  const animateBeam = () => {
    const currentHeight = parseInt(beam.style.height) || 0
    const targetHeight = blockRect.top - (helperRect.top + 30)
    
    if (currentHeight < targetHeight) {
      beam.style.height = (currentHeight + 5) + 'px'
      requestAnimationFrame(animateBeam)
    } else {
      // Эффект попадания
      const hitEffect = document.createElement('div')
      hitEffect.style.position = 'absolute'
      hitEffect.style.left = blockRect.left + blockRect.width/2 + 'px'
      hitEffect.style.top = blockRect.top + 'px'
      hitEffect.style.width = '20px'
      hitEffect.style.height = '20px'
      hitEffect.style.background = 'radial-gradient(circle, #69f0ae, transparent)'
      hitEffect.style.borderRadius = '50%'
      hitEffect.style.zIndex = '15'
      hitEffect.style.opacity = '0.8'
      document.body.appendChild(hitEffect)
      
      // Затухание эффекта
      let opacity = 0.8
      const fadeOut = setInterval(() => {
        opacity -= 0.1
        hitEffect.style.opacity = opacity
        if (opacity <= 0) {
          clearInterval(fadeOut)
          if (hitEffect.parentNode) document.body.removeChild(hitEffect)
        }
      }, 30)
      
      // Удаляем луч
      setTimeout(() => {
        if (beam.parentNode) document.body.removeChild(beam)
      }, 300)
    }
  }
  
  requestAnimationFrame(animateBeam)
}
