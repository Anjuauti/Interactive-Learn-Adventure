import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

const APPLIANCES = [
  { id: 'light', name: 'LED Bulb', watts: 9, icon: '💡', onColor: '#fbbf24', label: 'Ceiling Light' },
  { id: 'fan', name: 'Ceiling Fan', watts: 70, icon: '🌀', onColor: '#60a5fa', label: 'Ceiling Fan' },
  { id: 'tv', name: 'Television', watts: 120, icon: '📺', onColor: '#818cf8', label: 'Television' },
  { id: 'fridge', name: 'Refrigerator', watts: 300, icon: '❄️', onColor: '#67e8f9', label: 'Refrigerator' },
  { id: 'washer', name: 'Washing Machine', watts: 500, icon: '🌊', onColor: '#6ee7b7', label: 'Washer' },
];

export const Level6Wiring = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [activeItems, setActiveItems] = useState<Set<string>>(new Set());
  const sceneRef = useRef<THREE.Scene | null>(null);
  const objectsRef = useRef<Record<string, any>>({});
  const lightsRef = useRef<Map<string, THREE.PointLight>>(new Map());
  const completedRef = useRef(false);

  useEffect(() => {
    setVoltMessage("Toggle each switch to power the appliances. Watch the 3D house light up!");

    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    sceneRef.current = scene;

    // Isometric camera angle matching reference
    camera.position.set(18, 22, 18);
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI / 2.2;

    // ── Green grass yard ──
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x8cc47d, roughness: 0.95 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.05;
    scene.add(grass);

    // ── House floor ──
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.25, 14),
      new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.9 })
    );
    floor.position.set(0, 0.12, 0);
    scene.add(floor);

    // Helper to make a wall
    const wall = (w: number, h: number, d: number, x: number, y: number, z: number, color = 0xfafaf8) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color, roughness: 0.85 })
      );
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      return m;
    };

    // Outer walls
    wall(18, 5, 0.3, 0, 2.5, -7);   // back
    wall(18, 5, 0.3, 0, 2.5, 7);    // front (open/transparent would be ideal but keep solid)
    wall(0.3, 5, 14, -9, 2.5, 0);   // left
    wall(0.3, 5, 14, 9, 2.5, 0);    // right

    // Interior dividing wall with doorway gap
    wall(7.5, 5, 0.3, -5.25, 2.5, 0);   // left segment
    wall(7.5, 5, 0.3, 5.25, 2.5, 0);    // right segment
    // gap in the middle = doorway

    // ── Furniture — Living room (left) ──
    // Couch
    const couch = new THREE.Group();
    const couchBase = new THREE.Mesh(new THREE.BoxGeometry(5, 0.8, 2), new THREE.MeshStandardMaterial({ color: 0x9b6a4a, roughness: 0.9 }));
    const couchBack = new THREE.Mesh(new THREE.BoxGeometry(5, 1.8, 0.4), new THREE.MeshStandardMaterial({ color: 0x8a5a3a }));
    couchBack.position.set(0, 1.3, 0.8);
    const couchLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 2), new THREE.MeshStandardMaterial({ color: 0x8a5a3a }));
    couchLeft.position.set(-2.3, 0.6, 0);
    const couchRight = couchLeft.clone();
    couchRight.position.set(2.3, 0.6, 0);
    couch.add(couchBase, couchBack, couchLeft, couchRight);
    couch.position.set(-4, 0.65, 2.5);
    scene.add(couch);

    // TV (on back-left wall)
    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.8, 0.25), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(4.1, 2.4, 0.3), new THREE.MeshStandardMaterial({ color: 0x0a0a0a }));
    tvScreen.position.z = 0.02;
    const tvGroup = new THREE.Group();
    tvGroup.add(tvFrame, tvScreen);
    tvGroup.position.set(-4, 2.8, -6.8);
    scene.add(tvGroup);
    objectsRef.current['tv'] = { group: tvGroup, screen: tvScreen };

    // Coffee table
    const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 1.2), new THREE.MeshStandardMaterial({ color: 0xc9a87c }));
    coffeeTable.position.set(-4, 0.8, 4.5);
    scene.add(coffeeTable);

    // ── Furniture — Bedroom (right) ──
    // Bed
    const bedBase = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 5.5), new THREE.MeshStandardMaterial({ color: 0xd4c4a8 }));
    const bedHead = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 0.3), new THREE.MeshStandardMaterial({ color: 0xb8a080 }));
    const bedPillow = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 1), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    const bedPillow2 = bedPillow.clone();
    bedBase.position.set(4.5, 0.5, 2);
    bedHead.position.set(4.5, 1.15, -0.7);
    bedPillow.position.set(3.5, 0.85, -0.2);
    bedPillow2.position.set(5.5, 0.85, -0.2);
    scene.add(bedBase, bedHead, bedPillow, bedPillow2);

    // Bedside table
    const nightstand = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 1), new THREE.MeshStandardMaterial({ color: 0xc9a87c }));
    nightstand.position.set(7.2, 0.65, 1);
    scene.add(nightstand);

    // ── Utility corner ──
    // Fridge
    const fridgeGroup = new THREE.Group();
    const fridgeBody = new THREE.Mesh(new THREE.BoxGeometry(2, 4.5, 2), new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.3, roughness: 0.6 }));
    const fridgeHandle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.15), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 }));
    fridgeHandle.position.set(1.05, 0, 0.7);
    fridgeGroup.add(fridgeBody, fridgeHandle);
    fridgeGroup.position.set(7.5, 2.25, -5);
    scene.add(fridgeGroup);
    objectsRef.current['fridge'] = fridgeGroup;

    // Washing machine
    const washerBody = new THREE.Mesh(new THREE.BoxGeometry(2, 2.2, 2), new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.7 }));
    const washerDoor = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.15, 20), new THREE.MeshStandardMaterial({ color: 0xaaaacc, metalness: 0.4 }));
    washerDoor.rotation.x = Math.PI / 2;
    washerDoor.position.z = 1.05;
    const washerGroup = new THREE.Group();
    washerGroup.add(washerBody, washerDoor);
    washerGroup.position.set(5.2, 1.1, -5.5);
    scene.add(washerGroup);
    objectsRef.current['washer'] = washerGroup;

    // ── Ceiling LED Bulb ──
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), new THREE.MeshStandardMaterial({ color: 0xccccaa, roughness: 0.3 }));
    bulb.position.set(-3, 4.7, 2);
    scene.add(bulb);
    objectsRef.current['light'] = bulb;

    // ── Ceiling Fan ──
    const fanGroup = new THREE.Group();
    const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0x8b7355 }));
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 0.7), new THREE.MeshStandardMaterial({ color: 0xa08060 }));
      blade.position.x = 1.4;
      const pivot = new THREE.Group();
      pivot.rotation.y = (Math.PI / 2) * i;
      pivot.add(blade);
      fanGroup.add(pivot);
    }
    fanGroup.add(fanHub);
    fanGroup.position.set(4, 4.7, 2.5);
    scene.add(fanGroup);
    objectsRef.current['fan'] = fanGroup;

    // ── MCB Panel ──
    const mcbPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.5, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x2c3e50 })
    );
    mcbPanel.position.set(-8.8, 3.5, -3);
    scene.add(mcbPanel);

    // Draw wires as lines from MCB panel to each appliance
    const drawWire = (target: THREE.Vector3, color: number) => {
      const pts = [new THREE.Vector3(-8.8, 3.5, -3), new THREE.Vector3(-8.8, 5, target.z), target.clone().setY(5), target];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color })));
    };
    drawWire(new THREE.Vector3(-3, 4.7, 2), 0xaaaaaa);
    drawWire(new THREE.Vector3(4, 4.7, 2.5), 0xaaaaaa);
    drawWire(new THREE.Vector3(-4, 2.8, -6.8), 0xaaaaaa);
    drawWire(new THREE.Vector3(7.5, 2.25, -5), 0xaaaaaa);
    drawWire(new THREE.Vector3(5.2, 1.1, -5.5), 0xaaaaaa);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const active = (window as any).activeAppliances as Set<string> || new Set();
      if (active.has('fan')) fanGroup.rotation.y += 0.04;
      if (active.has('washer')) {
        washerGroup.position.x = 5.2 + Math.sin(Date.now() / 60) * 0.04;
      } else {
        washerGroup.position.x = 5.2;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => { cancelAnimationFrame(frameId); cleanup(); };
  }, []);

  useEffect(() => {
    (window as any).activeAppliances = activeItems;
    const scene = sceneRef.current;
    if (!scene) return;

    const bulb = objectsRef.current['light'];
    if (bulb) {
      const mat = bulb.material as THREE.MeshStandardMaterial;
      if (activeItems.has('light')) {
        mat.emissive.setHex(0xffee44); mat.emissiveIntensity = 1;
        if (!lightsRef.current.has('light')) {
          const pl = new THREE.PointLight(0xffeebb, 2.5, 18);
          pl.position.copy(bulb.position);
          scene.add(pl);
          lightsRef.current.set('light', pl);
        }
      } else {
        mat.emissive.setHex(0x000000); mat.emissiveIntensity = 0;
        if (lightsRef.current.has('light')) { scene.remove(lightsRef.current.get('light')!); lightsRef.current.delete('light'); }
      }
    }

    const tv = objectsRef.current['tv'];
    if (tv) {
      const mat = tv.screen.material as THREE.MeshStandardMaterial;
      if (activeItems.has('tv')) {
        mat.emissive.setHex(0x1a44cc); mat.emissiveIntensity = 1.2;
        if (!lightsRef.current.has('tv')) {
          const pl = new THREE.PointLight(0x3366ff, 1.0, 8);
          pl.position.copy(tv.group.position);
          scene.add(pl);
          lightsRef.current.set('tv', pl);
        }
      } else {
        mat.emissive.setHex(0x000000); mat.emissiveIntensity = 0;
        if (lightsRef.current.has('tv')) { scene.remove(lightsRef.current.get('tv')!); lightsRef.current.delete('tv'); }
      }
    }

    if (activeItems.size === APPLIANCES.length && !completedRef.current) {
      completedRef.current = true;
      setVoltMessage("🏠 All appliances running in PARALLEL! Each has its own circuit path from the MCB. Total: 999W — that's why we have 15A circuit breakers!");
      setLevelComplete(true);
      addScore(100);
      addStar();
    }
  }, [activeItems]);

  const toggle = (id: string) => {
    setActiveItems(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      addScore(10);
      return n;
    });
  };

  const totalWatts = Array.from(activeItems).reduce((s, id) => {
    return s + (APPLIANCES.find(a => a.id === id)?.watts ?? 0);
  }, 0);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      <div className="absolute right-4 top-16 z-10 flex flex-col gap-3 pointer-events-auto" style={{ width: 'clamp(190px, 21vw, 260px)' }}>
        <InfoCard
          title="Home Wiring"
          icon="🔌"
          colorClass="from-red-500 to-orange-400"
          borderColor="border-red-100"
        >
          <p><strong className="text-red-600">Parallel Circuits:</strong> Each appliance is wired in parallel — it gets the full 240V and has its own switch and MCB breaker.</p>
          <p><strong className="text-orange-500">Why parallel?</strong> If one appliance fails, the rest keep working. Series wiring would turn off everything!</p>
          <p><strong className="text-slate-600">MCB Protection:</strong> Each circuit's breaker trips if current exceeds the rated limit (6A, 10A, 16A) — preventing fires.</p>
        </InfoCard>

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <span>🎛️</span>
            <h3 className="font-display font-bold text-slate-800" style={{ fontSize: '0.9rem' }}>Control Panel</h3>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {APPLIANCES.map(app => {
              const on = activeItems.has(app.id);
              return (
                <button
                  key={app.id}
                  onClick={() => toggle(app.id)}
                  className="flex items-center justify-between w-full rounded-xl px-3 py-2 transition-all border"
                  style={{
                    background: on ? `${app.onColor}22` : '#f8fafc',
                    borderColor: on ? app.onColor : '#e2e8f0',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1.1rem' }}>{app.icon}</span>
                    <div className="text-left">
                      <div className="font-bold text-slate-800 leading-tight" style={{ fontSize: '0.78rem' }}>{app.name}</div>
                      <div className="text-slate-400" style={{ fontSize: '0.65rem' }}>{app.watts} W</div>
                    </div>
                  </div>
                  {/* Toggle switch visual */}
                  <div
                    className="rounded-full transition-all flex-shrink-0"
                    style={{
                      width: '2rem', height: '1.1rem',
                      background: on ? '#22c55e' : '#cbd5e1',
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '2px', left: on ? 'calc(100% - 18px)' : '2px',
                      width: '14px', height: '14px',
                      borderRadius: '50%',
                      background: 'white',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                </button>
              );
            })}
          </div>
          {/* Watt meter */}
          <div className="bg-slate-800 text-white px-4 py-3">
            <div className="text-slate-400 uppercase tracking-wider mb-0.5" style={{ fontSize: '0.6rem', fontWeight: 700 }}>Total Power Draw</div>
            <div className="font-display font-bold text-yellow-400" style={{ fontSize: '1.5rem' }}>
              {totalWatts} <span className="text-slate-300 font-sans" style={{ fontSize: '0.75rem' }}>W</span>
            </div>
            {totalWatts > 0 && (
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '0.62rem' }}>
                Current: ~{(totalWatts / 240).toFixed(2)} A at 240V
              </div>
            )}
            {activeItems.size === APPLIANCES.length && (
              <div className="text-green-400 font-bold mt-1" style={{ fontSize: '0.72rem' }}>⚡ Fully Powered!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
