document.addEventListener('DOMContentLoaded', function() {
    // Проверка наличия основных элементов игры
    if (!document.getElementById('saveBtn')) return;
    
    class AchievementsSystem {
        constructor() {
            this.initAchievementsButton();
            this.createAchievementsModal();
            this.setupAchievements();
            this.loadAchievementsData();
            this.setupEventListeners();
            this.hookBoboActivation();
        }
        
        initAchievementsButton() {
            // Создаем кнопку достижений рядом с кнопками сохранения и магазина
            const achievementsBtn = document.createElement('button');
            achievementsBtn.id = 'achievementsBtn';
            achievementsBtn.innerHTML = '<i class="fas fa-trophy"></i>';
            achievementsBtn.title = this.getTranslation('achievementsButtonTitle');
            achievementsBtn.className = 'upgrade-btn';
            achievementsBtn.style.right = '105px';
            achievementsBtn.style.bottom = 'auto';
            achievementsBtn.style.top = '10px';
            
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
            // Создаем модальное окно достижений
            const modal = document.createElement('div');
            modal.id = 'achievementsModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(10px);
                display: none;
                z-index: 1000;
                justify-content: center;
                align-items: center;
            `;
            
            modal.innerHTML = `
                <div style="background: rgba(30, 20, 50, 0.9); border-radius: 15px; width: 90%; max-width: 600px; padding: 20px; border: 2px solid #ffd700; color: white; position: relative;">
                    <span id="closeAchievementsBtn" style="position: absolute; top: 10px; right: 15px; font-size: 1.5em; color: #aaa; cursor: pointer;">&times;</span>
                    <h2 style="text-align: center; color: #ffd700; margin-top: 0;">${this.getTranslation('achievementsTitle')}</h2>
                    <div id="achievementsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin: 20px 0;"></div>
                    <div style="text-align: center; margin-top: 15px; color: #a0d2ff;">
                        <p>${this.getTranslation('achievementsDescription')}</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('closeAchievementsBtn').addEventListener('click', () => this.closeAchievements());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeAchievements();
            });
        }
        
        openAchievements() {
            document.getElementById('achievementsModal').style.display = 'flex';
            this.updateAchievementsUI();
        }
        
        closeAchievements() {
            document.getElementById('achievementsModal').style.display = 'none';
        }
        
        setupAchievements() {
            this.achievements = {
                firstBlock: {
                    name: {
                        ru: "Первый шаг",
                        en: "First Step",
                        zh: "第一步"
                    },
                    description: {
                        ru: "Разрушить первый блок в космосе",
                        en: "Destroy your first block in space",
                        zh: "摧毁太空中的第一个方块"
                    },
                    icon: "fas fa-cube",
                    progress: 0,
                    target: 1,
                    unlocked: false,
                    reward: 50
                },
                crystalMaster: {
                    name: {
                        ru: "Хранитель кристаллов",
                        en: "Crystal Keeper",
                        zh: "水晶守护者"
                    },
                    description: {
                        ru: "Собрать 5000 кристаллов",
                        en: "Collect 5000 crystals",
                        zh: "收集5000水晶"
                    },
                    icon: "fas fa-gem",
                    progress: 0,
                    target: 5000,
                    unlocked: false,
                    reward: 200
                },
                planetaryExplorer: {
                    name: {
                        ru: "Планетарный исследователь",
                        en: "Planetary Explorer",
                        zh: "行星探险家"
                    },
                    description: {
                        ru: "Посетить 5 разных планет",
                        en: "Visit 5 different planets",
                        zh: "访问5颗不同行星"
                    },
                    icon: "fas fa-globe",
                    progress: 0,
                    target: 5,
                    unlocked: false,
                    reward: 300
                },
                critLegend: {
                    name: {
                        ru: "Легенда критов",
                        en: "Crit Legend",
                        zh: "暴击传奇"
                    },
                    description: {
                        ru: "Нанести 100 критических ударов",
                        en: "Deal 100 critical hits",
                        zh: "造成100次暴击"
                    },
                    icon: "fas fa-bolt",
                    progress: 0,
                    target: 100,
                    unlocked: false,
                    reward: 150
                },
                boboFanatic: {
                    name: {
                        ru: "Фанат Bobo",
                        en: "Bobo Fanatic",
                        zh: "Bobo狂热者"
                    },
                    description: {
                        ru: "Активировать помощника Bobo 25 раз",
                        en: "Activate Bobo helper 25 times",
                        zh: "激活Bobo助手25次"
                    },
                    icon: "fas fa-robot",
                    progress: 0,
                    target: 25,
                    unlocked: false,
                    reward: 250
                }
            };
        }
        
        updateAchievementsUI() {
            const grid = document.getElementById('achievementsGrid');
            if (!grid) return;
            
            grid.innerHTML = '';
            
            Object.values(this.achievements).forEach(achievement => {
                const achievementElement = document.createElement('div');
                achievementElement.className = achievement.unlocked ? 'achievement-item unlocked' : 'achievement-item';
                achievementElement.style.cssText = `
                    background: rgba(${achievement.unlocked ? '40, 80, 40' : '50, 40, 80'}, 0.8);
                    border-radius: 10px;
                    padding: 15px;
                    border: 1px solid ${achievement.unlocked ? '#4CAF50' : '#a0d2ff'};
                    transition: transform 0.3s;
                    display: flex;
                    gap: 15px;
                `;
                
                const progressPercent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
                
                achievementElement.innerHTML = `
                    <div style="font-size: 2em; width: 60px; display: flex; align-items: center; justify-content: center; color: ${achievement.unlocked ? '#ffd700' : '#a0d2ff'};">
                        <i class="${achievement.icon}"></i>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="color: ${achievement.unlocked ? '#ffd700' : '#a0d2ff'}; margin-top: 0;">${this.getTranslationForAchievement(achievement.name)}</h3>
                        <p style="color: #ccc; margin-bottom: 10px; font-size: 0.9em;">${this.getTranslationForAchievement(achievement.description)}</p>
                        <div style="height: 8px; background: rgba(255, 255, 255, 0.2); border-radius: 4px; margin: 8px 0; overflow: hidden;">
                            <div style="height: 100%; background: linear-gradient(90deg, ${achievement.unlocked ? '#ffd700, #ffa500' : '#2196F3, #4CAF50'}); border-radius: 4px; width: ${progressPercent}%;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.9em; color: #a0d2ff;">
                            <span>${achievement.progress}/${achievement.target}</span>
                            <span>+${achievement.reward} <i class="fas fa-gem"></i></span>
                        </div>
                    </div>
                `;
                
                grid.appendChild(achievementElement);
            });
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
                                this.updateAchievementProgress('firstBlock', 1);
                            }
                        });
                    });
                    observer.observe(gameArea, { childList: true });
                }
                
                // Отслеживаем критические удары через события
                document.addEventListener('critDamage', (e) => {
                    this.updateAchievementProgress('critLegend', 1);
                });
                
                // Отслеживаем изменение кристаллов
                const coinsElement = document.getElementById('coins-value');
                if (coinsElement) {
                    let lastCoinsValue = parseInt(coinsElement.textContent.replace(/\D/g, '')) || 0;
                    setInterval(() => {
                        const currentCoins = parseInt(coinsElement.textContent.replace(/\D/g, '')) || 0;
                        if (currentCoins > lastCoinsValue) {
                            const diff = currentCoins - lastCoinsValue;
                            this.updateAchievementProgress('crystalMaster', diff);
                            lastCoinsValue = currentCoins;
                        }
                    }, 1000);
                }
                
                // Отслеживаем смену локации
                const gameTitleElement = document.getElementById('gameTitle');
                if (gameTitleElement) {
                    let lastLocation = gameTitleElement.textContent;
                    setInterval(() => {
                        const currentLocation = gameTitleElement.textContent;
                        if (currentLocation !== lastLocation) {
                            this.updateAchievementProgress('planetaryExplorer', 1);
                            lastLocation = currentLocation;
                        }
                    }, 2000);
                }
            }, 2000);
        }
        
        // === ОСНОВНОЕ ИСПРАВЛЕНИЕ: ПЕРЕХВАТ АКТИВАЦИИ BOBO ===
        hookBoboActivation() {
            // Ждем полной загрузки игры
            const checkInterval = setInterval(() => {
                if (window.activateHelper && typeof window.activateHelper === 'function') {
                    clearInterval(checkInterval);
                    this.setupBoboHook();
                }
            }, 500);
            
            // Таймаут на случай, если функция activateHelper не появится
            setTimeout(() => {
                clearInterval(checkInterval);
            }, 10000);
        }
        
        setupBoboHook() {
            // Сохраняем оригинальную функцию
            const originalActivateHelper = window.activateHelper;
            
            // Создаем обертку
            window.activateHelper = () => {
                // Сначала вызываем оригинальную функцию
                const result = originalActivateHelper.call(window);
                
                // Затем обновляем прогресс достижения
                this.updateAchievementProgress('boboFanatic', 1);
                
                return result;
            };
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
                coinsElement.textContent = (currentCoins + achievement.reward).toLocaleString();
                window.coins = currentCoins + achievement.reward;
                
                // Показываем уведомление
                this.showAchievementNotification(achievementId);
            }
            
            this.saveAchievementsData();
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
                padding: 20px;
                border-radius: 15px;
                z-index: 2000;
                text-align: center;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.7);
                font-family: 'Orbitron', sans-serif;
                animation: slideDown 0.5s, fadeOut 0.5s 4.5s forwards;
            `;
            
            notification.innerHTML = `
                <div style="font-size: 2.5em; margin-bottom: 10px; color: #ffd700;">
                    <i class="${achievement.icon}"></i>
                </div>
                <h3 style="color: #ffd700; margin: 0 0 5px 0;">${this.getTranslation('achievementUnlocked')}</h3>
                <p style="font-size: 1.3em; margin: 0 0 8px 0; color: #fff;">${this.getTranslationForAchievement(achievement.name)}</p>
                <p style="color: #a0d2ff; font-size: 1.1em;">+${achievement.reward} <i class="fas fa-gem"></i></p>
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
                achievements: {}
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
                    Object.entries(data.achievements).forEach(([id, achievementData]) => {
                        if (this.achievements[id]) {
                            this.achievements[id].progress = achievementData.progress || 0;
                            this.achievements[id].unlocked = achievementData.unlocked || false;
                        }
                    });
                } catch (e) {
                    console.error('Error loading achievements ', e);
                }
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
    
    // Инициализация достижений с задержкой для корректной загрузки игры
    setTimeout(() => {
        if (!window.achievementsSystem) {
            window.achievementsSystem = new AchievementsSystem();
        }
    }, 3000);
});