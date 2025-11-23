/**
 * Модуль констант
 * Содержит все настройки, параметры баланса и конфигурации игры
 */

// Параметры планет
export const PLANET_DATA = {
  mercury: {
    name: 'Меркурий',
    colors: ['#8c7b6b', '#a69b8f', '#5a524c', '#ffaa33', '#ffcc66', '#d9b382', '#bf9e75'],
    background: ['#1a0f0a', '#2c1d14', '#4a3527'],
    type: 'rocky'
  },
  venus: {
    name: 'Венера',
    colors: ['#e6b87e', '#d4a574', '#ff8844', '#b35900', '#ff9966', '#e68a53', '#cc7a3d'],
    background: ['#2a1a0f', '#4a2c1a', '#6b3f20'],
    type: 'cloudy'
  },
  earth: {
    name: 'Земля',
    colors: ['#4a7b9d', '#5d8aa8', '#2e5a78', '#87ceeb', '#a8d5e5', '#6baed6', '#3c8dbc'],
    background: ['#0a1a2a', '#1a2a3a', '#2a3a4a'],
    type: 'oceanic'
  },
  mars: {
    name: 'Марс',
    colors: ['#cd5c5c', '#a52a2a', '#8b4513', '#ff6347', '#e2583e', '#c14533', '#a33226'],
    background: ['#2a0f0a', '#4a1a14', '#6b251e'],
    type: 'dusty'
  },
  jupiter: {
    name: 'Юпитер',
    colors: ['#d2b48c', '#bc8f8f', '#a0522d', '#ff7f50', '#e67347', '#cc663d', '#b35933'],
    background: ['#2a1f14', '#4a3728', '#6b4f3c'],
    type: 'stormy'
  },
  saturn: {
    name: 'Сатурн',
    colors: ['#f0e68c', '#daa520', '#b8860b', '#ffd700', '#e6c347', '#ccaa3d', '#b39233'],
    background: ['#2a2414', '#4a3c28', '#6b543c'],
    type: 'ringed'
  },
  uranus: {
    name: 'Уран',
    colors: ['#afeeee', '#7fffd4', '#40e0d0', '#48d1cc', '#3dc4bf', '#32b7b2', '#27aaa5'],
    background: ['#0a1a2a', '#1a2a3a', '#2a3a4a'],
    type: 'icy'
  },
  neptune: {
    name: 'Нептун',
    colors: ['#4169e1', '#0000cd', '#191970', '#1e90ff', '#1a7feb', '#166fd7', '#125fc3'],
    background: ['#0a0a2a', '#1a1a3a', '#2a2a4a'],
    type: 'windy'
  },
  pluto: {
    name: 'Плутон',
    colors: ['#a9a9a9', '#696969', '#808080', '#d3d3d3', '#c0c0c0', '#b0b0b0', '#9e9e9e'],
    background: ['#1a1a2a', '#2a2a3a', '#3a3a4a'],
    type: 'dwarf'
  }
}

// Скорости блоков
export const BLOCK_SPEED_MOBILE = 25
export const BLOCK_SPEED_DESKTOP = 20

// Стоимость улучшений
export const BASE_CLICK_UPGRADE_COST = 80
export const BASE_HELPER_UPGRADE_COST = 1500
export const BASE_CRIT_CHANCE_COST = 500
export const BASE_CRIT_MULTIPLIER_COST = 800
export const BASE_HELPER_DMG_COST = 1000

// Редкие блоки
export const RARE_BLOCKS = {
  GOLD: {
    name: "Золотой",
    chance: 0.03,
    multiplier: 8,
    healthMultiplier: 1.8,
    effect: "Мгновенный бонус",
    className: "block-gold"
  },
  RAINBOW: {
    name: "Радужный", 
    chance: 0.02,
    multiplier: 5,
    healthMultiplier: 1.5,
    effect: "Увеличение силы",
    className: "block-rainbow"
  },
  CRYSTAL: {
    name: "Кристальный",
    chance: 0.025,
    multiplier: 6,
    healthMultiplier: 1.6,
    effect: "Время помощника",
    className: "block-crystal"
  },
  MYSTERY: {
    name: "Загадочный",
    chance: 0.015,
    multiplier: 10,
    healthMultiplier: 2.0,
    effect: "Случайный бонус",
    className: "block-mystery"
  }
}

// Баланс игры
export const BALANCE_CONFIG = {
  baseHealth: 80,
  targetClicks: 70,
  healthRandomRange: { min: 0.8, max: 1.3 },
  damageProgression: {
    baseMultiplier: 1.15,
    diminishingReturns: 0.96,
    maxLevelEffect: 60
  },
  rewardMultiplier: 2.5,
  comboMultiplier: 0.25,
  randomBonusRange: { min: 0.8, max: 1.5 }
}

// Астрономические единицы
export const ASTRONOMICAL_UNITS = {
  mercury: 0.38710,
  venus: 0.72333,
  earth: 1.00000,
  mars: 1.52366,
  jupiter: 5.20336,
  saturn: 9.53707,
  uranus: 19.19126,
  neptune: 30.06896,
  pluto: 39.48200
}

// Конвертация астрономических единиц в урон
export const AU_TO_DAMAGE = 149597870.691

// Требования локаций
export const LOCATION_REQUIREMENTS = {
  mercury: { 
    damageRequired: 0, 
    targetAU: ASTRONOMICAL_UNITS.mercury,
    nextLocation: 'venus'
  },
  venus: { 
    damageRequired: 0, 
    targetAU: ASTRONOMICAL_UNITS.venus,
    nextLocation: 'earth'
  },
  earth: { 
    damageRequired: 0, 
    targetAU: ASTRONOMICAL_UNITS.earth,
    nextLocation: 'mars'
  },
  mars: { 
    damageRequired: 0, 
    targetAU: ASTRONOMICAL_UNITS.mars,
    nextLocation: 'jupiter'
  },
  jupiter: { 
    damageRequired: 0, 
    targetAU: ASTRONOMICAL_UNITS.jupiter,
    nextLocation: 'saturn'
  },
  saturn: { 
    damageRequired: 0, 
    targetAU: ASTRONOMICAL_UNITS.saturn,
    nextLocation: 'uranus'
  },
  uranus: { 
    damageRequired: 0, 
    targetAU: ASTRONOMICAL_UNITS.uranus,
    nextLocation: 'neptune'
  },
  neptune: { 
    damageRequired: 0, 
    targetAU: ASTRONOMICAL_UNITS.neptune,
    nextLocation: 'pluto'
  },
  pluto: { 
    damageRequired: 0, 
    targetAU: ASTRONOMICAL_UNITS.pluto,
    nextLocation: null
  }
}

// Ежедневные награды
export const DAILY_REWARDS = [
  { day: 1, reward: 1000, type: "coins" },
  { day: 2, reward: 1, type: "clickPower" },
  { day: 3, reward: 2000, type: "coins" },
  { day: 4, reward: 0.001, type: "critChance" },
  { day: 5, reward: 3000, type: "coins" },
  { day: 6, reward: 0.1, type: "critMultiplier" },
  { day: 7, reward: 5000, type: "coins" },
  { day: 8, reward: 2, type: "clickPower" },
  { day: 9, reward: 4000, type: "coins" },
  { day: 10, reward: 0.001, type: "critChance" },
  { day: 11, reward: 6000, type: "coins" },
  { day: 12, reward: 0.1, type: "critMultiplier" },
  { day: 13, reward: 7000, type: "coins" },
  { day: 14, reward: 3, type: "clickPower" },
  { day: 15, reward: 10000, type: "coins" },
  { day: 16, reward: 0.002, type: "critChance" },
  { day: 17, reward: 8000, type: "coins" },
  { day: 18, reward: 0.2, type: "critMultiplier" },
  { day: 19, reward: 9000, type: "coins" },
  { day: 20, reward: 4, type: "clickPower" },
  { day: 21, reward: 12000, type: "coins" },
  { day: 22, reward: 0.003, type: "critChance" },
  { day: 23, reward: 15000, type: "coins" },
  { day: 24, reward: 0.3, type: "critMultiplier" },
  { day: 25, reward: 18000, type: "coins" },
  { day: 26, reward: 5, type: "clickPower" },
  { day: 27, reward: 20000, type: "coins" },
  { day: 28, reward: 0.004, type: "critChance" },
  { day: 29, reward: 25000, type: "coins" },
  { day: 30, reward: 10, type: "clickPower" }
]

// Палитра цветов для локаций
export const LOCATIONS = {
  mercury: { 
    name: "☿ Меркурий", 
    color: "#bb86fc", 
    coinColor: "#a0d2ff", 
    borderColor: "#4a55e0", 
    blockColors: ['#2962ff', '#4fc3f7', '#bb86fc', '#f8bbd0'] 
  },
  venus: { 
    name: "♀ Венера", 
    color: "#ffab91", 
    coinColor: "#a0d2ff", 
    borderColor: "#ff5722", 
    blockColors: ['#ff5722', '#ff9800', '#ff5722', '#e91e63'] 
  },
  earth: { 
    name: "♁ Земля", 
    color: "#80deea", 
    coinColor: "#a0d2ff", 
    borderColor: "#0288d1", 
    blockColors: ['#0288d1', '#29b6f6', '#00bcd4', '#00e5ff'] 
  },
  mars: { 
    name: "♂ Марс", 
    color: "#a5d6a7", 
    coinColor: "#a0d2ff", 
    borderColor: "#388e3c", 
    blockColors: ['#388e3c', '#66bb6a', '#9ccc65', '#d4e157'] 
  },
  jupiter: { 
    name: "♃ Юпитер", 
    color: "#ce93d8", 
    coinColor: "#a0d2ff", 
    borderColor: "#7b1fa2", 
    blockColors: ['#7b1fa2', '#9c27b0', '#ab47bc', '#e1bee7'] 
  },
  saturn: { 
    name: "♄ Сатурн", 
    color: "#ce93d8", 
    coinColor: "#a0d2ff", 
    borderColor: "#7b1fa2", 
    blockColors: ['#7b1fa2', '#9c27b0', '#ab47bc', '#e1bee7'] 
  },
  uranus: { 
    name: "♅ Уран", 
    color: "#ce93d8", 
    coinColor: "#a0d2ff", 
    borderColor: "#7b1fa2", 
    blockColors: ['#7b1fa2', '#9c27b0', '#ab47bc', '#e1bee7'] 
  },
  neptune: { 
    name: "♆ Нептун", 
    color: "#ce93d8", 
    coinColor: "#a0d2ff", 
    borderColor: "#7b1fa2", 
    blockColors: ['#7b1fa2', '#9c27b0', '#ab47bc', '#e1bee7'] 
  },
  pluto: { 
    name: "♇ Плутон", 
    color: "#ce93d8", 
    coinColor: "#a0d2ff", 
    borderColor: "#7b1fa2", 
    blockColors: ['#7b1fa2', '#9c27b0', '#ab47bc', '#e1bee7'] 
  }
}
