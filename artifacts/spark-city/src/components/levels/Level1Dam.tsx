import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

export const Level1Dam = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [waterFlow, setWaterFlow] = useState(0);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const turbineRef = useRef<THREE.Group | null>(null);
  const generatorMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const flowParticlesRef = useRef<THREE.Points | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    setVoltMessage("Adjust the water gate slider! We need flow between 50–75% to generate stable electricity.");

    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);

    camera.position.set(0, 18, 30);
    controls.target.set(0, 3, 0);

    // ── Green terrain ──
    const terrain = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 60),
      new THREE.MeshStandardMaterial({ color: 0x7ec88e, roughness: 0.9 })
    );
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -0.3;
    scene.add(terrain);

    // ── Background mountains ──
    const hillColors = [0x6dba7d, 0x5fac6f, 0x78c485];
    const hillPositions: [number, number, number][] = [[-18, 0, -18], [14, 0, -22], [28, 0, -15]];
    hillPositions.forEach(([x, y, z], i) => {
      const hill = new THREE.Mesh(
        new THREE.ConeGeometry(7 + i * 2, 10 + i * 2, 4),
        new THREE.MeshStandardMaterial({ color: hillColors[i], roughness: 0.9 })
      );
      hill.rotation.y = Math.PI / 4;
      hill.position.set(x, y + (5 + i), z);
      scene.add(hill);
    });

    // ── Water reservoir (left) ──
    const reservoir = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.4, 18),
      new THREE.MeshStandardMaterial({ color: 0x5dade2, transparent: true, opacity: 0.85, roughness: 0.1, metalness: 0.1 })
    );
    reservoir.position.set(-17, 0.2, 0);
    scene.add(reservoir);

    // ── Dam wall ──
    const dam = new THREE.Mesh(
      new THREE.BoxGeometry(3, 9, 18),
      new THREE.MeshStandardMaterial({ color: 0xb0a090, roughness: 0.85 })
    );
    dam.position.set(-5, 4, 0);
    dam.castShadow = true;
    scene.add(dam);

    // ── Tailwater (right of dam) ──
    const tailwater = new THREE.Mesh(
      new THREE.BoxGeometry(28, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: 0x5dade2, transparent: true, opacity: 0.7 })
    );
    tailwater.position.set(8, 0.1, 0);
    scene.add(tailwater);

    // ── Penstock pipe ──
    const penstock = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 10, 16),
      new THREE.MeshStandardMaterial({ color: 0x607080, metalness: 0.6, roughness: 0.4 })
    );
    penstock.rotation.z = Math.PI / 2;
    penstock.position.set(0, 1.5, 0);
    scene.add(penstock);

    // ── Powerhouse building ──
    const powerhouse = new THREE.Mesh(
      new THREE.BoxGeometry(6, 6, 10),
      new THREE.MeshStandardMaterial({ color: 0xc8b8a2, roughness: 0.8 })
    );
    powerhouse.position.set(7, 3, 0);
    scene.add(powerhouse);

    // ── Green roof ──
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(7, 0.8, 11),
      new THREE.MeshStandardMaterial({ color: 0x5fa86e, roughness: 0.9 })
    );
    roof.position.set(7, 6.4, 0);
    scene.add(roof);

    // ── Turbine group ──
    const turbine = new THREE.Group();
    turbine.position.set(5, 1.5, 0);

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 1.8, 20),
      new THREE.MeshStandardMaterial({ color: 0xe8a020, metalness: 0.7, roughness: 0.3 })
    );
    hub.rotation.x = Math.PI / 2;
    turbine.add(hub);

    for (let i = 0; i < 6; i++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 3.2, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xcc8810, metalness: 0.5 })
      );
      blade.position.y = 1.6;
      const pivot = new THREE.Group();
      pivot.rotation.z = (Math.PI * 2 / 6) * i;
      pivot.add(blade);
      turbine.add(pivot);
    }
    scene.add(turbine);
    turbineRef.current = turbine;

    // ── Generator core (glows when running) ──
    const genMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.7, roughness: 0.3 });
    generatorMatRef.current = genMat;
    const genCore = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32), genMat);
    genCore.rotation.x = Math.PI / 2;
    genCore.position.set(9.5, 2.5, 0);
    scene.add(genCore);

    // ── Water flow particles ──
    const pCount = 150;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 2;
      pPos[i + 1] = (Math.random() - 0.5) * 1.5;
      pPos[i + 2] = (Math.random() - 0.5) * 1.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0xaaddff, size: 0.18, transparent: true, opacity: 0.9 })
    );
    particles.position.set(-2, 1.5, 0);
    scene.add(particles);
    flowParticlesRef.current = particles;

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => { cancelAnimationFrame(frameId); cleanup(); };
  }, []);

  useEffect(() => {
    let frameId: number;
    const loop = () => {
      frameId = requestAnimationFrame(loop);
      if (turbineRef.current) {
        turbineRef.current.rotation.z -= (waterFlow / 100) * 0.06;
      }
      if (flowParticlesRef.current) {
        const pos = flowParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < pos.length; i += 3) {
          pos[i] += (waterFlow / 100) * 0.12;
          if (pos[i] > 4) pos[i] = -4;
        }
        flowParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
      if (generatorMatRef.current) {
        if (waterFlow >= 50 && waterFlow <= 75) {
          generatorMatRef.current.emissive.setHex(0x22bb44);
          generatorMatRef.current.emissiveIntensity = 0.8;
        } else if (waterFlow > 75) {
          generatorMatRef.current.emissive.setHex(0xff2200);
          generatorMatRef.current.emissiveIntensity = 1.0;
        } else {
          generatorMatRef.current.emissive.setHex(0x000000);
          generatorMatRef.current.emissiveIntensity = 0;
        }
      }
    };
    loop();

    const timer = setTimeout(() => {
      if (waterFlow >= 50 && waterFlow <= 75) {
        setVoltMessage("⭐ Perfect flow! Potential energy → Kinetic energy → Electrical energy! The generator is producing 100V AC!");
        if (!completedRef.current) {
          setLevelComplete(true);
          addScore(100);
          addStar();
          completedRef.current = true;
        }
      } else if (waterFlow > 75) {
        setVoltMessage("⚠️ Too much flow! The turbine is overloading. Reduce to below 75%!");
        setLevelComplete(false);
      } else if (waterFlow > 0) {
        setVoltMessage("💧 Not enough flow yet. The turbine needs at least 50% to spin fast enough.");
        setLevelComplete(false);
      }
    }, 1200);

    return () => { cancelAnimationFrame(frameId); clearTimeout(timer); };
  }, [waterFlow]);

  const zoneLabel =
    waterFlow >= 50 && waterFlow <= 75 ? '✅ Optimal — Generating Power!' :
    waterFlow > 75 ? '🔴 Overload — Too Much Flow!' :
    waterFlow > 0 ? '🟡 Too Low — Need More Flow' : '⚪ Gate Closed';

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      <div className="absolute right-4 top-16 z-10 flex flex-col gap-3 pointer-events-auto" style={{ width: 'clamp(200px, 22vw, 280px)' }}>
        <InfoCard
          title="Hydroelectric Dam"
          icon="🌊"
          colorClass="from-blue-500 to-cyan-400"
          borderColor="border-blue-100"
        >
          <p><strong className="text-blue-600">Step 1 — Potential Energy:</strong> Water stored high in the reservoir has gravitational potential energy (PE = mgh). The higher the water, the more energy stored.</p>
          <p><strong className="text-cyan-600">Step 2 — Kinetic Energy:</strong> Opening the gate sends water through the penstock (pipe). Falling water converts PE → Kinetic Energy (½mv²), spinning the turbine blades.</p>
          <p><strong className="text-green-600">Step 3 — Electricity:</strong> The spinning turbine drives the generator coils. Rotating magnets inside copper coils create an electric current by <em>electromagnetic induction</em> (Faraday's Law).</p>
          <p><strong className="text-yellow-600">Formula:</strong> P = V × I &nbsp;|&nbsp; Target: 240V AC at 50Hz</p>
        </InfoCard>

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100">
            <h3 className="font-display font-bold text-slate-800" style={{ fontSize: '0.95rem' }}>Water Gate Control</h3>
          </div>
          <div className="p-4">
            <div className="flex justify-between text-xs font-bold mb-1 text-slate-500">
              <span>0%</span>
              <span className="text-slate-700 text-sm font-bold">{waterFlow}%</span>
              <span>100%</span>
            </div>
            <input
              type="range"
              min="0" max="100"
              value={waterFlow}
              onChange={e => setWaterFlow(Number(e.target.value))}
              className="w-full mb-3 accent-blue-500"
            />
            {/* Zone bar */}
            <div className="flex w-full h-2 rounded-full overflow-hidden mb-1">
              <div className="bg-red-300" style={{ width: '40%' }} />
              <div className="bg-green-400" style={{ width: '25%' }} />
              <div className="bg-red-300" style={{ width: '35%' }} />
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-red-400">Too Low</span>
              <span className="text-green-500">Optimal<br />50–75%</span>
              <span className="text-red-400">Overload</span>
            </div>
            <div className={`mt-3 text-center text-xs font-bold py-2 rounded-xl ${
              waterFlow >= 50 && waterFlow <= 75 ? 'bg-green-50 text-green-600' :
              waterFlow > 75 ? 'bg-red-50 text-red-500' :
              'bg-slate-50 text-slate-400'
            }`}>
              {zoneLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
