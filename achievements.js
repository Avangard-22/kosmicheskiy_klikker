document.addEventListener('DOMContentLoaded', function() {
    // Проверка наличия основных элементов игры
    if (!document.getElementById('saveBtn')) return;
    
    class AchievementsSystem {
        constructor() {
            this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            this.initAchievementsButton();
            this.createAchievementsModal();
            this.setupAchievements();
            this.loadAchievementsData();
            this.setupEventListeners();
            this.hookBoboActivation();
            this.setupMobileAdaptation();
            
            // Трекеры прогресса
            this.gameStats = {
                totalDamageDealt: 0,
                coins: 0,
                clickUpgradeLevel: 0,
                critChance: 0,
                critHitsCount: 0,
                blocksDestroyed: 0,
                rareBlocksTotal: 0,
                goldBlocksFound: 0,
                rainbowBlocksFound: 0,
                crystalBlocksFound: 0,
                mysteryBlocksFound: 0,
                maxCombo: 0,
                sessionCount: 0,
                // Сессионные трекеры
                currentSession: {
                    rareBlocksFound: [],
                    combo: 0,
                    maxComboInSession: 0
                }
            };
            
            this.loadGameStats();
        }
        
        setupMobileAdaptation() {
            this.checkOrientation();
            window.addEventListener('resize', () => this.checkOrientation());
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.checkOrientation(), 100);
            });
        }
        
        checkOrientation() {
            const modalContent = document.querySelector('#achievementsModal > div');
            if (!modalContent) return;
            
            if (this.isMobile) {
                const isLandscape = window.innerHeight < window.innerWidth;
                modalContent.style.maxWidth = isLandscape ? '90%' : '95%';
                modalContent.style.maxHeight = isLandscape ? '95vh' : '90vh';
                modalContent.style.padding = isLandscape ? '15px' : '12px';
            }
        }
        
        initAchievementsButton() {
            // Создаем кнопку достижений рядом с кнопками сохранения и магазина
            const achievementsBtn = document.createElement('button');
            achievementsBtn.id = 'achievementsBtn';
            achievementsBtn.innerHTML = '<i class="fas fa-trophy"></i>';
            achievementsBtn.title = this.getTranslation('achievementsButtonTitle');
            achievementsBtn.className = 'upgrade-btn';
            achievementsBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: ${this.isMobile ? '90px' : '105px'};
                width: ${this.isMobile ? '35px' : '40px'};
                height: ${this.isMobile ? '35px' : '40px'};
                border: none;
                border-radius: 8px;
                font-size: ${this.isMobile ? '1em' : '1.2em'};
                cursor: pointer;
                z-index: 30;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.5);
                color: #FFC107;
                transition: transform 0.1s;
                backdrop-filter: blur(4px);
            `;
            
            const shopBtn = document.getElementById('shopBtn');
            const saveBtn = document.getElementById('saveBtn');
            
            if (document.getElementById('hud-left')) {
                // Размещаем кнопку после существующих кнопок
                let insertAfter = saveBtn;
                if (shopBtn) insertAfter = shopBtn;
                
                if (insertAfter && insertAfter.parentNode) {
                    insertAfter.parentNode.insertBefore(achievementsBtn, insertAfter.nextSibling);
                }
            } else {
                // Если hud-left не существует, добавляем кнопку в body
                document.body.appendChild(achievementsBtn);
            }
            
            achievementsBtn.addEventListener('click', () => this.openAchievements());
            achievementsBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.openAchievements();
            }, { passive: false });
        }
        
        createAchievementsModal() {
            // Создаем модальное окно достижений с адаптивным дизайном
            const modal = document.createElement('div');
            modal.id = 'achievementsModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(10px);
                display: none;
                z-index: 2000;
                justify-content: center;
                align-items: center;
                padding: ${this.isMobile ? '10px' : '20px'};
                box-sizing: border-box;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border-radius: ${this.isMobile ? '12px' : '15px'};
                    width: 100%;
                    max-width: ${this.isMobile ? '95%' : '800px'};
                    max-height: ${this.isMobile ? '90vh' : '85vh'};
                    padding: ${this.isMobile ? '15px' : '20px'};
                    border: 2px solid #ffd700;
                    color: white;
                    position: relative;
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                ">
                    <span id="closeAchievementsBtn" style="
                        position: absolute;
                        top: ${this.isMobile ? '8px' : '10px'};
                        right: ${this.isMobile ? '10px' : '15px'};
                        font-size: ${this.isMobile ? '1.3em' : '1.5em'};
                        color: #aaa;
                        cursor: pointer;
                        z-index: 10;
                        width: ${this.isMobile ? '30px' : '35px'};
                        height: ${this.isMobile ? '30px' : '35px'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(244, 67, 54, 0.8);
                        border-radius: 50%;
                    ">&times;</span>
                    
                    <h2 style="
                        text-align: center;
                        color: #ffd700;
                        margin: ${this.isMobile ? '5px 0 15px 0' : '0 0 20px 0'};
                        font-size: ${this.isMobile ? '1.4em' : '1.8em'};
                        padding: ${this.isMobile ? '0 20px' : '0'};
                    ">
                        <i class="fas fa-trophy"></i> ${this.getTranslation('achievementsTitle')}
                    </h2>
                    
                    <div style="
                        text-align: center;
                        margin-bottom: ${this.isMobile ? '15px' : '20px'};
                        color: #a0d2ff;
                        font-size: ${this.isMobile ? '0.9em' : '1em'};
                        padding: 0 10px;
                    ">
                        <p>${this.getTranslation('achievementsDescription')}</p>
                        <p style="margin-top: 8px; color: #4CAF50; font-size: 0.9em;">
                            <i class="fas fa-star"></i> Всего очков: <span id="totalPoints">0</span>
                            <span style="margin: 0 10px;">•</span>
                            <i class="fas fa-gem"></i> Награды: <span id="totalRewards">0</span>
                        </p>
                    </div>
                    
                    <div id="achievementsGrid" style="
                        display: grid;
                        grid-template-columns: ${this.isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))'};
                        gap: ${this.isMobile ? '12px' : '15px'};
                        margin: ${this.isMobile ? '10px 0' : '20px 0'};
                        padding-bottom: 10px;
                    "></div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('closeAchievementsBtn').addEventListener('click', () => this.closeAchievements());
            document.getElementById('closeAchievementsBtn').addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.closeAchievements();
            }, { passive: false });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeAchievements();
            });
            
            // Блокировка жестов масштабирования в модальном окне
            modal.addEventListener('touchmove', (e) => {
                if (e.target === modal || e.target.closest('#achievementsModal > div')) {
                    e.stopPropagation();
                }
            }, { passive: false });
        }
        
       openAchievements() {
            document.getElementById('achievementsModal').style.display = 'flex';
            this.updateAchievementsUI();
            this.checkOrientation();
            this.updateStatsDisplay();
            
            // Пауза игры при открытии достижений
            this.pauseGame();
        }
        
        closeAchievements() {
            document.getElementById('achievementsModal').style.display = 'none';
            
            // Возобновление игры при закрытии достижений
            this.resumeGame();
        }
        
        // Функция для паузы игры
        pauseGame() {
            if (typeof window.gameActive !== 'undefined' && window.gameActive) {
                window.wasPaused = true;
                window.gameActive = false;
                
                // Пауза для помощника Bobo, если активен
                if (typeof window.helperActive !== 'undefined' && window.helperActive) {
                    // Сохраняем время, оставшееся у Bobo
                    if (typeof window.helperTimeLeft !== 'undefined') {
                        const remainingTime = window.helperTimeLeft;
                        clearInterval(window.helperInterval);
                        window.helperTimeLeft = remainingTime;
                    }
                }
                
                // Остановка всех движущихся блоков
                this.pauseAllBlocks();
            }
        }
        
        // Функция для возобновления игры
        resumeGame() {
            if (typeof window.wasPaused !== 'undefined' && window.wasPaused) {
                window.gameActive = true;
                window.wasPaused = false;
                
                // Возобновление работы Bobo, если был активен
                if (typeof window.helperActive !== 'undefined' && window.helperActive) {
                    // Возобновляем работу Bobo
                    window.helperInterval = setInterval(() => {
                        if (window.helperActive && window.currentBlock && window.gameActive) {
                            if (typeof window.helperAttack === 'function') {
                                window.helperAttack();
                            }
                        }
                    }, 1500);
                    
                    // Продолжаем таймер
                    const helperTimer = setInterval(() => {
                        if (!window.helperActive) {
                            clearInterval(helperTimer);
                            return;
                        }
                        if (typeof window.helperTimeLeft !== 'undefined') {
                            window.helperTimeLeft -= 1000;
                        }
                        if (typeof window.updateHelperTimer === 'function') {
                            window.updateHelperTimer();
                        }
                        if (typeof window.helperTimeLeft !== 'undefined' && window.helperTimeLeft <= 0) {
                            window.helperActive = false;
                            clearInterval(window.helperInterval);
                            clearInterval(helperTimer);
                            if (typeof window.updateHelperTimer === 'function') {
                                window.updateHelperTimer();
                            }
                            if (typeof window.updateUpgradeButtons === 'function') {
                                window.updateUpgradeButtons();
                            }
                            if (typeof window.showTooltip === 'function') {
                                window.showTooltip('Bobo закончил работу!');
                                setTimeout(window.hideTooltip, 1500);
                            }
                        }
                    }, 1000);
                }
                
                // Возобновление движения блоков
                this.resumeAllBlocks();
            }
        }
        
        // Пауза всех движущихся блоков
        pauseAllBlocks() {
            const blocks = document.querySelectorAll('.block');
            blocks.forEach(block => {
                block.dataset.pausedSpeed = block.style.animationDuration || '3s';
                block.style.animationPlayState = 'paused';
            });
        }
        
        // Возобновление движения блоков
        resumeAllBlocks() {
            const blocks = document.querySelectorAll('.block');
            blocks.forEach(block => {
                block.style.animationPlayState = 'running';
            });
        }
        
        setupAchievements() {
            // Полная система достижений из achievements_100.txt
            this.achievements = {
                // ============ УРОН ============
                damage_1k: {
                    name: { ru: "Первый урон", en: "First Damage", zh: "第一次伤害" },
                    description: { ru: "Нанести суммарно 1,000 урона", en: "Deal 1,000 total damage", zh: "累计造成1,000伤害" },
                    icon: "⚡",
                    category: "damage",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 1000,
                    unlocked: false,
                    reward: 25,
                    condition: "totalDamageDealt"
                },
                damage_10k: {
                    name: { ru: "Проверка системы", en: "System Check", zh: "系统检查" },
                    description: { ru: "Нанести 10,000 урона", en: "Deal 10,000 damage", zh: "造成10,000伤害" },
                    icon: "⚡",
                    category: "damage",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 10000,
                    unlocked: false,
                    reward: 50,
                    condition: "totalDamageDealt"
                },
                damage_100k: {
                    name: { ru: "Калибровка лазеров", en: "Laser Calibration", zh: "激光校准" },
                    description: { ru: "Нанести 100,000 урона", en: "Deal 100,000 damage", zh: "造成100,000伤害" },
                    icon: "🔫",
                    category: "damage",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 100000,
                    unlocked: false,
                    reward: 100,
                    condition: "totalDamageDealt"
                },
                damage_1m: {
                    name: { ru: "Тестовое уничтожение", en: "Test Destruction", zh: "测试破坏" },
                    description: { ru: "Нанести 1,000,000 урона", en: "Deal 1,000,000 damage", zh: "造成1,000,000伤害" },
                    icon: "💥",
                    category: "damage",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 1000000,
                    unlocked: false,
                    reward: 200,
                    condition: "totalDamageDealt"
                },
                damage_10m: {
                    name: { ru: "Разлом астероида", en: "Asteroid Crack", zh: "小行星裂缝" },
                    description: { ru: "Нанести 10,000,000 урона", en: "Deal 10,000,000 damage", zh: "造成10,000,000伤害" },
                    icon: "☄️",
                    category: "damage",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 10000000,
                    unlocked: false,
                    reward: 500,
                    condition: "totalDamageDealt"
                },
                damage_100m: {
                    name: { ru: "Гравитационный удар", en: "Gravity Strike", zh: "重力打击" },
                    description: { ru: "Нанести 100,000,000 урона", en: "Deal 100,000,000 damage", zh: "造成100,000,000伤害" },
                    icon: "🌌",
                    category: "damage",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 100000000,
                    unlocked: false,
                    reward: 1000,
                    condition: "totalDamageDealt"
                },
                damage_1b: {
                    name: { ru: "Ядерный след", en: "Nuclear Trail", zh: "核能轨迹" },
                    description: { ru: "Нанести 1,000,000,000 урона", en: "Deal 1,000,000,000 damage", zh: "造成1,000,000,000伤害" },
                    icon: "☢️",
                    category: "damage",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 1000000000,
                    unlocked: false,
                    reward: 2500,
                    condition: "totalDamageDealt"
                },
                damage_10b: {
                    name: { ru: "Испепеляющий шторм", en: "Scorching Storm", zh: "炽热风暴" },
                    description: { ru: "Нанести 10,000,000,000 урона", en: "Deal 10,000,000,000 damage", zh: "造成10,000,000,000伤害" },
                    icon: "🌪️",
                    category: "damage",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 10000000000,
                    unlocked: false,
                    reward: 5000,
                    condition: "totalDamageDealt"
                },
                damage_1t: {
                    name: { ru: "Разрушитель планет", en: "Planet Destroyer", zh: "行星破坏者" },
                    description: { ru: "Нанести 1,000,000,000,000 урона", en: "Deal 1,000,000,000,000 damage", zh: "造成1,000,000,000,000伤害" },
                    icon: "🔥",
                    category: "damage",
                    rarity: "legendary",
                    points: 100,
                    progress: 0,
                    target: 1000000000000,
                    unlocked: false,
                    reward: 10000,
                    condition: "totalDamageDealt"
                },
                
                // ============ КРИСТАЛЛЫ ============
                coins_1k: {
                    name: { ru: "Первая пригоршня", en: "First Handful", zh: "第一把" },
                    description: { ru: "Собрать 1,000 кристаллов", en: "Collect 1,000 crystals", zh: "收集1,000水晶" },
                    icon: "💎",
                    category: "coins",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 1000,
                    unlocked: false,
                    reward: 50,
                    condition: "coins"
                },
                coins_10k: {
                    name: { ru: "Полный карман", en: "Full Pocket", zh: "满口袋" },
                    description: { ru: "Собрать 10,000 кристаллов", en: "Collect 10,000 crystals", zh: "收集10,000水晶" },
                    icon: "💎",
                    category: "coins",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 10000,
                    unlocked: false,
                    reward: 100,
                    condition: "coins"
                },
                coins_100k: {
                    name: { ru: "Маленький сейф", en: "Small Safe", zh: "小保险箱" },
                    description: { ru: "Собрать 100,000 кристаллов", en: "Collect 100,000 crystals", zh: "收集100,000水晶" },
                    icon: "💰",
                    category: "coins",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 100000,
                    unlocked: false,
                    reward: 500,
                    condition: "coins"
                },
                coins_1m: {
                    name: { ru: "Кристальный счет", en: "Crystal Account", zh: "水晶账户" },
                    description: { ru: "Собрать 1,000,000 кристаллов", en: "Collect 1,000,000 crystals", zh: "收集1,000,000水晶" },
                    icon: "🏦",
                    category: "coins",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 1000000,
                    unlocked: false,
                    reward: 2000,
                    condition: "coins"
                },
                coins_10m: {
                    name: { ru: "Локальный миллиардер", en: "Local Billionaire", zh: "本地亿万富翁" },
                    description: { ru: "Собрать 10,000,000 кристаллов", en: "Collect 10,000,000 crystals", zh: "收集10,000,000水晶" },
                    icon: "👑",
                    category: "coins",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 10000000,
                    unlocked: false,
                    reward: 5000,
                    condition: "coins"
                },
                coins_100m: {
                    name: { ru: "Банк астероидного пояса", en: "Asteroid Belt Bank", zh: "小行星带银行" },
                    description: { ru: "Собрать 100,000,000 кристаллов", en: "Collect 100,000,000 crystals", zh: "收集100,000,000水晶" },
                    icon: "🪐",
                    category: "coins",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 100000000,
                    unlocked: false,
                    reward: 10000,
                    condition: "coins"
                },
                coins_1b: {
                    name: { ru: "Фонд Юпитера", en: "Jupiter Fund", zh: "木星基金" },
                    description: { ru: "Собрать 1,000,000,000 кристаллов", en: "Collect 1,000,000,000 crystals", zh: "收集1,000,000,000水晶" },
                    icon: "♃",
                    category: "coins",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 1000000000,
                    unlocked: false,
                    reward: 25000,
                    condition: "coins"
                },
                
                // ============ УРОВЕНЬ КЛИКА ============
                clickpower_5: {
                    name: { ru: "Незначительный нажим", en: "Light Touch", zh: "轻微触碰" },
                    description: { ru: "Достигнуть уровня клика 5", en: "Reach click level 5", zh: "达到点击等级5" },
                    icon: "👆",
                    category: "upgrades",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 5,
                    unlocked: false,
                    reward: 50,
                    condition: "clickUpgradeLevel"
                },
                clickpower_10: {
                    name: { ru: "Уверенное нажатие", en: "Confident Press", zh: "自信点击" },
                    description: { ru: "Достигнуть уровня клика 10", en: "Reach click level 10", zh: "达到点击等级10" },
                    icon: "👊",
                    category: "upgrades",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 10,
                    unlocked: false,
                    reward: 100,
                    condition: "clickUpgradeLevel"
                },
                clickpower_25: {
                    name: { ru: "Тренированный палец", en: "Trained Finger", zh: "训练有素的手指" },
                    description: { ru: "Достигнуть уровня клика 25", en: "Reach click level 25", zh: "达到点击等级25" },
                    icon: "💪",
                    category: "upgrades",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 25,
                    unlocked: false,
                    reward: 250,
                    condition: "clickUpgradeLevel"
                },
                clickpower_50: {
                    name: { ru: "Серийный кликер", en: "Serial Clicker", zh: "连续点击者" },
                    description: { ru: "Достигнуть уровня клика 50", en: "Reach click level 50", zh: "达到点击等级50" },
                    icon: "🔨",
                    category: "upgrades",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 50,
                    unlocked: false,
                    reward: 500,
                    condition: "clickUpgradeLevel"
                },
                clickpower_100: {
                    name: { ru: "Крушитель блоков", en: "Block Crusher", zh: "方块粉碎者" },
                    description: { ru: "Достигнуть уровня клика 100", en: "Reach click level 100", zh: "达到点击等级100" },
                    icon: "🌪️",
                    category: "upgrades",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 100,
                    unlocked: false,
                    reward: 2000,
                    condition: "clickUpgradeLevel"
                },
                clickpower_200: {
                    name: { ru: "Гиперудар", en: "Hyper Strike", zh: "超能打击" },
                    description: { ru: "Достигнуть уровня клика 200", en: "Reach click level 200", zh: "达到点击等级200" },
                    icon: "💥",
                    category: "upgrades",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 200,
                    unlocked: false,
                    reward: 10000,
                    condition: "clickUpgradeLevel"
                },
                
                // ============ КРИТИЧЕСКИЕ УДАРЫ ============
                crithits_1: {
                    name: { ru: "Первый крит", en: "First Crit", zh: "第一次暴击" },
                    description: { ru: "Нанести 1 критический удар", en: "Deal 1 critical hit", zh: "造成1次暴击" },
                    icon: "⚡",
                    category: "combat",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 1,
                    unlocked: false,
                    reward: 25,
                    condition: "critHitsCount"
                },
                crithits_50: {
                    name: { ru: "Серия вспышек", en: "Flash Series", zh: "闪光系列" },
                    description: { ru: "Нанести 50 критических ударов", en: "Deal 50 critical hits", zh: "造成50次暴击" },
                    icon: "✨",
                    category: "combat",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 50,
                    unlocked: false,
                    reward: 100,
                    condition: "critHitsCount"
                },
                crithits_200: {
                    name: { ru: "Критический энтузиаст", en: "Crit Enthusiast", zh: "暴击爱好者" },
                    description: { ru: "Нанести 200 критических ударов", en: "Deal 200 critical hits", zh: "造成200次暴击" },
                    icon: "🔥",
                    category: "combat",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 200,
                    unlocked: false,
                    reward: 250,
                    condition: "critHitsCount"
                },
                crithits_1k: {
                    name: { ru: "Критический эксперт", en: "Crit Expert", zh: "暴击专家" },
                    description: { ru: "Нанести 1,000 критических ударов", en: "Deal 1,000 critical hits", zh: "造成1,000次暴击" },
                    icon: "👨‍🎓",
                    category: "combat",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 1000,
                    unlocked: false,
                    reward: 500,
                    condition: "critHitsCount"
                },
                crithits_5k: {
                    name: { ru: "Разрыв статистики", en: "Stats Break", zh: "数据突破" },
                    description: { ru: "Нанести 5,000 критических ударов", en: "Deal 5,000 critical hits", zh: "造成5,000次暴击" },
                    icon: "📊",
                    category: "combat",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 5000,
                    unlocked: false,
                    reward: 1000,
                    condition: "critHitsCount"
                },
                crithits_10k: {
                    name: { ru: "Шторм критов", en: "Crit Storm", zh: "暴击风暴" },
                    description: { ru: "Нанести 10,000 критических ударов", en: "Deal 10,000 critical hits", zh: "造成10,000次暴击" },
                    icon: "🌪️",
                    category: "combat",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 10000,
                    unlocked: false,
                    reward: 2000,
                    condition: "critHitsCount"
                },
                crithits_25k: {
                    name: { ru: "Критическая буря", en: "Crit Tempest", zh: "暴击狂潮" },
                    description: { ru: "Нанести 25,000 критических ударов", en: "Deal 25,000 critical hits", zh: "造成25,000次暴击" },
                    icon: "⛈️",
                    category: "combat",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 25000,
                    unlocked: false,
                    reward: 5000,
                    condition: "critHitsCount"
                },
                crithits_100k: {
                    name: { ru: "Критический апокалипсис", en: "Crit Apocalypse", zh: "暴击末日" },
                    description: { ru: "Нанести 100,000 критических ударов", en: "Deal 100,000 critical hits", zh: "造成100,000次暴击" },
                    icon: "☠️",
                    category: "combat",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 100000,
                    unlocked: false,
                    reward: 10000,
                    condition: "critHitsCount"
                },
                crithits_1m: {
                    name: { ru: "Архитектор вероятности", en: "Probability Architect", zh: "概率建筑师" },
                    description: { ru: "Нанести 1,000,000 критических ударов", en: "Deal 1,000,000 critical hits", zh: "造成1,000,000次暴击" },
                    icon: "🏛️",
                    category: "combat",
                    rarity: "legendary",
                    points: 100,
                    progress: 0,
                    target: 1000000,
                    unlocked: false,
                    reward: 50000,
                    condition: "critHitsCount"
                },
                
                // ============ БЛОКИ ============
                blocks_10: {
                    name: { ru: "Первый обломок", en: "First Fragment", zh: "第一块碎片" },
                    description: { ru: "Разрушить 10 блоков", en: "Destroy 10 blocks", zh: "摧毁10个方块" },
                    icon: "🧱",
                    category: "blocks",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 10,
                    unlocked: false,
                    reward: 25,
                    condition: "blocksDestroyed"
                },
                blocks_100: {
                    name: { ru: "Разрушитель-новичок", en: "Novice Destroyer", zh: "新手破坏者" },
                    description: { ru: "Разрушить 100 блоков", en: "Destroy 100 blocks", zh: "摧毁100个方块" },
                    icon: "🔨",
                    category: "blocks",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 100,
                    unlocked: false,
                    reward: 50,
                    condition: "blocksDestroyed"
                },
                blocks_500: {
                    name: { ru: "Регулярный демонтаж", en: "Regular Demolition", zh: "定期拆除" },
                    description: { ru: "Разрушить 500 блоков", en: "Destroy 500 blocks", zh: "摧毁500个方块" },
                    icon: "💣",
                    category: "blocks",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 500,
                    unlocked: false,
                    reward: 150,
                    condition: "blocksDestroyed"
                },
                blocks_1k: {
                    name: { ru: "Сносчик", en: "Demolitionist", zh: "拆解专家" },
                    description: { ru: "Разрушить 1,000 блоков", en: "Destroy 1,000 blocks", zh: "摧毁1,000个方块" },
                    icon: "🏗️",
                    category: "blocks",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 1000,
                    unlocked: false,
                    reward: 300,
                    condition: "blocksDestroyed"
                },
                blocks_5k: {
                    name: { ru: "Буровая бригада", en: "Drilling Crew", zh: "钻探小队" },
                    description: { ru: "Разрушить 5,000 блоков", en: "Destroy 5,000 blocks", zh: "摧毁5,000个方块" },
                    icon: "⛏️",
                    category: "blocks",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 5000,
                    unlocked: false,
                    reward: 750,
                    condition: "blocksDestroyed"
                },
                blocks_10k: {
                    name: { ru: "Фабрика обломков", en: "Fragment Factory", zh: "碎片工厂" },
                    description: { ru: "Разрушить 10,000 блоков", en: "Destroy 10,000 blocks", zh: "摧毁10,000个方块" },
                    icon: "🏭",
                    category: "blocks",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 10000,
                    unlocked: false,
                    reward: 1500,
                    condition: "blocksDestroyed"
                },
                blocks_25k: {
                    name: { ru: "Ландшафтный дизайнер", en: "Landscape Designer", zh: "景观设计师" },
                    description: { ru: "Разрушить 25,000 блоков", en: "Destroy 25,000 blocks", zh: "摧毁25,000个方块" },
                    icon: "🎨",
                    category: "blocks",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 25000,
                    unlocked: false,
                    reward: 3000,
                    condition: "blocksDestroyed"
                },
                blocks_50k: {
                    name: { ru: "Архитектор пустоты", en: "Void Architect", zh: "虚空建筑师" },
                    description: { ru: "Разрушить 50,000 блоков", en: "Destroy 50,000 blocks", zh: "摧毁50,000个方块" },
                    icon: "👻",
                    category: "blocks",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 50000,
                    unlocked: false,
                    reward: 7500,
                    condition: "blocksDestroyed"
                },
                blocks_100k: {
                    name: { ru: "Опустошитель сектора", en: "Sector Devastator", zh: "区域毁灭者" },
                    description: { ru: "Разрушить 100,000 блоков", en: "Destroy 100,000 blocks", zh: "摧毁100,000个方块" },
                    icon: "💀",
                    category: "blocks",
                    rarity: "legendary",
                    points: 100,
                    progress: 0,
                    target: 100000,
                    unlocked: false,
                    reward: 25000,
                    condition: "blocksDestroyed"
                },
                
                // ============ РЕДКИЕ БЛОКИ ============
                rareblocks_1: {
                    name: { ru: "Первая находка", en: "First Find", zh: "第一次发现" },
                    description: { ru: "Найти 1 редкий блок любого типа", en: "Find 1 rare block of any type", zh: "找到1个任何类型的稀有方块" },
                    icon: "💎",
                    category: "rareblocks",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 1,
                    unlocked: false,
                    reward: 100,
                    condition: "rareBlocksTotal"
                },
                rareblocks_10: {
                    name: { ru: "Коллекционер вспышек", en: "Flash Collector", zh: "闪光收集者" },
                    description: { ru: "Найти 10 редких блоков", en: "Find 10 rare blocks", zh: "找到10个稀有方块" },
                    icon: "🌟",
                    category: "rareblocks",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 10,
                    unlocked: false,
                    reward: 250,
                    condition: "rareBlocksTotal"
                },
                rareblocks_50: {
                    name: { ru: "Охотник за аномалиями", en: "Anomaly Hunter", zh: "异常猎人" },
                    description: { ru: "Найти 50 редких блоков", en: "Find 50 rare blocks", zh: "找到50个稀有方块" },
                    icon: "🔍",
                    category: "rareblocks",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 50,
                    unlocked: false,
                    reward: 750,
                    condition: "rareBlocksTotal"
                },
                rareblocks_100: {
                    name: { ru: "Артефактный исследователь", en: "Artifact Researcher", zh: "文物研究者" },
                    description: { ru: "Найти 100 редких блоков", en: "Find 100 rare blocks", zh: "找到100个稀有方块" },
                    icon: "🗺️",
                    category: "rareblocks",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 100,
                    unlocked: false,
                    reward: 1500,
                    condition: "rareBlocksTotal"
                },
                rareblocks_250: {
                    name: { ru: "Куратор редкостей", en: "Rarity Curator", zh: "稀有度馆长" },
                    description: { ru: "Найти 250 редких блоков", en: "Find 250 rare blocks", zh: "找到250个稀有方块" },
                    icon: "🖼️",
                    category: "rareblocks",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 250,
                    unlocked: false,
                    reward: 3500,
                    condition: "rareBlocksTotal"
                },
                rareblocks_500: {
                    name: { ru: "Коллекция сектора", en: "Sector Collection", zh: "区域收藏" },
                    description: { ru: "Найти 500 редких блоков", en: "Find 500 rare blocks", zh: "找到500个稀有方块" },
                    icon: "🎭",
                    category: "rareblocks",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 500,
                    unlocked: false,
                    reward: 7500,
                    condition: "rareBlocksTotal"
                },
                rareblocks_1k: {
                    name: { ru: "Музей аномалий", en: "Anomaly Museum", zh: "异常博物馆" },
                    description: { ru: "Найти 1,000 редких блоков", en: "Find 1,000 rare blocks", zh: "找到1,000个稀有方块" },
                    icon: "🏛️",
                    category: "rareblocks",
                    rarity: "legendary",
                    points: 100,
                    progress: 0,
                    target: 1000,
                    unlocked: false,
                    reward: 15000,
                    condition: "rareBlocksTotal"
                },
                
                // ============ СПЕЦИАЛЬНЫЕ РЕДКИЕ БЛОКИ ============
                goldblocks_10: {
                    name: { ru: "Золотая искра", en: "Golden Spark", zh: "金色火花" },
                    description: { ru: "Найдено 10 золотых блоков", en: "Find 10 gold blocks", zh: "找到10个黄金方块" },
                    icon: "🟨",
                    category: "rareblocks_gold",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 10,
                    unlocked: false,
                    reward: 300,
                    condition: "goldBlocksFound"
                },
                rainbowblocks_10: {
                    name: { ru: "Радужный знак", en: "Rainbow Sign", zh: "彩虹标志" },
                    description: { ru: "Найдено 10 радужных блоков", en: "Find 10 rainbow blocks", zh: "找到10个彩虹方块" },
                    icon: "🌈",
                    category: "rareblocks_rainbow",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 10,
                    unlocked: false,
                    reward: 300,
                    condition: "rainbowBlocksFound"
                },
                crystalblocks_10: {
                    name: { ru: "Кристальный отголосок", en: "Crystal Echo", zh: "水晶回响" },
                    description: { ru: "Найдено 10 кристальных блоков", en: "Find 10 crystal blocks", zh: "找到10个水晶方块" },
                    icon: "💎",
                    category: "rareblocks_crystal",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 10,
                    unlocked: false,
                    reward: 300,
                    condition: "crystalBlocksFound"
                },
                mysteryblocks_5: {
                    name: { ru: "Первая тайна", en: "First Mystery", zh: "第一个谜题" },
                    description: { ru: "Найдено 5 Mystery-блоков", en: "Find 5 Mystery blocks", zh: "找到5个神秘方块" },
                    icon: "❓",
                    category: "rareblocks_mystery",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 5,
                    unlocked: false,
                    reward: 1000,
                    condition: "mysteryBlocksFound"
                },
                
                // ============ КОМБО ============
                combo_2: {
                    name: { ru: "Двойной удар", en: "Double Strike", zh: "双重打击" },
                    description: { ru: "Добиться комбо x2", en: "Achieve x2 combo", zh: "达到2连击" },
                    icon: "👊",
                    category: "combo",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 2,
                    unlocked: false,
                    reward: 50,
                    condition: "maxCombo"
                },
                combo_5: {
                    name: { ru: "Серия из пяти", en: "Series of Five", zh: "五连系列" },
                    description: { ru: "Добиться комбо x5", en: "Achieve x5 combo", zh: "达到5连击" },
                    icon: "🔥",
                    category: "combo",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 5,
                    unlocked: false,
                    reward: 150,
                    condition: "maxCombo"
                },
                combo_10: {
                    name: { ru: "Десятикратный натиск", en: "Tenfold Onslaught", zh: "十连猛攻" },
                    description: { ru: "Добиться комбо x10", en: "Achieve x10 combo", zh: "达到10连击" },
                    icon: "💥",
                    category: "combo",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 10,
                    unlocked: false,
                    reward: 300,
                    condition: "maxCombo"
                },
                combo_20: {
                    name: { ru: "Непрерывный шквал", en: "Continuous Barrage", zh: "连续弹幕" },
                    description: { ru: "Добиться комбо x20", en: "Achieve x20 combo", zh: "达到20连击" },
                    icon: "⚡",
                    category: "combo",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 20,
                    unlocked: false,
                    reward: 750,
                    condition: "maxCombo"
                },
                combo_30: {
                    name: { ru: "Гиперсерия", en: "Hyper Series", zh: "超能系列" },
                    description: { ru: "Добиться комбо x30", en: "Achieve x30 combo", zh: "达到30连击" },
                    icon: "🌪️",
                    category: "combo",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 30,
                    unlocked: false,
                    reward: 1500,
                    condition: "maxCombo"
                },
                combo_50: {
                    name: { ru: "Комбо-шторм", en: "Combo Storm", zh: "连击风暴" },
                    description: { ru: "Добиться комбо x50", en: "Achieve x50 combo", zh: "达到50连击" },
                    icon: "⛈️",
                    category: "combo",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 50,
                    unlocked: false,
                    reward: 3500,
                    condition: "maxCombo"
                },
                combo_75: {
                    name: { ru: "Режим берсерка", en: "Berserk Mode", zh: "狂暴模式" },
                    description: { ru: "Добиться комбо x75", en: "Achieve x75 combo", zh: "达到75连击" },
                    icon: "😤",
                    category: "combo",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 75,
                    unlocked: false,
                    reward: 7500,
                    condition: "maxCombo"
                },
                combo_100: {
                    name: { ru: "Бесконечный поток", en: "Endless Stream", zh: "无尽流" },
                    description: { ru: "Добиться комбо x100", en: "Achieve x100 combo", zh: "达到100连击" },
                    icon: "∞",
                    category: "combo",
                    rarity: "legendary",
                    points: 100,
                    progress: 0,
                    target: 100,
                    unlocked: false,
                    reward: 20000,
                    condition: "maxCombo"
                },
                
                // ============ СЕССИИ ============
                sessions_1: {
                    name: { ru: "Первый заход", en: "First Session", zh: "第一次游戏" },
                    description: { ru: "Завершить 1 игровой сеанс", en: "Complete 1 gaming session", zh: "完成1次游戏会话" },
                    icon: "🎮",
                    category: "activity",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 1,
                    unlocked: false,
                    reward: 50,
                    condition: "sessionCount"
                },
                sessions_5: {
                    name: { ru: "Вернусь завтра", en: "Back Tomorrow", zh: "明天再来" },
                    description: { ru: "Завершить 5 сеансов", en: "Complete 5 sessions", zh: "完成5次会话" },
                    icon: "📅",
                    category: "activity",
                    rarity: "common",
                    points: 5,
                    progress: 0,
                    target: 5,
                    unlocked: false,
                    reward: 100,
                    condition: "sessionCount"
                },
                sessions_10: {
                    name: { ru: "Регулярный гость", en: "Regular Visitor", zh: "常客" },
                    description: { ru: "Завершить 10 сеансов", en: "Complete 10 sessions", zh: "完成10次会话" },
                    icon: "🏠",
                    category: "activity",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 10,
                    unlocked: false,
                    reward: 250,
                    condition: "sessionCount"
                },
                sessions_25: {
                    name: { ru: "Постоянный пилот", en: "Permanent Pilot", zh: "永久飞行员" },
                    description: { ru: "Завершить 25 сеансов", en: "Complete 25 sessions", zh: "完成25次会话" },
                    icon: "✈️",
                    category: "activity",
                    rarity: "uncommon",
                    points: 10,
                    progress: 0,
                    target: 25,
                    unlocked: false,
                    reward: 500,
                    condition: "sessionCount"
                },
                sessions_50: {
                    name: { ru: "Житель станции", en: "Station Resident", zh: "空间站居民" },
                    description: { ru: "Завершить 50 сеансов", en: "Complete 50 sessions", zh: "完成50次会话" },
                    icon: "🏢",
                    category: "activity",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 50,
                    unlocked: false,
                    reward: 1000,
                    condition: "sessionCount"
                },
                sessions_100: {
                    name: { ru: "Ветеран экспедиции", en: "Expedition Veteran", zh: "远征老兵" },
                    description: { ru: "Завершить 100 сеансов", en: "Complete 100 sessions", zh: "完成100次会话" },
                    icon: "🎖️",
                    category: "activity",
                    rarity: "rare",
                    points: 25,
                    progress: 0,
                    target: 100,
                    unlocked: false,
                    reward: 2500,
                    condition: "sessionCount"
                },
                sessions_250: {
                    name: { ru: "Офицер флота", en: "Fleet Officer", zh: "舰队军官" },
                    description: { ru: "Завершить 250 сеансов", en: "Complete 250 sessions", zh: "完成250次会话" },
                    icon: "⚓",
                    category: "activity",
                    rarity: "epic",
                    points: 50,
                    progress: 0,
                    target: 250,
                    unlocked: false,
                    reward: 5000,
                    condition: "sessionCount"
                }
            };
        }
        
        updateAchievementsUI() {
            const grid = document.getElementById('achievementsGrid');
            if (!grid) return;
            
            grid.innerHTML = '';
            
            // Сортируем достижения по категориям и прогрессу
            const sortedAchievements = Object.values(this.achievements).sort((a, b) => {
                // Сначала сортируем по разблокированности
                if (a.unlocked !== b.unlocked) return a.unlocked ? 1 : -1;
                // Затем по редкости
                const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
                return rarityOrder[b.rarity] - rarityOrder[a.rarity];
            });
            
            sortedAchievements.forEach(achievement => {
                const achievementElement = document.createElement('div');
                achievementElement.className = achievement.unlocked ? 'achievement-item unlocked' : 'achievement-item';
                
                // Цвета по редкости
                const rarityColors = {
                    common: '#4CAF50',
                    uncommon: '#2196F3',
                    rare: '#9C27B0',
                    epic: '#FF9800',
                    legendary: '#FF5722'
                };
                
                const progressPercent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
                const borderColor = rarityColors[achievement.rarity] || '#a0d2ff';
                
                achievementElement.style.cssText = `
                    background: rgba(${achievement.unlocked ? '40, 80, 40' : '50, 40, 80'}, 0.8);
                    border-radius: ${this.isMobile ? '8px' : '10px'};
                    padding: ${this.isMobile ? '12px' : '15px'};
                    border: 2px solid ${achievement.unlocked ? '#4CAF50' : borderColor};
                    transition: transform 0.3s;
                    display: flex;
                    gap: ${this.isMobile ? '12px' : '15px'};
                    min-height: ${this.isMobile ? '110px' : '130px'};
                    position: relative;
                    overflow: hidden;
                `;
                
                // Индикатор редкости
                achievementElement.innerHTML = `
                    <div style="
                        position: absolute;
                        top: 0;
                        right: 0;
                        background: ${borderColor};
                        color: white;
                        font-size: 0.7em;
                        padding: 2px 8px;
                        border-radius: 0 0 0 8px;
                        text-transform: uppercase;
                        font-weight: bold;
                    ">
                        ${achievement.rarity}
                    </div>
                    
                    <div style="
                        font-size: ${this.isMobile ? '1.8em' : '2em'};
                        width: ${this.isMobile ? '50px' : '60px'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: ${achievement.unlocked ? '#ffd700' : borderColor};
                    ">
                        ${achievement.icon}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="
                            color: ${achievement.unlocked ? '#ffd700' : borderColor};
                            margin: 0 0 ${this.isMobile ? '4px' : '8px'} 0;
                            font-size: ${this.isMobile ? '1em' : '1.1em'};
                            line-height: 1.3;
                            word-wrap: break-word;
                        ">
                            ${this.getTranslationForAchievement(achievement.name)}
                            ${achievement.unlocked ? ' <span style="color:#4CAF50;font-size:0.8em;">✓</span>' : ''}
                            <span style="float: right; font-size: 0.8em; color: #ffd700;">${achievement.points} <i class="fas fa-star"></i></span>
                        </h3>
                        <p style="
                            color: #ccc;
                            margin: 0 0 ${this.isMobile ? '6px' : '8px'} 0;
                            font-size: ${this.isMobile ? '0.8em' : '0.9em'};
                            line-height: 1.4;
                        ">
                            ${this.getTranslationForAchievement(achievement.description)}
                        </p>
                        <div style="
                            height: ${this.isMobile ? '6px' : '8px'};
                            background: rgba(255, 255, 255, 0.2);
                            border-radius: 4px;
                            margin: ${this.isMobile ? '6px 0' : '8px 0'};
                            overflow: hidden;
                        ">
                            <div style="
                                height: 100%;
                                background: linear-gradient(90deg, ${achievement.unlocked ? '#4CAF50, #8BC34A' : `${borderColor}, #a0d2ff`});
                                border-radius: 4px;
                                width: ${progressPercent}%;
                            "></div>
                        </div>
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            font-size: ${this.isMobile ? '0.8em' : '0.9em'};
                            color: #a0d2ff;
                            margin-top: ${this.isMobile ? '4px' : '6px'};
                        ">
                            <span>${achievement.progress.toLocaleString()}/${achievement.target.toLocaleString()}</span>
                            <span>+${achievement.reward.toLocaleString()} <i class="fas fa-gem"></i></span>
                        </div>
                    </div>
                `;
                
                grid.appendChild(achievementElement);
            });
        }
        
        updateStatsDisplay() {
            let totalPoints = 0;
            let totalRewards = 0;
            
            Object.values(this.achievements).forEach(achievement => {
                if (achievement.unlocked) {
                    totalPoints += achievement.points;
                    totalRewards += achievement.reward;
                }
            });
            
            const pointsElement = document.getElementById('totalPoints');
            const rewardsElement = document.getElementById('totalRewards');
            
            if (pointsElement) pointsElement.textContent = totalPoints.toLocaleString();
            if (rewardsElement) rewardsElement.textContent = totalRewards.toLocaleString();
        }
        
        setupEventListeners() {
            // Ожидаем, пока игра полностью загрузится
            setTimeout(() => {
                // Отслеживаем разрушение блоков
                const gameArea = document.getElementById('gameArea');
                if (gameArea) {
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach(mutation => {
                            if (mutation.removedNodes.length > 0) {
                                // Блок был разрушен
                                this.updateGameStat('blocksDestroyed', 1);
                                
                                // Проверяем тип блока
                                mutation.removedNodes.forEach(node => {
                                    if (node.classList) {
                                        if (node.classList.contains('gold-block')) {
                                            this.updateGameStat('goldBlocksFound', 1);
                                            this.updateGameStat('rareBlocksTotal', 1);
                                        } else if (node.classList.contains('rainbow-block')) {
                                            this.updateGameStat('rainbowBlocksFound', 1);
                                            this.updateGameStat('rareBlocksTotal', 1);
                                        } else if (node.classList.contains('crystal-block')) {
                                            this.updateGameStat('crystalBlocksFound', 1);
                                            this.updateGameStat('rareBlocksTotal', 1);
                                        } else if (node.classList.contains('mystery-block')) {
                                            this.updateGameStat('mysteryBlocksFound', 1);
                                            this.updateGameStat('rareBlocksTotal', 1);
                                        }
                                    }
                                });
                            }
                        });
                    });
                    observer.observe(gameArea, { childList: true });
                }
                
                // Отслеживаем критические удары через события
                document.addEventListener('critDamage', (e) => {
                    this.updateGameStat('critHitsCount', 1);
                });
                
                // Отслеживаем изменение кристаллов
                const coinsElement = document.getElementById('coins-value');
                if (coinsElement) {
                    let lastCoinsValue = parseInt(coinsElement.textContent.replace(/\D/g, '')) || 0;
                    this.gameStats.coins = lastCoinsValue;
                    
                    const coinsObserver = new MutationObserver(() => {
                        const currentCoins = parseInt(coinsElement.textContent.replace(/\D/g, '')) || 0;
                        if (currentCoins > lastCoinsValue) {
                            const diff = currentCoins - lastCoinsValue;
                            this.updateGameStat('coins', diff);
                            lastCoinsValue = currentCoins;
                        } else if (currentCoins < lastCoinsValue) {
                            // Игрок потратил кристаллы
                            lastCoinsValue = currentCoins;
                            this.gameStats.coins = currentCoins;
                        }
                    });
                    
                    coinsObserver.observe(coinsElement, { characterData: true, subtree: true, childList: true });
                }
                
                // Отслеживаем уровень клика
                const clickUpgradeBtn = document.querySelector('[onclick*="buyClickUpgrade"]');
                if (clickUpgradeBtn) {
                    clickUpgradeBtn.addEventListener('click', () => {
                        setTimeout(() => {
                            // Предполагаем, что уровень клика хранится в window.clickUpgradeLevel
                            if (typeof window.clickUpgradeLevel !== 'undefined') {
                                this.updateGameStat('clickUpgradeLevel', window.clickUpgradeLevel);
                            }
                        }, 100);
                    });
                }
                
                // Отслеживаем шанс крита
                setInterval(() => {
                    if (typeof window.critChance !== 'undefined') {
                        this.updateGameStat('critChance', window.critChance);
                    }
                }, 5000);
                
                // Отслеживаем комбо
                let lastClickTime = 0;
                let comboCount = 0;
                document.addEventListener('click', (e) => {
                    const currentTime = Date.now();
                    if (currentTime - lastClickTime < 1000) { // 1 секунда для комбо
                        comboCount++;
                        this.gameStats.currentSession.combo = comboCount;
                        if (comboCount > this.gameStats.currentSession.maxComboInSession) {
                            this.gameStats.currentSession.maxComboInSession = comboCount;
                            this.updateGameStat('maxCombo', comboCount);
                        }
                    } else {
                        comboCount = 0;
                    }
                    lastClickTime = currentTime;
                });
                
                // Отслеживаем урон
                document.addEventListener('blockDamage', (e) => {
                    if (e.detail && e.detail.damage) {
                        this.updateGameStat('totalDamageDealt', e.detail.damage);
                    }
                });
                
                // Счетчик сессий
                const sessionCount = localStorage.getItem('gameSessionCount') || 0;
                this.gameStats.sessionCount = parseInt(sessionCount) + 1;
                localStorage.setItem('gameSessionCount', this.gameStats.sessionCount.toString());
                this.updateGameStat('sessionCount', this.gameStats.sessionCount);
                
            }, 2000);
        }
        
        updateGameStat(statName, value) {
            if (!this.gameStats[statName]) return;
            
            // Обновляем статистику
            if (statName === 'maxCombo') {
                // Для максимального комбо берем максимальное значение
                if (value > this.gameStats[statName]) {
                    this.gameStats[statName] = value;
                }
            } else if (statName === 'clickUpgradeLevel' || statName === 'critChance' || statName === 'sessionCount') {
                // Для уровней устанавливаем точное значение
                this.gameStats[statName] = value;
            } else {
                // Для остальных - накапливаем
                this.gameStats[statName] += value;
            }
            
            // Проверяем достижения для этой статистики
            this.checkAchievementsForStat(statName);
            
            // Сохраняем статистику
            this.saveGameStats();
        }
        
        checkAchievementsForStat(statName) {
            const currentValue = this.gameStats[statName];
            
            // Находим все достижения, которые зависят от этой статистики
            Object.entries(this.achievements).forEach(([id, achievement]) => {
                if (achievement.condition === statName && !achievement.unlocked) {
                    // Обновляем прогресс
                    achievement.progress = Math.min(currentValue, achievement.target);
                    
                    // Проверяем, достигнута ли цель
                    if (currentValue >= achievement.target) {
                        this.unlockAchievement(id);
                    }
                }
            });
            
            // Обновляем UI если окно открыто
            if (document.getElementById('achievementsModal').style.display === 'flex') {
                this.updateAchievementsUI();
                this.updateStatsDisplay();
            }
        }
        
        updateAchievementProgress(achievementId, progress) {
            const achievement = this.achievements[achievementId];
            if (!achievement || achievement.unlocked) return;
            
            achievement.progress = Math.min(achievement.target, achievement.progress + progress);
            
            if (achievement.progress >= achievement.target && !achievement.unlocked) {
                this.unlockAchievement(achievementId);
            }
            
            this.saveAchievementsData();
        }
        
        unlockAchievement(achievementId) {
            const achievement = this.achievements[achievementId];
            if (!achievement || achievement.unlocked) return;
            
            achievement.unlocked = true;
            achievement.progress = achievement.target;
            
            // Выдаем награду
            const coinsElement = document.getElementById('coins-value');
            if (coinsElement) {
                const currentCoins = parseInt(coinsElement.textContent.replace(/\D/g, '')) || 0;
                const newCoins = currentCoins + achievement.reward;
                coinsElement.textContent = newCoins.toLocaleString();
                if (typeof window.coins !== 'undefined') {
                    window.coins = newCoins;
                }
                
                // Обновляем статистику кристаллов
                this.gameStats.coins = newCoins;
                
                // Показываем уведомление
                this.showAchievementNotification(achievementId);
            }
            
            this.saveAchievementsData();
            this.saveGameStats();
            
            // Обновляем UI если окно открыто
            if (document.getElementById('achievementsModal').style.display === 'flex') {
                this.updateAchievementsUI();
                this.updateStatsDisplay();
            }
        }
        
        showAchievementNotification(achievementId) {
            const achievement = this.achievements[achievementId];
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(80, 40, 120, 0.95);
                border: 3px solid #ffd700;
                color: white;
                padding: ${this.isMobile ? '15px' : '20px'};
                border-radius: ${this.isMobile ? '10px' : '15px'};
                z-index: 3000;
                text-align: center;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.7);
                font-family: 'Orbitron', sans-serif;
                animation: slideDown 0.5s, fadeOut 0.5s 4.5s forwards;
                max-width: ${this.isMobile ? '90%' : '300px'};
                word-wrap: break-word;
            `;
            
            // Цвета по редкости
            const rarityColors = {
                common: '#4CAF50',
                uncommon: '#2196F3',
                rare: '#9C27B0',
                epic: '#FF9800',
                legendary: '#FF5722'
            };
            const borderColor = rarityColors[achievement.rarity] || '#ffd700';
            
            notification.innerHTML = `
                <div style="font-size: ${this.isMobile ? '2em' : '2.5em'}; margin-bottom: ${this.isMobile ? '8px' : '10px'}; color: ${borderColor};">
                    ${achievement.icon}
                </div>
                <div style="background: ${borderColor}; color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.8em; display: inline-block; margin-bottom: 8px; text-transform: uppercase;">
                    ${achievement.rarity}
                </div>
                <h3 style="color: ${borderColor}; margin: 0 0 5px 0; font-size: ${this.isMobile ? '1.1em' : '1.2em'}">
                    ${this.getTranslation('achievementUnlocked')}
                </h3>
                <p style="font-size: ${this.isMobile ? '1em' : '1.1em'}; margin: 0 0 8px 0; color: #fff; font-weight: bold;">
                    ${this.getTranslationForAchievement(achievement.name)}
                </p>
                <p style="color: #a0d2ff; font-size: ${this.isMobile ? '0.9em' : '1em'}; margin: 0 0 5px 0;">
                    ${this.getTranslationForAchievement(achievement.description)}
                </p>
                <div style="margin-top: 10px;">
                    <span style="color: #ffd700; font-size: ${this.isMobile ? '0.9em' : '1em'};">
                        +${achievement.points} <i class="fas fa-star"></i>
                    </span>
                    <span style="margin: 0 10px;">•</span>
                    <span style="color: #a0d2ff; font-size: ${this.isMobile ? '0.9em' : '1em'};">
                        +${achievement.reward} <i class="fas fa-gem"></i>
                    </span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 5000);
        }
        
        saveAchievementsData() {
            const saveData = {
                achievements: {},
                gameStats: this.gameStats
            };
            
            Object.entries(this.achievements).forEach(([id, achievement]) => {
                saveData.achievements[id] = {
                    progress: achievement.progress,
                    unlocked: achievement.unlocked
                };
            });
            
            localStorage.setItem('cosmicAchievementsData', JSON.stringify(saveData));
        }
        
        loadAchievementsData() {
            const saved = localStorage.getItem('cosmicAchievementsData');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    
                    // Загружаем достижения
                    Object.entries(data.achievements).forEach(([id, achievementData]) => {
                        if (this.achievements[id]) {
                            this.achievements[id].progress = achievementData.progress || 0;
                            this.achievements[id].unlocked = achievementData.unlocked || false;
                        }
                    });
                    
                    // Загружаем статистику если есть
                    if (data.gameStats) {
                        this.gameStats = { ...this.gameStats, ...data.gameStats };
                    }
                } catch (e) {
                    console.error('Error loading achievements', e);
                }
            }
        }
        
        saveGameStats() {
            const statsData = {
                gameStats: this.gameStats,
                lastSave: Date.now()
            };
            localStorage.setItem('cosmicGameStats', JSON.stringify(statsData));
        }
        
        loadGameStats() {
            const saved = localStorage.getItem('cosmicGameStats');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    if (data.gameStats) {
                        this.gameStats = { ...this.gameStats, ...data.gameStats };
                    }
                } catch (e) {
                    console.error('Error loading game stats', e);
                }
            }
        }
        
        hookBoboActivation() {
            // Хук для активации помощника Bobo (если существует в игре)
            const originalBoboActivate = window.activateBoboHelper;
            if (typeof originalBoboActivate === 'function') {
                window.activateBoboHelper = function() {
                    const result = originalBoboActivate.apply(this, arguments);
                    // Обновляем статистику использования Bobo
                    if (window.achievementsSystem) {
                        window.achievementsSystem.updateAchievementProgress('boboFanatic', 1);
                    }
                    return result;
                };
            }
        }
        
        getTranslation(key) {
            const translations = {
                ru: {
                    achievementsButtonTitle: "Достижения",
                    achievementsTitle: "ГАЛАКТИЧЕСКИЕ ДОСТИЖЕНИЯ",
                    achievementsDescription: "Выполняйте космические миссии и получайте награды!",
                    achievementUnlocked: "ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО!"
                },
                en: {
                    achievementsButtonTitle: "Achievements",
                    achievementsTitle: "GALACTIC ACHIEVEMENTS",
                    achievementsDescription: "Complete space missions and earn rewards!",
                    achievementUnlocked: "ACHIEVEMENT UNLOCKED!"
                },
                zh: {
                    achievementsButtonTitle: "成就",
                    achievementsTitle: "银河成就",
                    achievementsDescription: "完成太空任务并获得奖励！",
                    achievementUnlocked: "成就已解锁！"
                }
            };
            
            const lang = localStorage.getItem('gameLanguage') || 'ru';
            return translations[lang][key] || key;
        }
        
        getTranslationForAchievement(textObj) {
            const lang = localStorage.getItem('gameLanguage') || 'ru';
            return textObj[lang] || Object.values(textObj)[0];
        }
    }
    
    // Добавляем CSS анимации для уведомлений
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translate(-50%, -100%);
                opacity: 0;
            }
            to {
                transform: translate(-50%, 0);
                opacity: 1;
            }
        }
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Инициализация достижений с задержкой для корректной загрузки игры
    setTimeout(() => {
        if (!window.achievementsSystem) {
            window.achievementsSystem = new AchievementsSystem();
        }
    }, 3000);
});