import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene, createGlowingMaterial } from '../../utils/three-helpers';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

export const Level1Dam = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [waterFlow, setWaterFlow] = useState(0);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const turbineRef = useRef<THREE.Group | null>(null);
  const generatorMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const flowParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    setVoltMessage("Adjust the water flow slider! We need it between 50% and 75% to generate stable electricity.");
    
    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    
    // Create Dam Structure
    const damGeo = new THREE.BoxGeometry(20, 15, 5);
    const damMat = new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.8 });
    const dam = new THREE.Mesh(damGeo, damMat);
    dam.position.set(-10, 7.5, 0);
    dam.castShadow = true;
    dam.receiveShadow = true;
    scene.add(dam);

    // Water reservoir
    const waterGeo = new THREE.BoxGeometry(15, 14, 15);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0088ff, transparent: true, opacity: 0.6 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(-27.5, 7, 0);
    scene.add(water);

    // Turbine Pipe
    const pipeGeo = new THREE.CylinderGeometry(1.5, 1.5, 10, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.5 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(-5, 2, 0);
    scene.add(pipe);

    // Turbine Group
    const turbine = new THREE.Group();
    turbine.position.set(2, 2, 0);
    
    const coreGeo = new THREE.CylinderGeometry(1, 1, 2, 16);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.8 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.rotation.x = Math.PI / 2;
    turbine.add(core);

    for(let i=0; i<6; i++) {
      const bladeGeo = new THREE.BoxGeometry(0.2, 3, 1);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xdd8800 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = 1.5;
      
      const bladePivot = new THREE.Group();
      bladePivot.rotation.z = (Math.PI * 2 / 6) * i;
      bladePivot.add(blade);
      turbine.add(bladePivot);
    }
    scene.add(turbine);
    turbineRef.current = turbine;

    // Generator Base
    const genGeo = new THREE.BoxGeometry(4, 6, 4);
    const genMat = new THREE.MeshStandardMaterial({ color: 0x223344 });
    const genBox = new THREE.Mesh(genGeo, genMat);
    genBox.position.set(8, 3, 0);
    scene.add(genBox);

    // Glowing Generator Core
    const coreGGeo = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
    const coreGMat = createGlowingMaterial(0x333333); // Start dark
    generatorMaterialRef.current = coreGMat;
    const genCore = new THREE.Mesh(coreGGeo, coreGMat);
    genCore.position.set(8, 7, 0);
    scene.add(genCore);

    // Water particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.3, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(particleGeo, particleMat);
    particles.position.set(-5, 2, 0);
    scene.add(particles);
    flowParticlesRef.current = particles;

    camera.position.set(0, 15, 25);
    controls.target.set(2, 5, 0);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      // We read from the DOM/React state via ref/closure, but better to use the state directly if possible
      // Since it's in a useEffect, we need to be careful. We'll read from window.waterFlowSpeed (hacky but works for Vanilla Three)
      // Actually, we'll update the turbine speed based on the flowRef.
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      cleanup();
    };
  }, []); // Run once

  // React to water flow changes
  useEffect(() => {
    let frameId: number;
    const animateTurbine = () => {
      frameId = requestAnimationFrame(animateTurbine);
      if (turbineRef.current) {
        turbineRef.current.rotation.z -= (waterFlow / 100) * 0.5;
      }
      
      if (flowParticlesRef.current) {
        const positions = flowParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<positions.length; i+=3) {
          positions[i] += (waterFlow / 100) * 0.5;
          if (positions[i] > 5) positions[i] = -5;
        }
        flowParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
      
      if (generatorMaterialRef.current) {
        if (waterFlow >= 50 && waterFlow <= 75) {
          generatorMaterialRef.current.emissive.setHex(0x39ff14); // Green glow
        } else if (waterFlow > 75) {
          generatorMaterialRef.current.emissive.setHex(0xff0000); // Red overload
        } else {
          generatorMaterialRef.current.emissive.setHex(0x333333); // Off
        }
      }
    };
    animateTurbine();

    // Game Logic Checks
    const checkTimer = setTimeout(() => {
      if (waterFlow >= 50 && waterFlow <= 75) {
        setVoltMessage("Perfect! The generator is producing AC electricity! Kinetic energy is converted into electrical energy.");
        setLevelComplete(true);
        addScore(100);
        addStar();
      } else if (waterFlow > 75) {
        setVoltMessage("Warning! Turbine Overload! Reduce the water flow before it breaks!");
        setLevelComplete(false);
      } else if (waterFlow > 0) {
        setVoltMessage("Insufficient flow. The turbine isn't spinning fast enough to generate power.");
        setLevelComplete(false);
      }
    }, 1500);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(checkTimer);
    };
  }, [waterFlow, setVoltMessage, setLevelComplete, addScore, addStar]);


  return (
    <div className="w-full h-screen relative">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      <div className="absolute right-8 top-24 z-10 flex flex-col gap-6">
        <InfoCard title="Hydroelectric Power">
          <p>Water stored in a dam has <strong>Potential Energy</strong>.</p>
          <p>When released, it turns into <strong>Kinetic Energy</strong>, spinning a turbine.</p>
          <p>The spinning turbine turns a <strong>Generator</strong> to create electricity!</p>
        </InfoCard>

        <div className="glass-panel p-6 rounded-2xl w-80 pointer-events-auto">
          <h3 className="text-xl font-display text-white mb-4">Control Gate</h3>
          <input 
            type="range" 
            min="0" max="100" 
            value={waterFlow}
            onChange={(e) => setWaterFlow(parseInt(e.target.value))}
          />
          <div className="flex justify-between text-slate-400 mt-2 text-sm font-bold">
            <span>Closed</span>
            <span className={waterFlow >= 50 && waterFlow <= 75 ? "text-green-400" : ""}>Optimal</span>
            <span className={waterFlow > 75 ? "text-red-400" : ""}>Danger</span>
          </div>
        </div>
      </div>
    </div>
  );
};
