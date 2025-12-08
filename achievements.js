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
            this.setupMobileOptimizations();
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
            modal.className = 'achievements-modal';
            
            modal.innerHTML = `
                <div class="achievements-modal-content">
                    <span id="closeAchievementsBtn" class="achievements-close-btn">&times;</span>
                    <h2 class="achievements-title">${this.getTranslation('achievementsTitle')}</h2>
                    <div id="achievementsGrid" class="achievements-grid"></div>
                    <div style="text-align: center; margin-top: 15px; color: #a0d2ff; padding: 10px;">
                        <p>${this.getTranslation('achievementsDescription')}</p>
                    </div>
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
            
            // Предотвращаем закрытие при клике внутри контента
            modal.querySelector('.achievements-modal-content').addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        setupMobileOptimizations() {
            // Обработка ориентации устройства
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.updateAchievementsUI(), 100);
            });
            
            // Обработка изменения размера окна
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimer);
                this.resizeTimer = setTimeout(() => this.updateAchievementsUI(), 250);
            });
            
            // Предотвращаем масштабирование при фокусе
            document.addEventListener('touchstart', function(e) {
                if (e.target.classList.contains('achievement-item')) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
        
        openAchievements() {
            const modal = document.getElementById('achievementsModal');
            if (modal) {
                modal.style.display = 'flex';
                
                // Для мобильных: добавляем класс для блокировки прокрутки фона
                if (this.isMobile) {
                    document.body.style.overflow = 'hidden';
                }
                
                // Фокус на кнопке закрытия для доступности
                setTimeout(() => {
                    const closeBtn = document.getElementById('closeAchievementsBtn');
                    if (closeBtn) closeBtn.focus();
                }, 100);
                
                this.updateAchievementsUI();
            }
        }
        
        closeAchievements() {
            const modal = document.getElementById('achievementsModal');
            if (modal) {
                modal.style.display = 'none';
                
                // Для мобильных: восстанавливаем прокрутку
                if (this.isMobile) {
                    document.body.style.overflow = '';
                }
                
                // Возвращаем фокус на кнопку достижений
                const achievementsBtn = document.getElementById('achievementsBtn');
                if (achievementsBtn) achievementsBtn.focus();
            }
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
            
            Object.values(this.achievements).forEach((achievement, index) => {
                const achievementElement = document.createElement('div');
                achievementElement.className = achievement.unlocked ? 'achievement-item unlocked' : 'achievement-item';
                
                const progressPercent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
                
                achievementElement.innerHTML = `
                    <div class="achievement-icon">
                        <i class="${achievement.icon}"></i>
                    </div>
                    <div class="achievement-content">
                        <h3 class="achievement-name">${this.getTranslationForAchievement(achievement.name)}</h3>
                        <p class="achievement-description">${this.getTranslationForAchievement(achievement.description)}</p>
                        <div class="achievement-progress-bar">
                            <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="achievement-progress-text">
                            <span>${achievement.progress}/${achievement.target}</span>
                            <span>${progressPercent}%</span>
                        </div>
                        <div class="achievement-reward">
                            <i class="fas fa-gem"></i>
                            <span>+${achievement.reward}</span>
                        </div>
                    </div>
                    ${!achievement.unlocked ? `
                        <div class="locked-overlay">
                            <i class="fas fa-lock"></i>
                        </div>
                    ` : ''}
                `;
                
                grid.appendChild(achievementElement);
                
                // Добавляем задержку для анимации появления
                setTimeout(() => {
                    achievementElement.style.opacity = '1';
                    achievementElement.style.transform = 'translateX(0)';
                }, index * 100);
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
                    this.coinsCheckInterval = setInterval(() => {
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
                    this.locationCheckInterval = setInterval(() => {
                        const currentLocation = gameTitleElement.textContent;
                        if (currentLocation !== lastLocation) {
                            this.updateAchievementProgress('planetaryExplorer', 1);
                            lastLocation = currentLocation;
                        }
                    }, 2000);
                }
                
                // Отслеживаем активацию Bobo
                this.setupBoboTracking();
            }, 2000);
        }
        
        setupBoboTracking() {
            // Отслеживаем активацию помощника Bobo через проверку состояния кнопки
            const helperBtn = document.getElementById('upgradeHelperBtn');
            if (helperBtn) {
                let lastClickTime = 0;
                const clickHandler = () => {
                    const now = Date.now();
                    if (now - lastClickTime > 1000) { // Защита от двойного клика
                        this.updateAchievementProgress('boboFanatic', 1);
                        lastClickTime = now;
                    }
                };
                
                helperBtn.addEventListener('click', clickHandler);
                helperBtn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    clickHandler();
                }, { passive: false });
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
            
            // Обновляем UI, если открыто окно достижений
            if (document.getElementById('achievementsModal')?.style.display === 'flex') {
                this.updateAchievementsUI();
            }
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
                window.coins = newCoins;
                
                // Показываем уведомление
                this.showAchievementNotification(achievementId);
            }
            
            this.saveAchievementsData();
        }
        
        showAchievementNotification(achievementId) {
            const achievement = this.achievements[achievementId];
            const notification = document.createElement('div');
            notification.className = 'achievement-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, rgba(80, 40, 120, 0.95), rgba(60, 30, 90, 0.98));
                border: 3px solid #ffd700;
                color: white;
                padding: ${this.isMobile ? '15px' : '20px'};
                border-radius: 15px;
                z-index: 2000;
                text-align: center;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.7);
                font-family: 'Orbitron', sans-serif;
                width: ${this.isMobile ? '85%' : '300px'};
                max-width: 400px;
            `;
            
            notification.innerHTML = `
                <div style="font-size: ${this.isMobile ? '2em' : '2.5em'}; margin-bottom: 10px; color: #ffd700;">
                    <i class="${achievement.icon}"></i>
                </div>
                <h3 style="color: #ffd700; margin: 0 0 5px 0; font-size: ${this.isMobile ? '1.2em' : '1.3em'};">${this.getTranslation('achievementUnlocked')}</h3>
                <p style="font-size: ${this.isMobile ? '1.1em' : '1.3em'}; margin: 0 0 8px 0; color: #fff;">${this.getTranslationForAchievement(achievement.name)}</p>
                <p style="color: #a0d2ff; font-size: ${this.isMobile ? '1em' : '1.1em'};">
                    <i class="fas fa-gem" style="color: #ffd54f;"></i>
                    <span style="font-weight: bold; margin-left: 5px;">+${achievement.reward} кристаллов</span>
                </p>
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
                    console.error('Error loading achievements data:', e);
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
        
        // Очистка интервалов при уничтожении
        cleanup() {
            if (this.coinsCheckInterval) clearInterval(this.coinsCheckInterval);
            if (this.locationCheckInterval) clearInterval(this.locationCheckInterval);
        }
    }
    
    // Инициализация достижений с задержкой для корректной загрузки игры
    setTimeout(() => {
        if (!window.achievementsSystem) {
            window.achievementsSystem = new AchievementsSystem();
            
            // Очистка при разгрузке страницы
            window.addEventListener('beforeunload', () => {
                if (window.achievementsSystem) {
                    window.achievementsSystem.cleanup();
                }
            });
        }
    }, 3000);
});