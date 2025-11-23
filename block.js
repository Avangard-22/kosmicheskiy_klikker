/**
 * Модуль для работы с блоками игры
 * Отвечает за генерацию, анимацию и взаимодействие с блоками
 */

import { 
  RARE_BLOCKS,
  BALANCE_CONFIG,
  getRareBlockType,
  announceRareBlock,
  createDamageText,
  checkLocationUpgrade,
  destroyBlock,
  updateCracks,
  showComboText,
  playSound,
  showRewardText,
  createExplosion,
  comboCount,
  lastDestroyTime,
  COMBO_TIME_WINDOW,
  locationRequirements,
  locations,
  gameMetrics,
  coins,
  clickPower,
  critChance,
  critMultiplier,
  bogoCoinBonus,
  currentBlockHealth,
  currentBlock,
  gameActive,
  totalDamageDealt,
  helperActive,
  helperAttack
} from './gameLogic.js'

/**
 * Класс для представления игрового блока
 */
export class Block {
  /**
   * @param {number} health - начальное здоровье блока
   * @param {string} type - тип блока (обычный, золотой, радужный и т.д.)
   * @param {HTMLElement} element - DOM элемент блока
   */
  constructor(health, type = 'normal', element = null) {
    this.health = health
    this.maxHealth = health
    this.type = type
    this.element = element
    this.isRare = type !== 'normal'
  }
  
  /**
   * Получить множитель награды для редкого блока
   * @returns {number} множитель награды
   */
  getRewardMultiplier() {
    if (!this.isRare || !RARE_BLOCKS[this.type.toUpperCase()]) return 1
    return RARE_BLOCKS[this.type.toUpperCase()].multiplier
  }
  
  /**
   * Получить множитель здоровья для редкого блока
   * @returns {number} множитель здоровья
   */
  getHealthMultiplier() {
    if (!this.isRare || !RARE_BLOCKS[this.type.toUpperCase()]) return 1
    return RARE_BLOCKS[this.type.toUpperCase()].healthMultiplier
  }
  
  /**
   * Применить урон к блоку
   * @param {number} damage - количество урона
   * @param {boolean} isCrit - является ли удар критическим
   * @returns {boolean} уничтожен ли блок
   */
  takeDamage(damage, isCrit = false) {
    this.health -= damage
    if (this.element) {
      this.element.textContent = Math.floor(this.health)
      updateCracks(this.element, this.health)
    }
    return this.health <= 0
  }
  
  /**
   * Уничтожить блок и получить награду
   * @returns {number} количество полученных кристаллов
   */
  destroy() {
    const now = Date.now()
    if (now - lastDestroyTime < COMBO_TIME_WINDOW) {
      comboCount++
    } else {
      comboCount = 1
    }
    lastDestroyTime = now
    
    const baseReward = 25 + (locationRequirements[currentLocation].targetAU * 100)
    let reward = Math.floor(baseReward * BALANCE_CONFIG.rewardMultiplier)
    const randomBonus = BALANCE_CONFIG.randomBonusRange.min + 
                       Math.random() * (BALANCE_CONFIG.randomBonusRange.max - BALANCE_CONFIG.randomBonusRange.min)
    reward = Math.floor(reward * randomBonus)
    
    // Применяем бонус от Bobo
    if (bogoCoinBonus > 0) {
      reward = Math.floor(reward * (1 + bogoCoinBonus))
    }
    
    // Применяем множитель для редкого блока
    if (this.isRare) {
      const rareBlock = RARE_BLOCKS[this.type.toUpperCase()]
      if (rareBlock) {
        reward = Math.floor(reward * rareBlock.multiplier)
      }
    }
    
    // Комбо-бонус
    if (comboCount > 1) {
      const comboBonus = Math.floor(reward * (comboCount * BALANCE_CONFIG.comboMultiplier))
      reward += comboBonus
      showComboText(comboCount, comboBonus, this.element)
      playSound('comboSound')
    }
    
    coins += reward
    gameMetrics.blocksDestroyed++
    
    playSound('breakSound')
    showRewardText(reward, this.element)
    createExplosion(this.element)
    
    return reward
  }
}

/**
 * Создание движущегося блока
 */
export function createMovingBlock() {
  if (currentBlock && document.getElementById("gameArea").contains(currentBlock)) {
    document.getElementById("gameArea").removeChild(currentBlock)
  }
  
  const blockHealth = calculateBlockHealth()
  currentBlockHealth = blockHealth
  
  const block = document.createElement("div")
  block.className = "moving-block"
  const size = getBlockSize()
  block.style.width = size + "px"
  block.style.height = size + "px"
  block.style.bottom = "0px"
  block.dataset.maxHealth = blockHealth
  
  const theme = locations[currentLocation]
  const colorIndex = Math.floor(Math.random() * theme.blockColors.length)
  
  let isRare = false
  let rareType = null
  const potentialRareType = getRareBlockType()
  
  if (potentialRareType) {
    isRare = true
    rareType = potentialRareType.toLowerCase()
    const rareBlock = RARE_BLOCKS[potentialRareType]
    block.classList.add(rareBlock.className)
    currentBlockHealth = Math.floor(currentBlockHealth * rareBlock.healthMultiplier)
    block.innerHTML = `🌟<div style="font-size: 0.35em; margin-top: 1px; line-height: 1.1;">${rareBlock.name}</div>`
    announceRareBlock(rareBlock.name)
  } else {
    block.style.background = `linear-gradient(135deg, ${theme.blockColors[colorIndex]}, ${theme.blockColors[(colorIndex + 1) % theme.blockColors.length]})`
    block.style.boxShadow = `0 0 15px ${theme.blockColors[colorIndex]}`
    block.style.border = `2px solid ${theme.borderColor}`
    block.textContent = blockHealth
  }
  
  const expectedClicks = getExpectedClicks(currentBlockHealth, clickPower)
  
  block.addEventListener('click', () => hitBlock(block, clickPower))
  block.addEventListener('touchstart', (e) => {
    e.preventDefault()
    hitBlock(block, clickPower)
  }, { passive: false })
  
  document.getElementById("gameArea").appendChild(block)
  currentBlock = block
  animateBlock(block)
  
  // Создаем объект Block для работы с логикой
  const gameBlock = new Block(currentBlockHealth, isRare ? rareType : 'normal', block)
  return gameBlock
}

/**
 * Получение размера блока в зависимости от локации
 * @returns {number} размер блока в пикселях
 */
export function getBlockSize() {
  const baseSize = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 80 : 60
  const locationIndex = Object.keys(locationRequirements).indexOf(currentLocation)
  if (locationIndex < 3) {
    return baseSize * 1.2
  }
  return baseSize * (1 + locationIndex * 0.15)
}

/**
 * Анимация движения блока
 * @param {HTMLElement} block - DOM элемент блока
 */
export function animateBlock(block) {
  if (!gameActive) return
  const speed = getCurrentSpeed()
  let position = parseInt(block.style.bottom) || 0
  
  function move() {
    if (!gameActive || currentBlock !== block) return
    position += speed / 30
    block.style.bottom = position + "px"
    
    if (position > window.innerHeight) {
      gameOver()
      return
    }
    
    requestAnimationFrame(move)
  }
  
  move()
}

/**
 * Удар по блоку
 * @param {HTMLElement} block - DOM элемент блока
 * @param {number} damage - базовый урон
 */
export function hitBlock(block, damage) {
  if (!gameActive) return
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }
  
  playSound('clickSound')
  block.style.transform = 'translateX(-50%) scale(0.85)'
  setTimeout(() => {
    block.style.transform = 'translateX(-50%) scale(1)'
  }, 100)
  
  let finalDamage = Math.round(damage)
  let isCrit = false
  if (Math.random() < critChance) {
    finalDamage = Math.round(damage * critMultiplier)
    isCrit = true
  }
  
  currentBlockHealth -= finalDamage
  totalDamageDealt += finalDamage
  gameMetrics.totalClicks++
  
  createDamageText(finalDamage, block, isCrit ? '#FFD700' : '#ff4444')
  checkLocationUpgrade()
  
  if (currentBlockHealth <= 0) {
    destroyBlock(block)
  } else {
    block.textContent = Math.floor(currentBlockHealth)
    updateCracks(block, currentBlockHealth)
  }
}

/**
 * Создание эффекта трещин на блоке
 * @param {HTMLElement} block - DOM элемент блока
 * @param {number} health - текущее здоровье
 */
export function updateCracks(block, health) {
  if (!block) return
  const existingCrack = block.querySelector('.crack-overlay')
  if (existingCrack) {
    block.removeChild(existingCrack)
  }
  const maxHealth = parseInt(block.dataset.maxHealth)
  const damageRatio = 1 - (health / maxHealth)
  if (damageRatio > 0.7) {
    addCracks(block, 'crack-3')
  } else if (damageRatio > 0.4) {
    addCracks(block, 'crack-2')
  } else if (damageRatio > 0.1) {
    addCracks(block, 'crack-1')
  }
}

/**
 * Добавление трещин на блок
 * @param {HTMLElement} block - DOM элемент блока
 * @param {string} crackLevel - уровень трещин (crack-1, crack-2, crack-3)
 */
export function addCracks(block, crackLevel) {
  const crackOverlay = document.createElement('div')
  crackOverlay.className = `crack-overlay ${crackLevel}`
  block.appendChild(crackOverlay)
}
