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
                    max-width: ${this.isMobile ? '95%' : '600px'};
                    max-height: ${this.isMobile ? '90vh' : '80vh'};
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
                    border-radius: ${this.isMobile ? '8px' : '10px'};
                    padding: ${this.isMobile ? '12px' : '15px'};
                    border: 1px solid ${achievement.unlocked ? '#4CAF50' : '#a0d2ff'};
                    transition: transform 0.3s;
                    display: flex;
                    gap: ${this.isMobile ? '12px' : '15px'};
                    min-height: ${this.isMobile ? '110px' : '130px'};
                `;
                
                const progressPercent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
                
                achievementElement.innerHTML = `
                    <div style="
                        font-size: ${this.isMobile ? '1.8em' : '2em'};
                        width: ${this.isMobile ? '50px' : '60px'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: ${achievement.unlocked ? '#ffd700' : '#a0d2ff'};
                    ">
                        <i class="${achievement.icon}"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="
                            color: ${achievement.unlocked ? '#ffd700' : '#a0d2ff'};
                            margin: 0 0 ${this.isMobile ? '4px' : '8px'} 0;
                            font-size: ${this.isMobile ? '1em' : '1.1em'};
                            line-height: 1.3;
                            word-wrap: break-word;
                        ">
                            ${this.getTranslationForAchievement(achievement.name)}
                            ${achievement.unlocked ? ' <span style="color:#4CAF50;font-size:0.8em;">✓</span>' : ''}
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
                                background: linear-gradient(90deg, ${achievement.unlocked ? '#ffd700, #ffa500' : '#2196F3, #4CAF50'});
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
                if (typeof window.coins !== 'undefined') {
                    window.coins = currentCoins + achievement.reward;
                }
                
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
            
            notification.innerHTML = `
                <div style="font-size: ${this.isMobile ? '2em' : '2.5em'}; margin-bottom: ${this.isMobile ? '8px' : '10px'}; color: #ffd700;">
                    <i class="${achievement.icon}"></i>
                </div>
                <h3 style="color: #ffd700; margin: 0 0 5px 0; font-size: ${this.isMobile ? '1.1em' : '1.2em'}">
                    ${this.getTranslation('achievementUnlocked')}
                </h3>
                <p style="font-size: ${this.isMobile ? '1em' : '1.1em'}; margin: 0 0 8px 0; color: #fff;">
                    ${this.getTranslationForAchievement(achievement.name)}
                </p>
                <p style="color: #a0d2ff; font-size: ${this.isMobile ? '0.9em' : '1em'};">
                    +${achievement.reward} <i class="fas fa-gem"></i>
                </p>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 5000);
        }
        
        // ... остальные методы остаются без изменений ...

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