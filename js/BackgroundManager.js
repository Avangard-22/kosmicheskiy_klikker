/**
 * BackgroundManager — Менеджер 3D-фона с привязкой к прогрессу и перелётам
 * Исправленная версия для GitHub Pages
 */
import { ParticlesSwarm } from './Sun_System.js';

export class BackgroundManager {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      maxAU: 39.5,
      cameraBaseZ: 120,
      cameraMinZ: 28,
      fovStart: 70,
      fovMin: 35,
      speedMultBase: 1.0,
      speedMultMax: 4.5,
      bloomStart: 1.4,
      bloomMax: 3.2,
      ...options
    };

    this.swarm = null;
    this.currentProgress = 0;
    this.currentAU = 0;
    this.isFlying = false;
    this._paused = false;
    this._events = {};
    this._animFrameId = null;

    this.planetData = new Map([
      ['sun', { au: 0.00, label: 'Солнце' }],
      ['mercury', { au: 0.39, label: 'Меркурий' }],
      ['venus', { au: 0.72, label: 'Венера' }],
      ['earth', { au: 1.00, label: 'Земля' }],
      ['mars', { au: 1.52, label: 'Марс' }],
      ['jupiter', { au: 5.20, label: 'Юпитер' }],
      ['saturn', { au: 9.58, label: 'Сатурн' }],
      ['uranus', { au: 19.2, label: 'Уран' }],
      ['neptune', { au: 30.1, label: 'Нептун' }],
      ['pluto', { au: 39.5, label: 'Плутон' }]
    ]);

    this._setupEventListeners();
  }

  init() {
    if (this.swarm) return this;
    try {
      this.swarm = new ParticlesSwarm(this.container, this.options.particleCount || 20000);
      this._applyVisuals(0);
      console.log('✅ BackgroundManager: Инициализирован');
    } catch (e) {
      console.error('❌ Ошибка инициализации фона:', e);
    }
    return this;
  }

  setProgress(percent, animate = true) {
    const clamped = Math.max(0, Math.min(100, percent));
    if (animate && !this.isFlying) {
      this._tweenToProgress(clamped, 600);
    } else {
      this._applyProgress(clamped);
    }
  }

  flyToPlanet(planetKey, duration = 2500) {
    const planet = this.planetData.get(planetKey?.toLowerCase());
    if (!planet) { console.warn(`⚠️ Планета "${planetKey}" не найдена`); return; }

    this.isFlying = true;
    const targetPercent = (planet.au / this.options.maxAU) * 100;
    this._emit('flight:start', { planet: planetKey, au: planet.au });
    
    if (this.swarm) this.swarm.speedMult = this.options.speedMultMax * 1.3;
    setTimeout(() => { if (this.swarm) this.swarm.speedMult = this.options.speedMultBase; }, 300);

    this._tweenToProgress(targetPercent, duration, () => {
      this.isFlying = false;
      this._emit('flight:end', { planet: planetKey, au: planet.au });
    });
  }

  setPlanet(planetName) {
    // Для обратной совместимости
  }

  pause() {
    this._paused = true;
    if (this.swarm) this.swarm.pause();
  }

  resume() {
    this._paused = false;
    if (this.swarm) this.swarm.resume(this.options.speedMultBase);
  }

  resize() {
    if (this.swarm) this.swarm.resize(window.innerWidth, window.innerHeight);
  }

  dispose() {
    this._paused = true;
    if (this._animFrameId) cancelAnimationFrame(this._animFrameId);
    if (this.swarm) { this.swarm.dispose(); this.swarm = null; }
    this._removeEventListeners();
  }

  on(event, callback) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(callback);
  }

  off(event, callback) {
    if (this._events[event]) this._events[event] = this._events[event].filter(cb => cb !== callback);
  }

  _applyProgress(percent) {
    this.currentProgress = percent;
    this.currentAU = (percent / 100) * this.options.maxAU;
    this._applyVisuals(percent);
  }

  _applyVisuals(percent) {
    const p = percent / 100;
    const curve = this._easeOutCubic(p);

    if (this.swarm?.camera) {
      const targetZ = this.options.cameraBaseZ - (curve * (this.options.cameraBaseZ - this.options.cameraMinZ));
      const targetY = curve * 18;
      const targetFOV = this.options.fovStart - (curve * (this.options.fovStart - this.options.fovMin));
      this.swarm.camera.position.set(0, targetY, targetZ);
      this.swarm.camera.fov = targetFOV;
      this.swarm.camera.updateProjectionMatrix();
    }

    if (this.swarm) {
      const speedCurve = this._easeInOutQuad(p);
      this.swarm.speedMult = this.options.speedMultBase + (speedCurve * (this.options.speedMultMax - this.options.speedMultBase));
    }

    if (this.swarm?.bloomPass) {
      this.swarm.bloomPass.strength = this.options.bloomStart + (curve * (this.options.bloomMax - this.options.bloomStart));
    }

    this._emit('progress:updated', {
      percent: Math.round(this.currentProgress),
      au: this.currentAU.toFixed(2),
      cameraZ: this.swarm?.camera.position.z.toFixed(1) || 0,
      fov: this.swarm?.camera.fov.toFixed(1) || 0
    });

    const closest = this._getClosestPlanet(this.currentAU);
    if (closest && closest.lastPercent !== Math.round(percent)) {
      closest.lastPercent = Math.round(percent);
      this._emit('planet:near', { planet: closest.key, au: closest.au, label: closest.label, distance: (this.currentAU - closest.au).toFixed(2) });
    }
  }

  _tweenToProgress(targetPercent, duration, onComplete) {
    const startPercent = this.currentProgress;
    const startTime = performance.now();
    const delta = targetPercent - startPercent;

    const step = (now) => {
      if (this._paused) { this._animFrameId = requestAnimationFrame(step); return; }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this._easeOutExpo(progress);
      this._applyProgress(startPercent + delta * eased);
      if (progress < 1) { this._animFrameId = requestAnimationFrame(step); }
      else { if (onComplete) onComplete(); }
    };
    this._animFrameId = requestAnimationFrame(step);
  }

  _getClosestPlanet(au) {
    let closest = null, minDist = Infinity;
    for (const [key, data] of this.planetData) {
      const dist = Math.abs(au - data.au);
      if (dist < minDist) { minDist = dist; closest = { key, au: data.au, label: data.label }; }
    }
    return closest;
  }

  _easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  _easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  _easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  _setupEventListeners() {
    this._handleResize = this._handleResize.bind(this);
    window.addEventListener('resize', this._handleResize);
  }

  _removeEventListeners() {
    window.removeEventListener('resize', this._handleResize);
  }

  _handleResize() { this.resize(); }

  _emit(event, data) {
    if (this._events[event]) this._events[event].forEach(cb => cb(data));
    window.dispatchEvent(new CustomEvent(`bg:${event}`, { detail: data }));
  }
}
