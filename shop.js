document.addEventListener('DOMContentLoaded', function() {
    // Проверка наличия основных элементов игры
    if (!document.getElementById('saveBtn')) return;
    
    class ShopSystem {
        constructor() {
            this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            this.initShopButton();
            this.createShopModal();
            this.loadShopData();
            this.setupBonuses();
            this.setupMobileAdaptation();
        }
        
        setupMobileAdaptation() {
            // Проверяем ориентацию устройства
            this.checkOrientation();
            window.addEventListener('resize', () => this.checkOrientation());
            window.addEventListener('orientationchange', () => this.checkOrientation());
        }
        
        checkOrientation() {
            const modalContent = document.querySelector('#shopModal > div');
            if (!modalContent) return;
            
            if (this.isMobile) {
                if (window.innerHeight < window.innerWidth) {
                    // Landscape режим
                    modalContent.style.maxWidth = '90%';
                    modalContent.style.maxHeight = '95vh';
                    modalContent.style.padding = '15px';
                } else {
                    // Portrait режим
                    modalContent.style.maxWidth = '95%';
                    modalContent.style.maxHeight = '85vh';
                    modalContent.style.padding = '12px';
                }
            }
        }
        
        initShopButton() {
            // Создаем кнопку магазина рядом с кнопкой сохранения
            const shopBtn = document.createElement('button');
            shopBtn.id = 'shopBtn';
            shopBtn.innerHTML = '<i class="fas fa-store"></i>';
            shopBtn.title = this.getTranslation('shopButtonTitle');
            shopBtn.className = 'upgrade-btn';
            shopBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: ${this.isMobile ? '50px' : '60px'};
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
                color: #ffd700;
                transition: transform 0.1s;
                backdrop-filter: blur(4px);
            `;
            
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
            // Создаем модальное окно магазина с адаптивным дизайном
            const modal = document.createElement('div');
            modal.id = 'shopModal';
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
                    <span id="closeShopBtn" style="
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
                        <i class="fas fa-store"></i> ${this.getTranslation('shopTitle')}
                    </h2>
                    
                    <div id="shopItemsContainer" style="
                        display: grid;
                        grid-template-columns: ${this.isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))'};
                        gap: ${this.isMobile ? '12px' : '15px'};
                        margin: ${this.isMobile ? '10px 0' : '20px 0'};
                        padding-bottom: 10px;
                    "></div>
                    
                    <div id="activeBonusesContainer" style="
                        margin-top: ${this.isMobile ? '15px' : '20px'};
                        padding-top: ${this.isMobile ? '10px' : '15px'};
                        border-top: 1px solid rgba(255, 215, 0, 0.3);
                    "></div>
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
            
            // Блокировка жестов масштабирования в модальном окне
            modal.addEventListener('touchmove', (e) => {
                if (e.target === modal || e.target.closest('#shopModal > div')) {
                    // Разрешаем скроллинг только внутри модального окна
                    e.stopPropagation();
                }
            }, { passive: false });
        }
        
        openShop() {
            document.getElementById('shopModal').style.display = 'flex';
            this.updateShopUI();
            this.checkOrientation();
        }
        
        closeShop() {
            document.getElementById('shopModal').style.display = 'none';
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
                    duration: 0,
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
                bonusElement.className = 'shop-bonus-item';
                bonusElement.style.cssText = `
                    background: rgba(50, 40, 80, 0.8);
                    border-radius: ${this.isMobile ? '8px' : '10px'};
                    padding: ${this.isMobile ? '12px' : '15px'};
                    border: 1px solid #a0d2ff;
                    transition: transform 0.3s;
                    min-height: ${this.isMobile ? '120px' : '140px'};
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                `;
                
                const isActive = bonus.isActive && ((bonus.endTime > Date.now()) || (bonus.blocksLeft > 0));
                
                bonusElement.innerHTML = `
                    <div style="flex: 1;">
                        <h3 style="
                            color: #ffd700;
                            margin: 0 0 8px 0;
                            font-size: ${this.isMobile ? '1em' : '1.1em'};
                            line-height: 1.3;
                        ">
                            ${this.getTranslationForBonus(bonus.name)}
                            ${isActive ? ' <span style="color:#4CAF50;font-size:0.8em;">(АКТИВЕН)</span>' : ''}
                        </h3>
                        <p style="
                            color: #a0d2ff;
                            margin: 0 0 ${this.isMobile ? '8px' : '10px'} 0;
                            font-size: ${this.isMobile ? '0.85em' : '0.9em'};
                            line-height: 1.4;
                        ">
                            ${this.getTranslationForBonus(bonus.description)}
                        </p>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-weight: bold; color: #a0d2ff; font-size: ${this.isMobile ? '1em' : '1.1em'}">
                            ${bonus.cost.toLocaleString()} <i class="fas fa-gem"></i>
                        </div>
                        <button class="buy-bonus-btn" data-id="${id}" style="
                            background: ${isActive ? 'linear-gradient(135deg, #666, #444)' : 'linear-gradient(135deg, #4a3d86, #6a5add)'};
                            color: white;
                            border: none;
                            border-radius: 6px;
                            padding: ${this.isMobile ? '6px 12px' : '8px 16px'};
                            cursor: ${isActive ? 'not-allowed' : 'pointer'};
                            font-family: 'Orbitron', sans-serif;
                            transition: transform 0.1s;
                            font-size: ${this.isMobile ? '0.85em' : '0.9em'};
                            min-height: ${this.isMobile ? '36px' : '40px'};
                            min-width: 80px;
                        ">
                            ${isActive ? this.getTranslation('activeButton') : this.getTranslation('buyButton')}
                        </button>
                    </div>
                `;
                
                container.appendChild(bonusElement);
                
                if (isActive) {
                    bonusElement.style.borderColor = '#ffd700';
                    bonusElement.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.3)';
                }
            });
            
            this.updateActiveBonusesUI();
            
            // Добавляем обработчики для кнопок
            document.querySelectorAll('.buy-bonus-btn').forEach(btn => {
                if (!btn.disabled) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const bonusId = e.target.dataset.id;
                        this.buyBonus(bonusId);
                    });
                    btn.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const bonusId = e.target.dataset.id;
                        this.buyBonus(bonusId);
                    }, { passive: false });
                }
            });
        }
        
        updateActiveBonusesUI() {
            const container = document.getElementById('activeBonusesContainer');
            container.innerHTML = '<h3 style="color: #ffd700; margin: 0 0 10px 0; font-size: ' + (this.isMobile ? '1.1em' : '1.2em') + ';">' + 
                                  this.getTranslation('activeBonuses') + '</h3>';
            
            let hasActive = false;
            Object.entries(this.bonuses).forEach(([id, bonus]) => {
                if (bonus.isActive) {
                    if ((bonus.endTime > Date.now()) || (bonus.blocksLeft > 0)) {
                        hasActive = true;
                        const timeLeft = bonus.endTime ? Math.ceil((bonus.endTime - Date.now()) / 1000) : bonus.blocksLeft;
                        const bonusElement = document.createElement('div');
                        bonusElement.style.cssText = `
                            background: rgba(70, 60, 100, 0.7);
                            padding: ${this.isMobile ? '6px' : '8px'};
                            margin: 4px 0;
                            border-radius: 5px;
                            border-left: 3px solid #ffd700;
                            font-size: ${this.isMobile ? '0.9em' : '1em'};
                        `;
                        bonusElement.innerHTML = `
                            <strong>${this.getTranslationForBonus(bonus.name)}</strong>: 
                            ${bonus.endTime ? `${timeLeft}сек` : `${timeLeft} блоков`}
                        `;
                        container.appendChild(bonusElement);
                    } else {
                        bonus.isActive = false;
                    }
                }
            });
            
            if (!hasActive) {
                container.innerHTML += `<p style="color: #a0d2ff; font-style: italic; text-align: center; padding: 10px 0;">
                    ${this.getTranslation('noActiveBonuses')}
                </p>`;
            }
        }
        
        buyBonus(bonusId) {
            const bonus = this.bonuses[bonusId];
            const coinsElement = document.getElementById('coins-value');
            
            if (!coinsElement) return;
            
            const currentCoins = parseInt(coinsElement.textContent.replace(/\D/g, '')) || 0;
            
            if (currentCoins >= bonus.cost) {
                // Вычитаем кристаллы
                const newCoins = currentCoins - bonus.cost;
                coinsElement.textContent = newCoins.toLocaleString();
                if (typeof window.coins !== 'undefined') {
                    window.coins = newCoins;
                }
                
                // Активируем бонус
                this.activateBonus(bonusId);
                
                // Обновляем UI
                this.updateShopUI();
                
                // Сохраняем состояние
                this.saveShopData();
                
                // Показываем уведомление
                this.showBonusNotification(bonusId);
            } else {
                this.showTooltip(this.getTranslation('notEnoughCrystals'));
                setTimeout(() => this.hideTooltip(), 2000);
            }
        }
        
        // ... остальные методы остаются без изменений ...

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
                padding: ${this.isMobile ? '15px' : '20px'};
                border-radius: ${this.isMobile ? '10px' : '15px'};
                z-index: 3000;
                text-align: center;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.7);
                font-family: 'Orbitron', sans-serif;
                max-width: ${this.isMobile ? '90%' : '300px'};
                word-wrap: break-word;
            `;
            
            notification.innerHTML = `
                <h3 style="color: #ffd700; margin-top: 0; font-size: ${this.isMobile ? '1.2em' : '1.3em'}">
                    ${this.getTranslation('bonusActivated')}
                </h3>
                <p style="font-size: ${this.isMobile ? '1em' : '1.1em'}; margin: 10px 0;">
                    ${this.getTranslationForBonus(bonus.name)}
                </p>
                <p style="color: #a0d2ff; font-size: ${this.isMobile ? '0.9em' : '1em'}">
                    ${this.getTranslation('duration')}: ${bonus.endTime ? Math.floor(bonus.duration/1000) : bonus.blocksLeft}${bonus.endTime ? 'сек' : ''}
                </p>
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
        
        // ... остальные методы остаются без изменений ...
    }
    
    // Инициализация магазина
    window.shopSystem = new ShopSystem();
});