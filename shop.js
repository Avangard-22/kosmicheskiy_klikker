document.addEventListener('DOMContentLoaded', function() {
    // Проверка наличия основных элементов игры
    if (!document.getElementById('saveBtn')) return;
    
    class ShopSystem {
        constructor() {
            this.initShopButton();
            this.createShopModal();
            this.loadShopData();
            this.setupBonuses();
        }
        
        initShopButton() {
            // Создаем кнопку магазина рядом с кнопкой сохранения
            const shopBtn = document.createElement('button');
            shopBtn.id = 'shopBtn';
            shopBtn.innerHTML = '<i class="fas fa-store"></i>';
            shopBtn.title = this.getTranslation('shopButtonTitle');
            shopBtn.className = 'upgrade-btn';
            shopBtn.style.right = '60px';
            shopBtn.style.bottom = 'auto';
            shopBtn.style.top = '10px';
            
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn && saveBtn.parentNode) {
                saveBtn.parentNode.insertBefore(shopBtn, saveBtn.nextSibling);
            }
            
            shopBtn.addEventListener('click', () => this.openShop());
            shopBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.openShop();
            }, { passive: false });
        }
        
        createShopModal() {
            // Создаем модальное окно магазина
            const modal = document.createElement('div');
            modal.id = 'shopModal';
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
                    <span id="closeShopBtn" style="position: absolute; top: 10px; right: 15px; font-size: 1.5em; color: #aaa; cursor: pointer;">&times;</span>
                    <h2 style="text-align: center; color: #ffd700; margin-top: 0;">${this.getTranslation('shopTitle')}</h2>
                    <div id="shopItemsContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin: 20px 0;"></div>
                    <div id="activeBonusesContainer" style="margin-top: 20px;"></div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('closeShopBtn').addEventListener('click', () => this.closeShop());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeShop();
            });
        }
        
        openShop() {
            document.getElementById('shopModal').style.display = 'flex';
            this.updateShopUI();
            
            // Пауза игры при открытии магазина
            this.pauseGame();
        }
        
        closeShop() {
            document.getElementById('shopModal').style.display = 'none';
            
            // Возобновление игры при закрытии магазина
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
        
        setupBonuses() {
            this.bonuses = {
                doubleCrystals: {
                    name: {
                        ru: "x2 Кристаллы",
                        en: "x2 Crystals", 
                        zh: "x2 水晶"
                    },
                    description: {
                        ru: "Удваивает количество получаемых кристаллов на 30 секунд",
                        en: "Doubles crystals received for 30 seconds",
                        zh: "水晶获取量翻倍(30秒)"
                    },
                    cost: 100,
                    duration: 30000,
                    isActive: false,
                    endTime: 0
                },
                increasedPower: {
                    name: {
                        ru: "+50% Силы",
                        en: "+50% Power",
                        zh: "+50% 力量"
                    },
                    description: {
                        ru: "Увеличивает силу удара на 50% на 45 секунд",
                        en: "Increases click power by 50% for 45 seconds",
                        zh: "点击力量增加50%(45秒)"
                    },
                    cost: 150,
                    duration: 45000,
                    isActive: false,
                    endTime: 0
                },
                criticalBoost: {
                    name: {
                        ru: "Мега-Крит",
                        en: "Mega-Crit",
                        zh: "超级暴击"
                    },
                    description: {
                        ru: "+300% к множителю критического урона на 20 секунд",
                        en: "+300% to critical damage multiplier for 20 seconds",
                        zh: "暴击伤害倍数+300%(20秒)"
                    },
                    cost: 300,
                    duration: 20000,
                    isActive: false,
                    endTime: 0
                },
                timeSlow: {
                    name: {
                        ru: "Замедление времени",
                        en: "Time Slow",
                        zh: "时间减慢"
                    },
                    description: {
                        ru: "Замедляет все блоки на 40% на 25 секунд",
                        en: "Slows all blocks by 40% for 25 seconds",
                        zh: "所有方块速度减慢40%(25秒)"
                    },
                    cost: 200,
                    duration: 25000,
                    isActive: false,
                    endTime: 0
                },
                energySurge: {
                    name: {
                        ru: "Энергетический всплеск",
                        en: "Energy Surge",
                        zh: "能量爆发"
                    },
                    description: {
                        ru: "Следующие 10 блоков имеют 50% шанс быть редкими",
                        en: "Next 10 blocks have 50% chance to be rare",
                        zh: "接下来10个方块有50%几率为稀有"
                    },
                    cost: 400,
                    duration: 0, // Длительность определяется количеством блоков
                    isActive: false,
                    blocksLeft: 0
                }
            };
        }
        
        updateShopUI() {
            const container = document.getElementById('shopItemsContainer');
            container.innerHTML = '';
            
            Object.entries(this.bonuses).forEach(([id, bonus]) => {
                const bonusElement = document.createElement('div');
                bonusElement.style.cssText = `
                    background: rgba(50, 40, 80, 0.8);
                    border-radius: 10px;
                    padding: 15px;
                    border: 1px solid #a0d2ff;
                    transition: transform 0.3s;
                `;
                
                bonusElement.innerHTML = `
                    <h3 style="color: #ffd700; margin-top: 0;">${this.getTranslationForBonus(bonus.name)}</h3>
                    <p style="color: #a0d2ff; margin-bottom: 10px;">${this.getTranslationForBonus(bonus.description)}</p>
                    <div style="font-weight: bold; color: #a0d2ff; margin: 10px 0; font-size: 1.1em;">
                        ${bonus.cost.toLocaleString()} <i class="fas fa-gem"></i>
                    </div>
                    <button class="buy-bonus-btn" data-id="${id}" style="
                        background: linear-gradient(135deg, #4a3d86, #6a5add);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        padding: 8px;
                        cursor: pointer;
                        width: 100%;
                        font-family: 'Orbitron', sans-serif;
                        transition: transform 0.1s;
                    ">${this.getTranslation('buyButton')}</button>
                `;
                
                container.appendChild(bonusElement);
                
                if (bonus.isActive && ((bonus.endTime > Date.now()) || (bonus.blocksLeft > 0))) {
                    bonusElement.querySelector('.buy-bonus-btn').disabled = true;
                    bonusElement.querySelector('.buy-bonus-btn').innerText = this.getTranslation('activeButton');
                    bonusElement.style.borderColor = '#ffd700';
                    bonusElement.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.5)';
                }
            });
            
            this.updateActiveBonusesUI();
            
            // Добавляем обработчики для кнопок
            document.querySelectorAll('.buy-bonus-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const bonusId = e.target.dataset.id;
                    this.buyBonus(bonusId);
                });
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    const bonusId = e.target.dataset.id;
                    this.buyBonus(bonusId);
                }, { passive: false });
            });
        }
        
        updateActiveBonusesUI() {
            const container = document.getElementById('activeBonusesContainer');
            container.innerHTML = '<h3 style="color: #ffd700;">' + this.getTranslation('activeBonuses') + '</h3>';
            
            let hasActive = false;
            Object.entries(this.bonuses).forEach(([id, bonus]) => {
                if (bonus.isActive) {
                    if ((bonus.endTime > Date.now()) || (bonus.blocksLeft > 0)) {
                        hasActive = true;
                        const timeLeft = bonus.endTime ? Math.ceil((bonus.endTime - Date.now()) / 1000) : bonus.blocksLeft;
                        const bonusElement = document.createElement('div');
                        bonusElement.style.cssText = `
                            background: rgba(70, 60, 100, 0.7);
                            padding: 8px;
                            margin: 5px 0;
                            border-radius: 5px;
                            border-left: 3px solid #ffd700;
                        `;
                        bonusElement.innerHTML = `
                            <strong>${this.getTranslationForBonus(bonus.name)}</strong>: 
                            ${bonus.endTime ? `${timeLeft}s` : `${timeLeft} blocks`}
                        `;
                        container.appendChild(bonusElement);
                    } else {
                        bonus.isActive = false;
                    }
                }
            });
            
            if (!hasActive) {
                container.innerHTML += `<p>${this.getTranslation('noActiveBonuses')}</p>`;
            }
        }
        
        buyBonus(bonusId) {
            const bonus = this.bonuses[bonusId];
            const coinsElement = document.getElementById('coins-value');
            
            if (!coinsElement) return;
            
            const currentCoins = parseInt(coinsElement.textContent.replace(/\D/g, ''));
            
            if (currentCoins >= bonus.cost) {
                // Вычитаем кристаллы
                coinsElement.textContent = (currentCoins - bonus.cost).toLocaleString();
                
                // Активируем бонус
                this.activateBonus(bonusId);
                
                // Обновляем UI
                this.updateShopUI();
                
                // Сохраняем состояние
                this.saveShopData();
            } else {
                this.showTooltip(this.getTranslation('notEnoughCrystals'));
                setTimeout(() => this.hideTooltip(), 2000);
            }
        }
        
        activateBonus(bonusId) {
            const bonus = this.bonuses[bonusId];
            bonus.isActive = true;
            
            switch(bonusId) {
                case 'doubleCrystals':
                    this.applyDoubleCrystalsBonus(bonus);
                    break;
                case 'increasedPower':
                    this.applyIncreasedPowerBonus(bonus);
                    break;
                case 'criticalBoost':
                    this.applyCriticalBoostBonus(bonus);
                    break;
                case 'timeSlow':
                    this.applyTimeSlowBonus(bonus);
                    break;
                case 'energySurge':
                    this.applyEnergySurgeBonus(bonus);
                    break;
            }
            
            this.showBonusNotification(bonusId);
        }
        
        applyDoubleCrystalsBonus(bonus) {
            bonus.endTime = Date.now() + bonus.duration;
            
            // Сохраняем оригинальную функцию добавления кристаллов
            const originalAddCoins = window.addCoins || ((amount) => {
                const coinsElement = document.getElementById('coins-value');
                if (!coinsElement) return;
                let current = parseInt(coinsElement.textContent.replace(/\D/g, '')) || 0;
                coinsElement.textContent = (current + amount).toLocaleString();
                window.coins = current + amount;
            });
            
            // Переопределяем функцию для двойных кристаллов
            window.addCoins = (amount) => {
                if (this.bonuses.doubleCrystals.isActive && this.bonuses.doubleCrystals.endTime > Date.now()) {
                    originalAddCoins(amount * 2);
                } else {
                    originalAddCoins(amount);
                    window.addCoins = originalAddCoins;
                }
            };
            
            // Проверка окончания бонуса
            setTimeout(() => {
                if (this.bonuses.doubleCrystals.isActive && this.bonuses.doubleCrystals.endTime <= Date.now()) {
                    this.bonuses.doubleCrystals.isActive = false;
                    window.addCoins = originalAddCoins;
                    this.updateShopUI();
                    this.saveShopData();
                }
            }, bonus.duration + 100);
        }
        
        applyIncreasedPowerBonus(bonus) {
            bonus.endTime = Date.now() + bonus.duration;
            
            const originalClickPower = parseInt(document.getElementById('clickPower-value')?.textContent || '1');
            document.getElementById('clickPower-value').textContent = Math.round(originalClickPower * 1.5);
            
            // Проверка окончания бонуса
            setTimeout(() => {
                if (this.bonuses.increasedPower.isActive && this.bonuses.increasedPower.endTime <= Date.now()) {
                    this.bonuses.increasedPower.isActive = false;
                    document.getElementById('clickPower-value').textContent = originalClickPower;
                    this.updateShopUI();
                    this.saveShopData();
                }
            }, bonus.duration + 100);
        }
        
        applyCriticalBoostBonus(bonus) {
            bonus.endTime = Date.now() + bonus.duration;
            
            const originalCritMult = parseFloat(document.getElementById('critMultiplier-value')?.textContent.replace('x', '') || '2.0');
            document.getElementById('critMultiplier-value').textContent = `x${(originalCritMult * 4).toFixed(1)}`;
            
            // Проверка окончания бонуса
            setTimeout(() => {
                if (this.bonuses.criticalBoost.isActive && this.bonuses.criticalBoost.endTime <= Date.now()) {
                    this.bonuses.criticalBoost.isActive = false;
                    document.getElementById('critMultiplier-value').textContent = `x${originalCritMult.toFixed(1)}`;
                    this.updateShopUI();
                    this.saveShopData();
                }
            }, bonus.duration + 100);
        }
        
        applyTimeSlowBonus(bonus) {
            bonus.endTime = Date.now() + bonus.duration;
            
            // Уменьшаем скорость блоков
            window.blockSpeed = (window.blockSpeed || 20) * 0.6;
            
            // Проверка окончания бонуса
            setTimeout(() => {
                if (this.bonuses.timeSlow.isActive && this.bonuses.timeSlow.endTime <= Date.now()) {
                    this.bonuses.timeSlow.isActive = false;
                    window.blockSpeed = (window.blockSpeed || 12) / 0.6;
                    this.updateShopUI();
                    this.saveShopData();
                }
            }, bonus.duration + 100);
        }
        
        applyEnergySurgeBonus(bonus) {
            bonus.blocksLeft = 10;
            
            // Перехватываем создание блоков
            const originalCreateBlock = window.createMovingBlock;
            window.createMovingBlock = () => {
                if (this.bonuses.energySurge.isActive && this.bonuses.energySurge.blocksLeft > 0) {
                    // Временно увеличиваем шанс редкого блока
                    const originalGetRareBlock = window.getRareBlockType;
                    window.getRareBlockType = () => {
                        return Math.random() < 0.5 ? 
                            Object.keys(window.rareBlocks)[Math.floor(Math.random() * Object.keys(window.rareBlocks).length)] : 
                            null;
                    };
                    
                    // Вызываем оригинальное создание блока
                    const result = originalCreateBlock.call(window);
                    
                    // Восстанавливаем оригинальную функцию после создания
                    window.getRareBlockType = originalGetRareBlock;
                    
                    // Уменьшаем счетчик
                    this.bonuses.energySurge.blocksLeft--;
                    
                    // Если это последний блок с бонусом, деактивируем его
                    if (this.bonuses.energySurge.blocksLeft <= 0) {
                        this.bonuses.energySurge.isActive = false;
                        this.updateShopUI();
                        this.saveShopData();
                    }
                    
                    return result;
                } else {
                    // Если бонус закончился, восстанавливаем оригинальную функцию
                    window.createMovingBlock = originalCreateBlock;
                    return originalCreateBlock.call(window);
                }
            };
        }
        
        showBonusNotification(bonusId) {
            const bonus = this.bonuses[bonusId];
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(80, 40, 120, 0.95);
                border: 3px solid #ffd700;
                color: white;
                padding: 20px;
                border-radius: 15px;
                z-index: 2000;
                text-align: center;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.7);
                font-family: 'Orbitron', sans-serif;
            `;
            
            notification.innerHTML = `
                <h3 style="color: #ffd700; margin-top: 0;">${this.getTranslation('bonusActivated')}</h3>
                <p style="font-size: 1.2em; margin: 10px 0;">${this.getTranslationForBonus(bonus.name)}</p>
                <p style="color: #a0d2ff;">${this.getTranslation('duration')}: ${Math.floor(bonus.duration/1000)}s</p>
            `;
            
            document.body.appendChild(notification);
            
            // Анимация появления и исчезания
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
            }, 1500);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 2000);
        }
        
        showTooltip(text) {
            const tooltip = document.getElementById("tooltip");
            if (tooltip) {
                tooltip.innerHTML = text;
                tooltip.style.opacity = "1";
            }
        }
        
        hideTooltip() {
            const tooltip = document.getElementById("tooltip");
            if (tooltip) tooltip.style.opacity = "0";
        }
        
        saveShopData() {
            const saveData = {
                bonuses: {}
            };
            
            Object.entries(this.bonuses).forEach(([id, bonus]) => {
                saveData.bonuses[id] = {
                    isActive: bonus.isActive,
                    endTime: bonus.endTime,
                    blocksLeft: bonus.blocksLeft || 0
                };
            });
            
            localStorage.setItem('cosmicShopData', JSON.stringify(saveData));
        }
        
        loadShopData() {
            const saved = localStorage.getItem('cosmicShopData');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    Object.entries(data.bonuses).forEach(([id, bonusData]) => {
                        if (this.bonuses[id]) {
                            this.bonuses[id].isActive = bonusData.isActive;
                            this.bonuses[id].endTime = bonusData.endTime || 0;
                            this.bonuses[id].blocksLeft = bonusData.blocksLeft || 0;
                            
                            // Проверка истекших бонусов
                            if (this.bonuses[id].isActive) {
                                if ((this.bonuses[id].endTime > 0 && this.bonuses[id].endTime < Date.now()) || 
                                    (this.bonuses[id].blocksLeft <= 0 && this.bonuses[id].endTime === 0)) {
                                    this.bonuses[id].isActive = false;
                                }
                            }
                        }
                    });
                } catch (e) {
                    console.error('Error loading shop data:', e);
                }
            }
        }
        
        getTranslation(key) {
            const translations = {
                ru: {
                    shopButtonTitle: "Магазин временных бонусов",
                    shopTitle: "МАГАЗИН ВРЕМЕННЫХ БОНУСОВ",
                    buyButton: "Купить",
                    activeButton: "Активен",
                    activeBonuses: "Активные бонусы:",
                    noActiveBonuses: "Нет активных бонусов",
                    notEnoughCrystals: "Недостаточно кристаллов!",
                    bonusActivated: "БОНУС АКТИВИРОВАН!",
                    duration: "Длительность"
                },
                en: {
                    shopButtonTitle: "Temporary bonuses shop",
                    shopTitle: "TEMPORARY BONUSES SHOP",
                    buyButton: "Buy",
                    activeButton: "Active",
                    activeBonuses: "Active bonuses:",
                    noActiveBonuses: "No active bonuses",
                    notEnoughCrystals: "Not enough crystals!",
                    bonusActivated: "BONUS ACTIVATED!",
                    duration: "Duration"
                },
                zh: {
                    shopButtonTitle: "限时奖励商店",
                    shopTitle: "限时奖励商店",
                    buyButton: "购买",
                    activeButton: "活动中",
                    activeBonuses: "活动奖励：",
                    noActiveBonuses: "没有活动奖励",
                    notEnoughCrystals: "水晶不足！",
                    bonusActivated: "奖励已激活！",
                    duration: "持续时间"
                }
            };
            
            const lang = localStorage.getItem('gameLanguage') || 'ru';
            return translations[lang][key] || key;
        }
        
        getTranslationForBonus(textObj) {
            const lang = localStorage.getItem('gameLanguage') || 'ru';
            return textObj[lang] || Object.values(textObj)[0];
        }
    }
    
    // Инициализация магазина
     window.shopSystem = new ShopSystem();
});