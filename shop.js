document.addEventListener('DOMContentLoaded', function() {
    // Проверка наличия основных элементов игры
    if (!document.getElementById('saveBtn')) return;
    
    class ShopSystem {
        constructor() {
            this.initShopButton();
            this.createShopModal();
            this.loadShopData();
            this.setupBonuses();
            this.setupMobileOptimizations();
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
            modal.className = 'shop-modal';
            
            modal.innerHTML = `
                <div class="shop-modal-content">
                    <span id="closeShopBtn" class="shop-close-btn">&times;</span>
                    <h2 class="shop-title">${this.getTranslation('shopTitle')}</h2>
                    <div id="shopItemsContainer" class="shop-items-container"></div>
                    <div id="activeBonusesContainer" class="active-bonuses-container"></div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('closeShopBtn').addEventListener('click', () => this.closeShop());
            document.getElementById('closeShopBtn').addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.closeShop();
            }, { passive: false });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeShop();
            });
            
            // Предотвращаем закрытие при клике внутри контента
            modal.querySelector('.shop-modal-content').addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        setupMobileOptimizations() {
            // Оптимизации для мобильных устройств
            this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Предотвращаем масштабирование при фокусе на инпутах
            document.addEventListener('touchstart', function(e) {
                if (e.target.classList.contains('buy-bonus-btn')) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            // Обработка ориентации устройства
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.updateShopUI(), 100);
            });
            
            // Обработка изменения размера окна
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimer);
                this.resizeTimer = setTimeout(() => this.updateShopUI(), 250);
            });
        }
        
        openShop() {
            const modal = document.getElementById('shopModal');
            if (modal) {
                modal.style.display = 'flex';
                
                // Для мобильных: добавляем класс для блокировки прокрутки фона
                if (this.isMobile) {
                    document.body.style.overflow = 'hidden';
                }
                
                // Фокус на кнопке закрытия для доступности
                setTimeout(() => {
                    const closeBtn = document.getElementById('closeShopBtn');
                    if (closeBtn) closeBtn.focus();
                }, 100);
                
                this.updateShopUI();
            }
        }
        
        closeShop() {
            const modal = document.getElementById('shopModal');
            if (modal) {
                modal.style.display = 'none';
                
                // Для мобильных: восстанавливаем прокрутку
                if (this.isMobile) {
                    document.body.style.overflow = '';
                }
                
                // Возвращаем фокус на кнопку магазина
                const shopBtn = document.getElementById('shopBtn');
                if (shopBtn) shopBtn.focus();
            }
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
            const activeContainer = document.getElementById('activeBonusesContainer');
            if (!container || !activeContainer) return;
            
            container.innerHTML = '';
            
            Object.entries(this.bonuses).forEach(([id, bonus]) => {
                const bonusElement = document.createElement('div');
                bonusElement.className = 'bonus-item';
                
                const isActive = bonus.isActive && ((bonus.endTime > Date.now()) || (bonus.blocksLeft > 0));
                const buttonText = isActive ? this.getTranslation('activeButton') : this.getTranslation('buyButton');
                const buttonDisabled = isActive || (this.getCurrentCoins() < bonus.cost);
                
                bonusElement.innerHTML = `
                    <h3 class="bonus-title">${this.getTranslationForBonus(bonus.name)}</h3>
                    <p class="bonus-description">${this.getTranslationForBonus(bonus.description)}</p>
                    <div class="bonus-cost">
                        <i class="fas fa-gem"></i>
                        <span>${bonus.cost.toLocaleString()}</span>
                    </div>
                    <button class="buy-bonus-btn" data-id="${id}" 
                            ${buttonDisabled ? 'disabled' : ''}
                            ${isActive ? 'class="active"' : ''}>
                        ${buttonText}
                    </button>
                `;
                
                container.appendChild(bonusElement);
                
                // Добавляем обработчик с учетом мобильных устройств
                const button = bonusElement.querySelector('.buy-bonus-btn');
                if (button && !button.disabled) {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.buyBonus(id);
                    });
                    
                    button.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        this.buyBonus(id);
                    }, { passive: false });
                }
            });
            
            this.updateActiveBonusesUI();
        }
        
        updateActiveBonusesUI() {
            const container = document.getElementById('activeBonusesContainer');
            if (!container) return;
            
            container.innerHTML = '<h3 style="color: #ffd700; margin-bottom: 10px;">' + this.getTranslation('activeBonuses') + '</h3>';
            
            let hasActive = false;
            Object.entries(this.bonuses).forEach(([id, bonus]) => {
                if (bonus.isActive) {
                    if ((bonus.endTime > Date.now()) || (bonus.blocksLeft > 0)) {
                        hasActive = true;
                        const timeLeft = bonus.endTime ? Math.ceil((bonus.endTime - Date.now()) / 1000) : bonus.blocksLeft;
                        const unit = bonus.endTime ? 'сек' : 'блоков';
                        
                        const bonusElement = document.createElement('div');
                        bonusElement.style.cssText = `
                            background: rgba(70, 60, 100, 0.7);
                            padding: 8px 12px;
                            margin: 5px 0;
                            border-radius: 5px;
                            border-left: 3px solid #ffd700;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        `;
                        bonusElement.innerHTML = `
                            <strong style="color: #a0d2ff;">${this.getTranslationForBonus(bonus.name)}</strong>
                            <span style="color: #ffd700;">${timeLeft} ${unit}</span>
                        `;
                        container.appendChild(bonusElement);
                    } else {
                        bonus.isActive = false;
                    }
                }
            });
            
            if (!hasActive) {
                container.innerHTML += `<p style="color: #a0d2ff; text-align: center; padding: 10px;">${this.getTranslation('noActiveBonuses')}</p>`;
            }
        }
        
        getCurrentCoins() {
            const coinsElement = document.getElementById('coins-value');
            if (!coinsElement) return 0;
            return parseInt(coinsElement.textContent.replace(/\D/g, '')) || 0;
        }
        
        buyBonus(bonusId) {
            const bonus = this.bonuses[bonusId];
            const currentCoins = this.getCurrentCoins();
            
            if (currentCoins >= bonus.cost) {
                // Вычитаем кристаллы
                const coinsElement = document.getElementById('coins-value');
                if (coinsElement) {
                    coinsElement.textContent = (currentCoins - bonus.cost).toLocaleString();
                    window.coins = currentCoins - bonus.cost;
                }
                
                // Активируем бонус
                this.activateBonus(bonusId);
                
                // Обновляем UI
                this.updateShopUI();
                
                // Сохраняем состояние
                this.saveShopData();
                
                // Показываем подтверждение
                this.showBonusNotification(bonusId);
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
            
            const clickPowerElement = document.getElementById('clickPower-value');
            if (clickPowerElement) {
                const originalClickPower = parseInt(clickPowerElement.textContent || '1');
                clickPowerElement.textContent = Math.round(originalClickPower * 1.5);
                
                // Проверка окончания бонуса
                setTimeout(() => {
                    if (this.bonuses.increasedPower.isActive && this.bonuses.increasedPower.endTime <= Date.now()) {
                        this.bonuses.increasedPower.isActive = false;
                        clickPowerElement.textContent = originalClickPower;
                        this.updateShopUI();
                        this.saveShopData();
                    }
                }, bonus.duration + 100);
            }
        }
        
        applyCriticalBoostBonus(bonus) {
            bonus.endTime = Date.now() + bonus.duration;
            
            const critMultElement = document.getElementById('critMultiplier-value');
            if (critMultElement) {
                const originalCritMult = parseFloat(critMultElement.textContent.replace('x', '') || '2.0');
                critMultElement.textContent = `x${(originalCritMult * 4).toFixed(1)}`;
                
                // Проверка окончания бонуса
                setTimeout(() => {
                    if (this.bonuses.criticalBoost.isActive && this.bonuses.criticalBoost.endTime <= Date.now()) {
                        this.bonuses.criticalBoost.isActive = false;
                        critMultElement.textContent = `x${originalCritMult.toFixed(1)}`;
                        this.updateShopUI();
                        this.saveShopData();
                    }
                }, bonus.duration + 100);
            }
        }
        
        applyTimeSlowBonus(bonus) {
            bonus.endTime = Date.now() + bonus.duration;
            
            // Уменьшаем скорость блоков
            if (typeof window.blockSpeed !== 'undefined') {
                window.blockSpeed = window.blockSpeed * 0.6;
                
                // Проверка окончания бонуса
                setTimeout(() => {
                    if (this.bonuses.timeSlow.isActive && this.bonuses.timeSlow.endTime <= Date.now()) {
                        this.bonuses.timeSlow.isActive = false;
                        window.blockSpeed = window.blockSpeed / 0.6;
                        this.updateShopUI();
                        this.saveShopData();
                    }
                }, bonus.duration + 100);
            }
        }
        
        applyEnergySurgeBonus(bonus) {
            bonus.blocksLeft = 10;
            
            // Перехватываем создание блоков
            if (typeof window.createMovingBlock === 'function') {
                const originalCreateBlock = window.createMovingBlock;
                window.createMovingBlock = () => {
                    if (this.bonuses.energySurge.isActive && this.bonuses.energySurge.blocksLeft > 0) {
                        // Временно увеличиваем шанс редкого блока
                        if (typeof window.getRareBlockType === 'function') {
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
                        }
                    } else {
                        // Если бонус закончился, восстанавливаем оригинальную функцию
                        window.createMovingBlock = originalCreateBlock;
                        return originalCreateBlock.call(window);
                    }
                };
            }
        }
        
        showBonusNotification(bonusId) {
            const bonus = this.bonuses[bonusId];
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, rgba(80, 40, 120, 0.95), rgba(60, 30, 90, 0.98));
                border: 3px solid #ffd700;
                color: white;
                padding: 20px;
                border-radius: 15px;
                z-index: 2000;
                text-align: center;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.7);
                font-family: 'Orbitron', sans-serif;
                width: ${this.isMobile ? '85%' : '300px'};
                max-width: 400px;
            `;
            
            notification.innerHTML = `
                <h3 style="color: #ffd700; margin-top: 0; font-size: ${this.isMobile ? '1.2em' : '1.3em'};">${this.getTranslation('bonusActivated')}</h3>
                <p style="font-size: ${this.isMobile ? '1.1em' : '1.2em'}; margin: 10px 0;">${this.getTranslationForBonus(bonus.name)}</p>
                <p style="color: #a0d2ff; font-size: ${this.isMobile ? '0.9em' : '1em'};">${this.getTranslation('duration')}: ${Math.floor(bonus.duration/1000)}s</p>
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