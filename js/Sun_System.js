import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class ParticlesSwarm {
    constructor(container, count = 20000) {
        this.count = count;
        this.container = container;
        this.speedMult = 1;
        
        // SETUP
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.01);
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 0, 100);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        // POST PROCESSING
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.strength = 1.8; bloomPass.radius = 0.4; bloomPass.threshold = 0;
        this.composer.addPass(bloomPass);

        // OBJECTS
        this.dummy = new THREE.Object3D();
        this.color = new THREE.Color();
        this.target = new THREE.Vector3();
        this.pColor = new THREE.Color();
        
        this.geometry = new THREE.TetrahedronGeometry(0.25);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.mesh);
        
        this.positions = [];
        for(let i=0; i<this.count; i++) {
            this.positions.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
            this.mesh.setColorAt(i, this.color.setHex(0x00ff88));
        }
        
        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate);
        const time = this.clock.getElapsedTime() * this.speedMult;
        
        if(this.material.uniforms && this.material.uniforms.uTime) {
            this.material.uniforms.uTime.value = time;
        }

        // API Stubs
        const PARAMS = {"speed":0.09,"tilt":0.35,"pScale":1.664,"orbitBright":0.27,"tailLen":2.35};
        const addControl = (id, l, min, max, val) => {
             return PARAMS[id] !== undefined ? PARAMS[id] : val;
        };
        const setInfo = () => {};
        const annotate = () => {};
        let THREE_LIB = THREE;
        
        let THREE_LIB = THREE;
        const count = this.count; // Alias for user code
        
        for(let i=0; i<this.count; i++) {
            let target = this.target;
            let color = this.pColor;
            
            // INJECTED CODE
            const speedMul = addControl("speed", "Time Scale", 0.0, 3.0, 0.4);
            const tilt = addControl("tilt", "View Tilt", 0.0, 1.57, 0.35);
            const planetScale = addControl("pScale", "Planet Size", 0.3, 2.5, 1.0);
            const orbitBright = addControl("orbitBright", "Orbit Visibility", 0.0, 1.0, 0.35);
            const tailLen = addControl("tailLen", "Comet Tails", 0.5, 3.0, 1.5);
            const t = time * speedMul;
            const n = i / count;
            const ct = Math.cos(tilt);
            const st = Math.sin(tilt);
            
            const sLim = 0.01;
            const pLim = 0.14;
            const rLim = 0.21;
            const oLim = 0.45;
            const aLim = 0.70;
            const cLim = 0.85;
            
            let x = 0, y = 0, z = 0, r = 0, g = 0, b = 0;
            
            if (n < sLim) {
              const sn = n / sLim;
              const phi = Math.acos(Math.max(-1.0, Math.min(1.0, 1.0 - 2.0 * sn)));
              const theta = 2.39996323 * i;
              const rad = 2.5 + 0.2 * Math.sin(t * 3.0);
              x = rad * Math.sin(phi) * Math.cos(theta);
              y = rad * Math.cos(phi);
              z = rad * Math.sin(phi) * Math.sin(theta);
              const pulse = 0.85 + 0.15 * Math.sin(t * 4.0 + i * 0.05);
              r = 1.0; g = 0.92 * pulse; b = 0.6 * pulse;
            } else if (n < pLim) {
              const pNorm = Math.max(0.0, (n - sLim) / (pLim - sLim));
              const pIdx = Math.min(8, Math.floor(pNorm * 9.0));
              const pLocal = (pNorm * 9.0) - pIdx;
              const phi = Math.acos(Math.max(-1.0, Math.min(1.0, 1.0 - 2.0 * pLocal)));
              const theta = 2.39996323 * (i - sLim * count);
            
              let au, per, cr, cg, cb, sz, off, dir;
              if (pIdx === 0) { au=0.39; per=0.24; cr=0.65; cg=0.60; cb=0.55; sz=0.18; off=0.0; dir=1.0; }
              else if (pIdx === 1) { au=0.72; per=0.62; cr=0.90; cg=0.80; cb=0.65; sz=0.32; off=1.2; dir=1.0; }
              else if (pIdx === 2) { au=1.00; per=1.00; cr=0.25; cg=0.50; cb=0.85; sz=0.34; off=2.5; dir=1.0; }
              else if (pIdx === 3) { au=1.52; per=1.88; cr=0.80; cg=0.35; cb=0.20; sz=0.22; off=3.8; dir=1.0; }
              else if (pIdx === 4) { au=5.20; per=11.86; cr=0.85; cg=0.70; cb=0.50; sz=0.80; off=0.5; dir=1.0; }
              else if (pIdx === 5) { au=9.58; per=29.46; cr=0.80; cg=0.75; cb=0.55; sz=0.70; off=1.8; dir=1.0; }
              else if (pIdx === 6) { au=19.2; per=84.0; cr=0.50; cg=0.75; cb=0.85; sz=0.45; off=3.0; dir=1.0; }
              else if (pIdx === 7) { au=30.1; per=164.8; cr=0.30; cg=0.45; cb=0.80; sz=0.42; off=4.2; dir=1.0; }
              else { au=39.5; per=248.0; cr=0.65; cg=0.55; cb=0.50; sz=0.16; off=5.5; dir=1.0; }
            
              const vR = 9.0 * Math.pow(au, 0.45) + 2.5;
              const omega = (1.5 / Math.pow(au, 1.5)) * dir;
              const angle = t * omega + off;
            
              const px = vR * Math.cos(angle);
              const pz = vR * Math.sin(angle);
              const pSz = sz * planetScale;
              x = px + pSz * Math.sin(phi) * Math.cos(theta);
              y = pSz * Math.cos(phi);
              z = pz + pSz * Math.sin(phi) * Math.sin(theta);
            
              const dist = Math.sqrt(px * px + pz * pz) + 0.1;
              const light = Math.max(0.25, 0.75 / (0.5 + dist * 0.04));
              r = cr * light; g = cg * light; b = cb * light;
            } else if (n < rLim) {
              const rNorm = Math.max(0.0, (n - pLim) / (rLim - pLim));
              const isSaturn = rNorm < 0.5 ? 1.0 : 0.0;
              const rLocal = rNorm < 0.5 ? rNorm * 2.0 : (rNorm - 0.5) * 2.0;
            
              let au, off, pSzBase;
              if (isSaturn > 0.5) { au=9.58; off=1.8; pSzBase=0.70; }
              else { au=19.2; off=3.0; pSzBase=0.45; }
            
              const vR = 9.0 * Math.pow(au, 0.45) + 2.5;
              const omega = 1.5 / Math.pow(au, 1.5);
              const angle = t * omega + off;
              const cx = vR * Math.cos(angle);
              const cy = 0.0;
              const cz = vR * Math.sin(angle);
            
              const hash = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
              const h = hash - Math.floor(hash);
              const theta = rLocal * 12.56637 + h * 2.5;
              const planetR = pSzBase * planetScale;
              const ringRad = planetR + 0.45 + h * 0.35;
            
              if (isSaturn > 0.5) {
                x = cx + ringRad * Math.cos(theta);
                y = cy + (h - 0.5) * 0.015;
                z = cz + ringRad * Math.sin(theta);
                r = 0.88; g = 0.78; b = 0.62;
              } else {
                x = cx + (h - 0.5) * 0.015;
                y = cy + ringRad * Math.cos(theta);
                z = cz + ringRad * Math.sin(theta);
                r = 0.42; g = 0.62; b = 0.72;
              }
            } else if (n < oLim) {
              const oNorm = Math.max(0.0, (n - rLim) / (oLim - rLim));
              const oIdx = Math.min(8, Math.floor(oNorm * 9.0));
              const oLocal = (oNorm * 9.0) - oIdx;
              const theta = oLocal * 6.2831853;
            
              let au;
              if (oIdx === 0) au=0.39; else if (oIdx === 1) au=0.72; else if (oIdx === 2) au=1.00;
              else if (oIdx === 3) au=1.52; else if (oIdx === 4) au=5.20; else if (oIdx === 5) au=9.58;
              else if (oIdx === 6) au=19.2; else if (oIdx === 7) au=30.1; else au=39.5;
            
              const vR = 9.0 * Math.pow(au, 0.45) + 2.5;
              const thick = 0.025 * Math.sin(theta * 15.0 + oLocal * 25.0);
              x = vR * Math.cos(theta) + thick;
              y = thick * 0.25;
              z = vR * Math.sin(theta);
              const bright = orbitBright * (0.35 + oIdx * 0.04);
              r = bright * 0.5; g = bright * 0.6; b = bright * 0.9;
            } else if (n < aLim) {
              const aNorm = Math.max(0.0, (n - oLim) / (aLim - oLim));
              const aAU = 2.2 + aNorm * 1.1;
              const aVR = 9.0 * Math.pow(aAU, 0.45) + 2.5;
              const aAngle = aNorm * 18.8495559 + t * 0.04;
              const hash = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
              const hFrac = hash - Math.floor(hash);
              const rJitter = (hFrac - 0.5) * 0.5;
              const yJitter = Math.sin(hFrac * 45.0) * 0.35;
              const aR = aVR + rJitter;
              x = aR * Math.cos(aAngle);
              y = yJitter;
              z = aR * Math.sin(aAngle);
              const isLarge = hFrac > 0.88 ? 1.0 : 0.0;
              const baseC = 0.28 + isLarge * 0.35;
              r = baseC + Math.sin(hFrac * 8.0) * 0.03;
              g = baseC * 0.88;
              b = baseC * 0.72;
            } else if (n < cLim) {
              const cNorm = Math.max(0.0, (n - aLim) / (cLim - aLim));
              const cIdx = Math.min(2, Math.floor(cNorm * 3.0));
              const cLocal = (cNorm * 3.0) - cIdx;
            
              let cT, cA, cE, cInc, cRot;
              if (cIdx === 0) { cT=20; cA=18; cE=0.967; cInc=2.85; cRot=0.4; }
              else if (cIdx === 1) { cT=50; cA=32; cE=0.995; cInc=1.55; cRot=1.1; }
              else { cT=35; cA=24; cE=0.99; cInc=2.18; cRot=0.7; }
            
              const currentPhase = ((t / cT) % 1.0 + 1.0) % 1.0;
              let trailOffset = cLocal - currentPhase;
              trailOffset = ((trailOffset % 1.0) + 1.0) % 1.0;
            
              const anomaly = (currentPhase - trailOffset) * 6.2831853;
              const cosA = Math.cos(anomaly);
              const rOrb = Math.max(0.2, cA * (1.0 - cE * cE) / (1.0 + cE * cosA));
              const visualR = 9.0 * Math.pow(rOrb, 0.45) + 2.5;
            
              let x0 = visualR * cosA;
              let y0 = visualR * Math.sin(anomaly) * 0.15;
              const cR = Math.cos(cRot), sR = Math.sin(cRot);
              const cI = Math.cos(cInc), sI = Math.sin(cInc);
            
              const x1 = x0 * cR - y0 * sR;
              const y1 = x0 * sR + y0 * cR;
              x = x1; y = y1 * cI; z = y1 * sI;
            
              const head = Math.exp(-trailOffset * 80.0);
              const tail = Math.exp(-trailOffset * 4.0 * tailLen) * (1.0 - head);
              const trailDim = Math.max(0.0, 1.0 - head - tail) * 0.12;
            
              const boost = head * 2.5;
              r = Math.min(1.0, 0.35 * tail + 0.2 * trailDim + boost);
              g = Math.min(1.0, 0.65 * tail + 0.35 * trailDim + boost * 0.85);
              b = Math.min(1.0, 0.85 * tail + 0.45 * trailDim + boost * 0.6);
            } else {
              const sn = (n - cLim) / (1.0 - cLim);
              const phi = Math.acos(Math.max(-1.0, Math.min(1.0, 1.0 - 2.0 * sn)));
              const theta = 2.39996323 * i;
              const rad = 70.0 + Math.sin(i * 0.02) * 15.0;
              x = rad * Math.sin(phi) * Math.cos(theta);
              y = rad * Math.cos(phi);
              z = rad * Math.sin(phi) * Math.sin(theta);
              const twinkle = 0.6 + 0.4 * Math.sin(t * 1.2 + i * 0.3);
              r = twinkle * 0.8; g = twinkle * 0.85; b = twinkle;
            }
            
            const yT = y * ct - z * st;
            const zT = y * st + z * ct;
            target.set(x, yT, zT);
            color.set(Math.min(1.0, Math.max(0.0, r)), Math.min(1.0, Math.max(0.0, g)), Math.min(1.0, Math.max(0.0, b)));
            
            if (i === 0) {
              setInfo("Солнечная система: Кольца и Орбиты", "Сатурн (экватор), Уран (меридиан), зазор +0.45");
              annotate("sun", new THREE.Vector3(0, 0, 0), "Солнце");
              annotate("belt", new THREE.Vector3(18, 0.4, 0), "Пояс астероидов");
              annotate("rings", new THREE.Vector3(30, 1, 0), "Кольца планет");
            }
            
            // UPDATE
            this.positions[i].lerp(this.target, 0.1);
            this.dummy.position.copy(this.positions[i]);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            this.mesh.setColorAt(i, this.pColor);
        }
        this.mesh.instanceMatrix.needsUpdate = true;
        this.mesh.instanceColor.needsUpdate = true;
        
        this.composer.render();
    }
    
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        this.scene.remove(this.mesh);
        this.renderer.dispose();
    }
}