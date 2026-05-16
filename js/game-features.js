// game-features.js
(function() {
    'use strict';
    const CFG = window.GAME_CONFIG;
    const UI = window.GAME_UI;

    window.GAME_FEATURES = {
        createExplosion: function(block) {
            const rect = block.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const explosionSize = /Android|webOS|iPhone/i.test(navigator.userAgent) ? 150 : 200;
            const explosion = document.createElement('div');
            explosion.className = 'explosion';
            explosion.style.left = centerX + 'px'; explosion.style.top = centerY + 'px';
            explosion.style.width = explosionSize + 'px'; explosion.style.height = explosionSize + 'px';
            document.body.appendChild(explosion);
            const particleCount = explosionSize === 150 ? 20 : 25;
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'explosion-particle';
                particle.style.left = centerX + 'px'; particle.style.top = centerY + 'px';
                const size = explosionSize === 150 ? 10 : 12;
                particle.style.width = size + 'px'; particle.style.height = size + 'px';
                particle.style.backgroundColor = CFG.locations[window.gameState.currentLocation].blockColors[Math.floor(Math.random() * 4)];
                const angle = Math.random() * Math.PI * 2; const dist = 50 + Math.random() * 100;
                particle.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
                particle.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
                document.body.appendChild(particle);
                setTimeout(() => { if (particle.parentNode) document.body.removeChild(particle); }, 800);
            }
            setTimeout(() => { if (explosion.parentNode) document.body.removeChild(explosion); }, 600);
        },

        applyUpgradePenalty: function() {
            if (!window.gameState || window.GAME_CORE.getBonus('isInvincible', false)) {
                console.log("🛡️ Неуязвимость активна. Штраф отменён!"); return;
            }
            const upgrades = [
                { n:'Сила удара', g:()=>window.gameState.clickUpgradeLevel, s:v=>window.gameState.clickUpgradeLevel=v },
                { n:'Шанс крита', g:()=>window.gameState.critChanceUpgradeLevel, s:v=>{ window.gameState.critChanceUpgradeLevel=v; window.gameState.critChance=Math.max(0.001,0.001+v*0.001); } },
                { n:'Множитель крита', g:()=>window.gameState.critMultiplierUpgradeLevel, s:v=>{ window.gameState.critMultiplierUpgradeLevel=v; window.gameState.critMultiplier=Math.max(2,2+v*0.2); } },
                { n:'Урон Bobo', g:()=>window.gameState.helperUpgradeLevel, s:v=>window.gameState.helperUpgradeLevel=v }
            ];
            const u = upgrades[Math.floor(Math.random()*upgrades.length)];
            const pct = CFG.balanceConfig.penaltyMin + Math.random()*(CFG.balanceConfig.penaltyMax-CFG.balanceConfig.penaltyMin);
            const cur = u.g(); if(cur <=0) return;
            u.s(Math.max(0, Math.floor(cur*(1-pct))));
            window.gameState.clickPower = window.GAME_CORE.calculateClickPower(); 
            const pan = document.getElementById('penaltyAnnounce');
            if(pan){ 
                pan.innerHTML=`<div style="font-size:1.5em;color:#ff6b6b;font-weight:bold;">⚠️ ШТРАФ!</div><div style="font-size:1.1em;color:#fff;margin:10px 0;">${u.n} -${Math.round(pct*100)}%</div>`; 
                pan.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,rgba(255,107,107,0.95),rgba(255,68,68,0.95));color:#fff;padding:30px 40px;border-radius:15px;z-index:2000;text-align:center;font-family:Orbitron,sans-serif;box-shadow:0 10px 40px rgba(255,107,107,0.5);border:3px solid #ff4444;'; 
                pan.style.opacity='1'; pan.style.display='block'; 
                setTimeout(()=>{pan.style.opacity='0';setTimeout(()=>pan.style.display='none',500);},2500); 
            }
            window.GAME_CORE.playSound('penaltySound');
            if(window.telegramHaptic) window.telegramHaptic.error(); else if(navigator.vibrate) navigator.vibrate([200,100,200]);
            UI.updateHUD(); UI.updateUpgradeButtons(); window.saveGame();
        },

        activateHelper: function() {
            if (!window.gameState) return;
            if (window.gameState.helperActive && window.GAME_CORE.helperInterval) clearInterval(window.GAME_CORE.helperInterval);
            if (window.gameState.helperActive && window.GAME_CORE.helperTimer) clearInterval(window.GAME_CORE.helperTimer);
            window.gameState.helperActive = true; window.gameState.helperTimeLeft = 60000; window.gameState.boboCoinBonus = 0.2;
            window.GAME_CORE.createHelperElement();
            window.GAME_CORE.helperInterval = setInterval(() => { 
                if (window.gameState?.helperActive && window.GAME_CORE.currentBlock && window.gameState.gameActive && !window.GAME_CORE.isGamePaused) window.GAME_CORE.helperAttack(); 
            }, 1500);
            window.GAME_CORE.helperTimer = setInterval(() => {
                if (!window.gameState || !window.gameState.helperActive) { if (window.GAME_CORE.helperTimer) clearInterval(window.GAME_CORE.helperTimer); window.GAME_CORE.helperTimer = null; return; }
                window.gameState.helperTimeLeft -= 1000;
                if (window.gameState.helperTimeLeft <= 0) {
                    window.gameState.helperActive = false;
                    if (window.GAME_CORE.helperInterval) { clearInterval(window.GAME_CORE.helperInterval); window.GAME_CORE.helperInterval = null; }
                    if (window.GAME_CORE.helperTimer) { clearInterval(window.GAME_CORE.helperTimer); window.GAME_CORE.helperTimer = null; }
                    window.gameState.boboCoinBonus = 0;
                    if (window.GAME_CORE.helperElement) { window.GAME_CORE.helperElement.style.opacity = '0'; setTimeout(() => { if (window.GAME_CORE.helperElement?.parentNode) document.body.removeChild(window.GAME_CORE.helperElement); window.GAME_CORE.helperElement = null; }, 300); }
                    UI.updateUpgradeButtons();
                    if (window.showTooltip) { window.showTooltip(window.translations[window.currentLanguage].tooltips.helperEnd); setTimeout(window.hideTooltip, 1500); }
                }
            }, 1000);
            UI.updateUpgradeButtons(); UI.updateHUD();
            if (window.showTooltip) { window.showTooltip(window.translations[window.currentLanguage].tooltips.helperAvailable); setTimeout(window.hideTooltip, 2500); }
            window.saveGame();
        },

        helperAttack: function() {
            if (!window.GAME_CORE.currentBlock || !window.gameState || !window.gameState.helperActive || !window.GAME_CORE.helperElement || window.GAME_CORE.isGamePaused) return;
            window.GAME_CORE.createHelperEffect();
            let dmg = window.gameState.clickPower * (1 + window.gameState.helperDamageBonus) * (1 + window.gameState.helperUpgradeLevel * 0.2) * window.GAME_CORE.getBonus('getDamageMultiplier', 1);
            window.GAME_CORE.currentBlockHealth -= dmg;
            window.gameState.totalDamageDealt += dmg;
            window.gameMetrics.totalClicks = (window.gameMetrics.totalClicks || 0) + 1;
            window.GAME_CORE.createDamageText(Math.round(dmg), window.GAME_CORE.currentBlock, '#69f0ae');
            UI.checkLocationUpgrade();
            if (window.GAME_CORE.currentBlockHealth <= 0) window.GAME_CORE.destroyBlock(window.GAME_CORE.currentBlock);
            else { window.GAME_CORE.currentBlock.textContent = Math.floor(window.GAME_CORE.currentBlockHealth); window.GAME_CORE.updateCracks(window.GAME_CORE.currentBlock, window.GAME_CORE.currentBlockHealth); }
        },

        buyClickPower: function() {
            if (!window.gameState) return;
            const cost = Math.floor(CFG.costs.baseClickUpgradeCost * Math.pow(1.5, window.gameState.clickUpgradeLevel));
            if (window.gameState.coins >= cost) {
                window.gameState.coins -= cost; window.gameState.clickUpgradeLevel++; 
                window.gameState.clickPower = window.GAME_CORE.calculateClickPower();
                window.gameMetrics.upgradesBought = (window.gameMetrics.upgradesBought || 0) + 1;
                if (window.achievementsSystem) window.achievementsSystem.incrementUpgrades(1);
                UI.updateHUD(); UI.updateUpgradeButtons(); window.GAME_CORE.playSound('upgradeSound');
                const btn = document.getElementById('upgradeClickBtn'); 
                if (btn) { btn.style.transform = 'scale(1.1)'; btn.style.boxShadow = '0 0 20px #4CAF50'; setTimeout(() => { btn.style.transform = 'scale(1)'; btn.style.boxShadow = ''; }, 300); }
                if (window.showTooltip) { window.showTooltip(window.formatString(window.translations[window.currentLanguage].tooltips.clickPowerUpgrade, { power: Math.round(window.gameState.clickPower) })); setTimeout(window.hideTooltip, 1500); }
                window.saveGame();
            }
        },

        buyHelper: function() {
            if (!window.gameState) return;
            const baseCost = Math.floor(CFG.costs.baseHelperUpgradeCost * Math.pow(1.4, window.gameState.helperUpgradeLevel));
            const actBonus = Math.floor((window.gameState.helperActivations || 0) / 10);
            const cost = Math.floor(baseCost * (1 + actBonus * 0.2));
            if (window.gameState.coins >= cost) {
                window.gameState.coins -= cost; window.gameState.helperActivations = (window.gameState.helperActivations || 0) + 1;
                window.gameMetrics.helpersBought = (window.gameMetrics.helpersBought || 0) + 1;
                if (window.achievementsSystem) window.achievementsSystem.incrementHelpers(1);
                const btn = document.getElementById('upgradeHelperBtn'); 
                if (btn) { btn.style.transform = 'scale(1.1)'; btn.style.boxShadow = '0 0 20px #4CAF50'; setTimeout(() => { btn.style.transform = 'scale(1)'; btn.style.boxShadow = ''; }, 300); }
                this.activateHelper(); UI.updateHUD(); UI.updateUpgradeButtons(); window.saveGame();
            }
        }
        // ... (Остальные функции покупки buyCritChance, buyCritMultiplier, buyHelperDamage аналогично)
    };
})();