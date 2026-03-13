import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

export const Level3Transmission = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [connections, setConnections] = useState(0);

  useEffect(() => {
    setVoltMessage("Click the glowing nodes to connect the high-voltage transmission lines between the towers!");

    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    
    camera.position.set(0, 15, 35);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x112211, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Towers
    const createTower = (x: number) => {
      const tower = new THREE.Group();
      
      const mainBodyGeo = new THREE.CylinderGeometry(0.5, 2, 20, 4);
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, wireframe: true });
      const mainBody = new THREE.Mesh(mainBodyGeo, metalMat);
      mainBody.position.y = 10;
      tower.add(mainBody);

      const crossbarGeo = new THREE.BoxGeometry(10, 0.5, 0.5);
      const crossbarMat = new THREE.MeshStandardMaterial({ color: 0x778899 });
      const crossbar = new THREE.Mesh(crossbarGeo, crossbarMat);
      crossbar.position.y = 15;
      tower.add(crossbar);

      // Connection Nodes
      const nodeGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.8 });
      
      const leftNode = new THREE.Mesh(nodeGeo, nodeMat);
      leftNode.position.set(-5, 14.5, 0);
      leftNode.userData = { isNode: true, towerX: x, side: 'left' };
      tower.add(leftNode);

      const rightNode = new THREE.Mesh(nodeGeo, nodeMat.clone());
      rightNode.position.set(5, 14.5, 0);
      rightNode.userData = { isNode: true, towerX: x, side: 'right' };
      tower.add(rightNode);

      tower.position.set(x, 0, 0);
      return { tower, leftNode, rightNode };
    };

    const t1 = createTower(-20);
    const t2 = createTower(0);
    const t3 = createTower(20);
    scene.add(t1.tower, t2.tower, t3.tower);

    // Raycaster for clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedNode: THREE.Mesh | null = null;
    let linesDrawn = 0;

    const onMouseClick = (event: MouseEvent) => {
      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      const clicked = intersects.find(hit => hit.object.userData.isNode)?.object as THREE.Mesh;
      
      if (clicked) {
        if (!selectedNode) {
          selectedNode = clicked;
          (selectedNode.material as THREE.MeshStandardMaterial).emissiveIntensity = 2; // Highlight
        } else {
          // Draw line
          if (selectedNode !== clicked) {
            const pos1 = new THREE.Vector3();
            selectedNode.getWorldPosition(pos1);
            const pos2 = new THREE.Vector3();
            clicked.getWorldPosition(pos2);

            const curve = new THREE.QuadraticBezierCurve3(
              pos1,
              new THREE.Vector3((pos1.x + pos2.x)/2, pos1.y - 2, (pos1.z + pos2.z)/2),
              pos2
            );

            const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.3, 8, false);
            const tubeMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xddaa00 });
            const tube = new THREE.Mesh(tubeGeo, tubeMat);
            scene.add(tube);

            linesDrawn++;
            setConnections(linesDrawn);

            (selectedNode.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
            selectedNode = null;
          }
        }
      }
    };

    window.addEventListener('click', onMouseClick);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('click', onMouseClick);
      cancelAnimationFrame(frameId);
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (connections >= 4) {
      setVoltMessage("Great job! Stepping up the voltage to 400,000 Volts means the power travels efficiently with minimal energy loss!");
      setLevelComplete(true);
      addScore(100);
      addStar();
    } else if (connections > 0) {
      setVoltMessage(`Keep going! ${connections}/4 lines connected.`);
    }
  }, [connections]);

  return (
    <div className="w-full h-screen relative">
      <div ref={containerRef} className="absolute inset-0 z-0 cursor-crosshair" />
      
      <div className="absolute right-8 top-32 z-10 flex flex-col gap-6 pointer-events-none w-[22rem]">
        <InfoCard 
          title="High Voltage Transmission" 
          icon="🗼"
          colorClass="from-yellow-400 to-orange-500"
          borderColor="border-yellow-400"
        >
          <p>Electricity travels hundreds of miles.</p>
          <p>We use a <strong className="text-orange-600">Step-Up Transformer</strong> to increase voltage very high (like 400kV).</p>
          <div className="bg-yellow-100 p-3 rounded-xl border border-yellow-300 mt-2">
            <p className="text-orange-600 font-bold text-center">High Voltage = Lower Current = Less Heat Loss!</p>
          </div>
        </InfoCard>

        <div className="glass-panel p-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 border-b border-white/10">
            <h3 className="text-xl font-display text-white font-bold">Connections</h3>
          </div>
          <div className="p-5 flex justify-center gap-2">
             {[1,2,3,4].map(i => (
               <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${connections >= i ? 'bg-yellow-400 text-slate-900 shadow-[0_0_15px_rgba(255,204,0,0.8)]' : 'bg-slate-700 text-slate-500'}`}>
                 {i}
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
