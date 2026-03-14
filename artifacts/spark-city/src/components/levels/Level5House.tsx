import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

/* ── Step definitions ── */
const STEPS = [
  {
    title: 'Service Pole & Cable',
    icon: '🔌',
    color: '#3b82f6',
    info: '240V AC arrives from the electricity grid through thick overhead service cables. The utility pole outside is the final grid connection point before your home.',
  },
  {
    title: 'Electric Meter',
    icon: '📊',
    color: '#8b5cf6',
    info: 'The Electric Meter measures kilowatt-hours (kWh) used. 1 kWh = 1000 Watts for 1 hour. The utility company reads this every month to calculate your electricity bill!',
  },
  {
    title: 'Main Switch (Isolator)',
    icon: '🔴',
    color: '#ef4444',
    info: 'The Main Switch instantly cuts ALL electricity to the house. ALWAYS turn this OFF before doing any electrical work — it is your primary safety control!',
  },
  {
    title: 'MCB Panel (Distribution Board)',
    icon: '🛡️',
    color: '#059669',
    info: 'The MCB Panel has separate circuit breakers (MCBs) for each room circuit. If too much current flows — a fault or short-circuit — the MCB trips, preventing fires!',
  },
  {
    title: '3 Essential Wires',
    icon: '🔴🔵🟢',
    color: '#f59e0b',
    info: 'Every electrical circuit has 3 wires:\n• PHASE (Red/Brown): Live at 240V — never touch!\n• NEUTRAL (Blue): Returns current to the grid.\n• EARTH (Green/Yellow): Safety — diverts fault current to ground.',
  },
];

const buildStep0 = (scene: THREE.Scene) => {
  // Pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 13, 12),
    new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.9 })
  );
  pole.position.set(-10, 6.5, 2);
  scene.add(pole);
  // Cross-arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: 0x5a3a20 }));
  arm.position.set(-10, 11.5, 2);
  scene.add(arm);
  // Service wire
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 11.3, 2),
    new THREE.Vector3(-7.5, 10.2, 2),
    new THREE.Vector3(-5.5, 9.4, 2),
  ]);
  scene.add(new THREE.Mesh(
    new THREE.TubeGeometry(curve, 20, 0.06, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
  ));
};

const buildStep1 = (scene: THREE.Scene) => {
  const grp = new THREE.Group();
  grp.add(
    Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 0.9), new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.3 })),
      {}
    )
  );
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.0, 20), new THREE.MeshStandardMaterial({ color: 0xecf0f1 }));
  dial.rotation.x = Math.PI / 2;
  dial.position.z = 0.22;
  grp.add(dial);
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 0.12), new THREE.MeshStandardMaterial({ color: 0xe74c3c }));
  needle.position.z = 0.73;
  needle.rotation.z = Math.PI / 5;
  grp.add(needle);
  grp.position.set(-8.2, 5, 2);
  scene.add(grp);
};

const buildStep2 = (scene: THREE.Scene) => {
  const sw = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1.8, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xe74c3c, emissive: 0x880000, emissiveIntensity: 0.3 })
  );
  sw.position.set(-6.5, 5, 2);
  scene.add(sw);
  const lever = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.9, 0.2), new THREE.MeshStandardMaterial({ color: 0xffd700 }));
  lever.position.set(-6.5, 5.8, 2.4);
  scene.add(lever);
};

const buildStep3 = (scene: THREE.Scene) => {
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 4.5, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.2 })
  );
  panel.position.set(-4, 5.2, -3.6);
  scene.add(panel);
  for (let i = 0; i < 6; i++) {
    const mcb = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.9, 0.5),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x22c55e : 0xf59e0b,
        emissive: i % 2 === 0 ? 0x22c55e : 0xf59e0b,
        emissiveIntensity: 0.25,
      })
    );
    mcb.position.set(-5.2 + i * 0.52, 5.2, -3.2);
    scene.add(mcb);
  }
};

const buildStep4 = (scene: THREE.Scene) => {
  const wireColors = [0xdc2626, 0x2563eb, 0x16a34a];
  const yOffsets = [0, 0.22, -0.22];
  wireColors.forEach((col, i) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, 5, -3.2),
      new THREE.Vector3(-1, 5 + yOffsets[i] * 3, -3),
      new THREE.Vector3(2, 7, -3),
      new THREE.Vector3(5, 7, -3),
    ]);
    scene.add(new THREE.Mesh(
      new THREE.TubeGeometry(curve, 20, 0.07, 8, false),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.4 })
    ));
  });
};

const BUILDERS = [buildStep0, buildStep1, buildStep2, buildStep3, buildStep4];

/* ── Component ── */
export const Level5House = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [step, setStep] = useState(0);
  const sceneRef = useRef<THREE.Scene | null>(null);

  /* ── One-time scene init ── */
  useEffect(() => {
    setVoltMessage("🏠 Trace how electricity safely enters your HOME! Tap 'Next Step' to build each connection.");

    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    sceneRef.current = scene;

    scene.background = new THREE.Color(0xddeeff);
    scene.fog = new THREE.FogExp2(0xddeeff, 0.018);
    camera.position.set(0, 9, 24);
    controls.target.set(0, 4, 0);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5efe6 });

    // Floor
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xe8d5b7, roughness: 0.8 })),
      { position: new THREE.Vector3(0, 0, 0) }
    ));

    // Walls
    const addBox = (w: number, h: number, d: number, x: number, y: number, z: number, mat = wallMat) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.castShadow = true; m.receiveShadow = true;
      scene.add(m);
    };
    addBox(16, 8, 0.5, 0, 4.25, -3.75);
    addBox(0.5, 8, 8, -7.75, 4.25, 0);
    addBox(0.5, 8, 8, 7.75, 4.25, 0);
    addBox(0.2, 8, 6, -2, 4.25, -1);
    addBox(0.2, 8, 6, 3, 4.25, -1);

    // Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(12, 4, 4), new THREE.MeshStandardMaterial({ color: 0xb03020 }));
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, 10.25, 0);
    roof.castShadow = true;
    scene.add(roof);

    // Grass
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ color: 0x6ab04c, roughness: 0.9 }));
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.28;
    scene.add(grass);

    // Build step 0 on mount
    BUILDERS[0](scene);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      cleanup();
      sceneRef.current = null;
    };
  }, []);

  /* ── Build each subsequent step ── */
  useEffect(() => {
    if (step === 0) return; // step 0 built during init
    const scene = sceneRef.current;
    if (!scene) return;
    if (step < BUILDERS.length) {
      BUILDERS[step](scene);
    }

    // Update messages and completion
    const msgs = [
      "🔌 The SERVICE POLE connects the grid to your home. 240V AC comes through overhead cables!",
      "📊 The ELECTRIC METER counts every kilowatt-hour (kWh) you use. It's how your electricity bill is calculated!",
      "🔴 The MAIN SWITCH cuts ALL power. Always turn it OFF before doing electrical work — safety first!",
      "🛡️ The MCB PANEL has separate breakers per room. They TRIP to prevent fires when there's a fault!",
      "⭐ THREE WIRES: Phase (live), Neutral (return), Earth (safety). You've traced the complete path of electricity!",
    ];
    setVoltMessage(msgs[step]);

    if (step === BUILDERS.length - 1) {
      setLevelComplete(true);
      addScore(100);
      addStar();
    }
  }, [step]);

  const currentStep = STEPS[step];

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Right panel */}
      <div
        className="absolute right-3 top-14 z-10 flex flex-col gap-3 pointer-events-auto"
        style={{ width: 'clamp(220px, 25vw, 300px)' }}
      >
        {/* Step info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <InfoCard title={currentStep.title} icon={currentStep.icon} colorClass="from-indigo-600 to-violet-500">
              <p style={{ whiteSpace: 'pre-line' }}>{currentStep.info}</p>

              {step === STEPS.length - 1 && (
                <div className="flex flex-col gap-1.5 mt-3">
                  {[
                    { bg: '#fee2e2', dot: '#dc2626', text: 'Phase Wire — 240V LIVE!', textCol: '#991b1b' },
                    { bg: '#dbeafe', dot: '#2563eb', text: 'Neutral Wire — Return Path', textCol: '#1e40af' },
                    { bg: '#dcfce7', dot: '#16a34a', text: 'Earth Wire — Safety Ground', textCol: '#15803d' },
                  ].map((w) => (
                    <div
                      key={w.text}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5"
                      style={{ background: w.bg }}
                    >
                      <div
                        className="rounded-full flex-shrink-0"
                        style={{ width: 14, height: 14, background: w.dot, boxShadow: `0 0 8px ${w.dot}` }}
                      />
                      <span className="font-bold" style={{ color: w.textCol, fontSize: '0.88rem' }}>{w.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar and Next button */}
        <div className="game-panel">
          <h3 className="font-display font-bold text-slate-800 mb-3" style={{ fontSize: '1rem' }}>Installation Progress</h3>
          <div className="flex justify-between mb-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="rounded-full flex items-center justify-center font-display font-bold"
                  style={{
                    width: 32, height: 32, fontSize: '0.82rem',
                    background: i < step ? '#059669' : i === step ? s.color : '#e2e8f0',
                    color: i <= step ? 'white' : '#94a3b8',
                    boxShadow: i === step ? `0 0 14px ${s.color}88` : 'none',
                    transition: 'all 0.35s ease',
                  }}
                >
                  {i < step ? '✓' : i + 1}
                </div>
              </div>
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setStep(s => s + 1)}
              className="w-full py-3 rounded-xl font-display font-bold text-white shadow-md"
              style={{
                background: `linear-gradient(135deg, ${currentStep.color}, ${currentStep.color}cc)`,
                fontSize: '1.1rem',
                boxShadow: `0 4px 15px ${currentStep.color}55`,
              }}
            >
              Next Step ➡
            </motion.button>
          ) : (
            <div
              className="text-center py-3 rounded-xl font-display font-bold"
              style={{ background: '#f0fdf4', color: '#059669', fontSize: '1.05rem' }}
            >
              ⭐ All Steps Complete!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
