/**
 * Модуль движка отрисовки
 * Отвечает за визуальную часть игры: фон, анимации, частицы
 */

import { PLANET_DATA } from './constants.js'

// Переменные для анимации
let animationId = null
let currentPlanet = 'mercury'
let time = 0
let particles = []
let specialElements = []
let nebulae = []
let stars = []
const ctx = document.getElementById('planetBackgroundCanvas').getContext('2d')
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

// Настройки параллакса
const PARALLAX_SETTINGS = {
  baseSpeed: 0.2,
  directionX: -1, // Движение из правой части в левую
  directionY: 1,  // Движение из верхней части в нижнюю
  layers: {
    stars: 0.3,    // Самый медленный слой
    nebulae: 0.5,  // Средняя скорость
    particles: 0.8, // Быстрый слой
    special: 1.0   // Самый быстрый слой
  }
}

// Исправленные настройки
const FIXED_SETTINGS = {
  speed: 5,
  density: 5,
  size: 5,
  smoothness: 5,
  nebulaIntensity: 3,
  starDensity: 2
}

/**
 * Класс для частиц с поддержкой параллакса
 */
class Particle {
  /**
   * @param {number} x - координата X
   * @param {number} y - координата Y
   * @param {number} radius - радиус частицы
   * @param {string} color - цвет частицы
   * @param {Object} velocity - объект скорости {x, y}
   * @param {string} type - тип частицы
   * @param {number} parallaxFactor - фактор параллакса
   */
  constructor(x, y, radius, color, velocity, type, parallaxFactor = 1) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
    this.type = type
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 0.02
    this.pulse = Math.random() * Math.PI * 2
    this.twinkle = Math.random() * Math.PI * 2
    this.twinkleSpeed = 0.05 + Math.random() * 0.05
    this.lifetime = 1
    this.maxLifetime = 1
    this.parallaxFactor = parallaxFactor
  }

  /**
   * Отрисовка частицы
   */
  draw() {
    ctx.save()
    if (this.type === 'star') {
      const twinkleFactor = 0.7 + 0.3 * Math.sin(this.twinkle)
      ctx.globalAlpha = this.alpha * twinkleFactor * this.lifetime
    } else if (this.type === 'ice') {
      ctx.globalAlpha = this.alpha * this.lifetime
      ctx.translate(this.x, this.y)
      ctx.rotate(this.rotation)
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const x = Math.cos(angle) * this.radius
        const y = Math.sin(angle) * this.radius
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.fillStyle = this.color
      ctx.fill()
      ctx.restore()
      return
    } else {
      ctx.globalAlpha = this.alpha * this.lifetime
    }
    ctx.translate(this.x, this.y)
    if (this.type === 'ring') {
      ctx.rotate(this.rotation)
      ctx.beginPath()
      ctx.ellipse(0, 0, this.radius, this.radius/3, 0, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()
    } else if (this.type === 'nebula') {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius)
      gradient.addColorStop(0, this.color + 'aa')
      gradient.addColorStop(1, this.color + '00')
      ctx.beginPath()
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    } else if (this.type === 'crystal') {
      ctx.rotate(this.rotation)
      ctx.beginPath()
      ctx.moveTo(0, -this.radius)
      ctx.lineTo(this.radius/2, 0)
      ctx.lineTo(0, this.radius)
      ctx.lineTo(-this.radius/2, 0)
      ctx.closePath()
      ctx.fillStyle = this.color
      ctx.fill()
    } else {
      const pulseFactor = 0.8 + 0.2 * Math.sin(this.pulse)
      ctx.beginPath()
      ctx.arc(0, 0, this.radius * pulseFactor, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()
    }
    ctx.restore()
  }

  /**
   * Обновление позиции и состояния частицы
   */
  update() {
    this.draw()
    // Движение параллакса
    const parallaxSpeed = PARALLAX_SETTINGS.baseSpeed * this.parallaxFactor
    this.x += PARALLAX_SETTINGS.directionX * parallaxSpeed
    this.y += PARALLAX_SETTINGS.directionY * parallaxSpeed
    // Оригинальное движение частицы
    const smoothFactor = FIXED_SETTINGS.smoothness / 10
    this.velocity.x *= (1 - smoothFactor * 0.05)
    this.velocity.y *= (1 - smoothFactor * 0.05)
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.rotation += this.rotationSpeed
    this.pulse += 0.05
    this.twinkle += this.twinkleSpeed
    // Teleport-ация при выходе за границы
    if (this.x < -this.radius * 2) {
      this.x = ctx.canvas.width + this.radius
    } else if (this.x > ctx.canvas.width + this.radius * 2) {
      this.x = -this.radius
    }
    if (this.y < -this.radius * 2) {
      this.y = ctx.canvas.height + this.radius
    } else if (this.y > ctx.canvas.height + this.radius * 2) {
      this.y = -this.radius
    }
  }
}

/**
 * Установка размеров canvas
 */
function setCanvasSize() {
  const canvas = document.getElementById('planetBackgroundCanvas')
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  // Оптимизация для мобильных устройств
  if (isMobile) {
    const pixelRatio = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * pixelRatio
    canvas.height = canvas.offsetHeight * pixelRatio
    ctx.scale(pixelRatio, pixelRatio)
  }
}

/**
 * Функция для рисования градиентного фона
 */
function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height)
  const bgColors = PLANET_DATA[currentPlanet].background
  gradient.addColorStop(0, bgColors[0])
  gradient.addColorStop(0.5, bgColors[1])
  gradient.addColorStop(1, bgColors[2])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

/**
 * Генерация звезд с параллаксом
 */
function generateStars() {
  const starCount = FIXED_SETTINGS.starDensity * 50
  stars = []
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * ctx.canvas.width
    const y = Math.random() * ctx.canvas.height
    const radius = Math.random() * 1.5 + 0.5
    const starColors = ['#ffffff', '#f8f8ff', '#e6e6fa', '#fffacd', '#f0f8ff']
    const color = starColors[Math.floor(Math.random() * starColors.length)]
    const velocity = {
      x: 0,
      y: 0
    }
    stars.push(new Particle(x, y, radius, color, velocity, 'star', PARALLAX_SETTINGS.layers.stars))
  }
}

/**
 * Генерация туманностей с параллаксом
 */
function generateNebulae() {
  const nebulaCount = FIXED_SETTINGS.nebulaIntensity
  nebulae = []
  for (let i = 0; i < nebulaCount; i++) {
    const aspectRatio = ctx.canvas.width / ctx.canvas.height
    const x = Math.random() * ctx.canvas.width
    const y = Math.random() * ctx.canvas.height
    const radius = Math.random() * 200 + (aspectRatio > 1 ? 80 : 120)
    const planetColors = PLANET_DATA[currentPlanet].colors
    const color = planetColors[Math.floor(Math.random() * planetColors.length)]
    const velocity = {
      x: (Math.random() - 0.5) * 0.05,
      y: (Math.random() - 0.5) * 0.05
    }
    nebulae.push(new Particle(x, y, radius, color, velocity, 'nebula', PARALLAX_SETTINGS.layers.nebulae))
  }
}

// Функции генерации для каждой планеты
const planetGenerators = {
  mercury: generateMercury,
  venus: generateVenus,
  earth: generateEarth,
  mars: generateMars,
  jupiter: generateJupiter,
  saturn: generateSaturn,
  uranus: generateUranus,
  neptune: generateNeptune,
  pluto: generatePluto
}

/**
 * Генерация частиц для Меркурия
 */
function generateMercury() {
  const particleCount = FIXED_SETTINGS.density * 15
  particles = []
  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * ctx.canvas.width
    const y = Math.random() * ctx.canvas.height
    const radius = Math.random() * FIXED_SETTINGS.size * 2 + 1
    const color = PLANET_DATA.mercury.colors[Math.floor(Math.random() * PLANET_DATA.mercury.colors.length)]
    const speedValue = (Math.random() * 0.5 + 0.1) * FIXED_SETTINGS.speed / 5
    const angle = Math.random() * Math.PI * 2
    const velocity = {
      x: Math.cos(angle) * speedValue,
      y: Math.sin(angle) * speedValue
    }
    particles.push(new Particle(x, y, radius, color, velocity, 'rock', PARALLAX_SETTINGS.layers.particles))
  }
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * ctx.canvas.width
    const y = Math.random() * ctx.canvas.height
    const radius = Math.random() * 20 + 10
    const color = PLANET_DATA.mercury.colors[3]
    const velocity = {
      x: 0,
      y: 0
    }
    specialElements.push(new Particle(x, y, radius, color, velocity, 'sun', PARALLAX_SETTINGS.layers.special))
  }
}

// Аналогичные функции для других планет (venus, earth, mars, jupiter, saturn, uranus, neptune, pluto)
// ...

/**
 * Анимация частиц
 */
function animateParticles() {
  drawBackground()
  nebulae.forEach(nebula => nebula.update())
  stars.forEach(star => star.update())
  particles.forEach(particle => particle.update())
  specialElements.forEach(element => element.update())
}

/**
 * Основная функция анимации
 */
function animate() {
  time += 0.01
  animateParticles()
  animationId = requestAnimationFrame(animate)
}

/**
 * Генерация фона для выбранной планеты
 * @param {string} planet - название планеты
 */
function generatePlanetBackground(planet) {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  currentPlanet = planet
  particles = []
  specialElements = []
  nebulae = []
  stars = []
  
  generateStars()
  generateNebulae()
  
  if (planetGenerators[planet]) {
    planetGenerators[planet]()
  } else {
    console.warn(`Генератор для планеты ${planet} не найден, используется Меркурий`)
    planetGenerators.mercury()
  }
  
  animate()
}

/**
 * Инициализация планетарного фона
 */
function initPlanetBackground() {
  setCanvasSize()
  generatePlanetBackground('mercury')
  window.addEventListener('resize', setCanvasSize)
}

/**
 * Публичные методы для работы с планетарным фоном
 */
export const planetBackground = {
  setPlanet: generatePlanetBackground,
  setCanvasSize
}

export { initPlanetBackground }
