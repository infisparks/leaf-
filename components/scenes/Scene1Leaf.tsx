import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { InfoData } from '../../types';
import { InfoHotspot } from '../InfoHotspot';

interface Scene1Props {
  showLabels: boolean;
  onInfoSelect: (data: InfoData) => void;
  executionStep: number;
}

// Reusable atomic molecule component (H2O, CO2, O2) with Physics-like jitter
const AtomicMolecule: React.FC<{ type: 'h2o' | 'co2' | 'o2', position: [number, number, number], animateTo?: [number, number, number], label?: string }> = ({ type, position, animateTo, label }) => {
  const ref = useRef<THREE.Group>(null);
  const startPos = useRef(new THREE.Vector3(...position));
  const randomOffset = useRef(new THREE.Vector3(Math.random(), Math.random(), Math.random()));
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
        // Brownian Motion / Thermal Jitter
        const jitterX = Math.sin(t * 10 + randomOffset.current.x) * 0.02;
        const jitterY = Math.cos(t * 12 + randomOffset.current.y) * 0.02;
        const jitterZ = Math.sin(t * 15 + randomOffset.current.z) * 0.02;

        if (animateTo) {
            // Smooth Lerp animation to target
            const target = new THREE.Vector3(...animateTo);
            ref.current.position.lerp(target, 0.04);
            ref.current.position.x += jitterX;
        } else {
            // Return to start
            ref.current.position.lerp(startPos.current, 0.04);
            // Idle float
            ref.current.position.x += Math.sin(t + randomOffset.current.x) * 0.005;
            ref.current.position.y += Math.cos(t * 0.8 + randomOffset.current.y) * 0.005;
        }
    }
  });

  return (
    <group ref={ref} position={position} scale={0.3}>
      {/* Molecule Geometry */}
        {type === 'h2o' && (
          <group>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.4, 32, 32]} />
              <meshPhysicalMaterial color="#ef4444" roughness={0.1} metalness={0.2} clearcoat={1} />
            </mesh>
            <mesh position={[0.35, 0.35, 0]}>
              <sphereGeometry args={[0.25, 32, 32]} />
              <meshPhysicalMaterial color="#ffffff" roughness={0.1} />
            </mesh>
            <mesh position={[-0.35, 0.35, 0]}>
              <sphereGeometry args={[0.25, 32, 32]} />
              <meshPhysicalMaterial color="#ffffff" roughness={0.1} />
            </mesh>
          </group>
        )}
        {type === 'co2' && (
          <group>
            <mesh>
              <sphereGeometry args={[0.35, 32, 32]} />
              <meshPhysicalMaterial color="#334155" roughness={0.5} />
            </mesh>
            <mesh position={[0.6, 0, 0]}>
              <sphereGeometry args={[0.35, 32, 32]} />
              <meshPhysicalMaterial color="#ef4444" roughness={0.1} />
            </mesh>
            <mesh position={[-0.6, 0, 0]}>
              <sphereGeometry args={[0.35, 32, 32]} />
              <meshPhysicalMaterial color="#ef4444" roughness={0.1} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} position={[0.3, 0, 0]}>
               <cylinderGeometry args={[0.1, 0.1, 0.6]} />
               <meshStandardMaterial color="#94a3b8" />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.3, 0, 0]}>
               <cylinderGeometry args={[0.1, 0.1, 0.6]} />
               <meshStandardMaterial color="#94a3b8" />
            </mesh>
          </group>
        )}
        {type === 'o2' && (
           <group>
             <mesh position={[0.25, 0, 0]}>
               <sphereGeometry args={[0.35, 32, 32]} />
               <meshPhysicalMaterial color="#ef4444" roughness={0.1} />
             </mesh>
             <mesh position={[-0.25, 0, 0]}>
               <sphereGeometry args={[0.35, 32, 32]} />
               <meshPhysicalMaterial color="#ef4444" roughness={0.1} />
             </mesh>
           </group>
        )}
        {label && (
             <Html position={[0, 0.8, 0]} center>
                <div className="text-white text-[10px] font-mono bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/20 whitespace-nowrap">
                    {label}
                </div>
            </Html>
        )}
    </group>
  )
}

export const Scene1Leaf: React.FC<Scene1Props> = ({ showLabels, onInfoSelect, executionStep }) => {
  const leafRef = useRef<THREE.Group>(null);
  
  // PHYSICS: Sun Positioned High-Front (Z=30) so Leaf looks towards camera
  // This ensures the front face of the leaf is always visible to the user.
  const sunPosition = new THREE.Vector3(0, 10, 30); 
  const leafPosition = new THREE.Vector3(0, -3, 0);

  // --- Realistic Leaf Geometry ---
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    // Asymmetric natural curve
    shape.bezierCurveTo(2.5, 1, 4.5, 4, 0, 12); // Right side
    shape.bezierCurveTo(-4.5, 4, -2.5, 1, 0, 0); // Left side
    
    const extrudeSettings = {
      steps: 6,
      depth: 0.15, // Thinner blade for realism
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.1,
      bevelSegments: 3
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame(({ clock }) => {
    if (leafRef.current) {
      const t = clock.getElapsedTime();
      
      // 1. ORIENTATION PHYSICS: Phototropism
      // The leaf orients itself to face the sun. Since Sun is at Z=30 (behind camera),
      // the leaf faces the camera.
      leafRef.current.lookAt(sunPosition);
      
      // 2. WIND PHYSICS: Fluid Dynamics Simulation
      // Multi-frequency noise for natural turbulence
      // Primary sway (Low freq)
      const sway = Math.sin(t * 0.8) * 0.05;
      // Micro-turbulence (High freq)
      const flutter = Math.sin(t * 3.5) * 0.01 + Math.cos(t * 5.2) * 0.01;
      
      // Apply wind rotations on local axes (after lookAt)
      // Rotate around X (pitch) and Z (roll) slightly
      leafRef.current.rotateX(sway + flutter);
      leafRef.current.rotateZ(sway * 0.5);
    }
  });

  // --- Animation Logic ---
  const sunScale = executionStep === 1 ? 2.5 : 2; 
  const rayOpacity = executionStep === 1 ? 0.3 : 0.05;

  const co2Target: [number, number, number] | undefined = executionStep === 2 ? [0.8, 2.5, 0.5] : undefined;
  const h2oTarget: [number, number, number] | undefined = executionStep === 3 ? [0, -1, 0.2] : undefined;
  const o2Target: [number, number, number] | undefined = executionStep === 4 ? [-2, 4, 4] : undefined;

  return (
    <group>
      {/* REALISTIC SUN - Placed in front (Z+) so it lights up the leaf face */}
      <group position={sunPosition} scale={sunScale}>
        <mesh>
            <sphereGeometry args={[2.5, 64, 64]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh>
            <sphereGeometry args={[4, 32, 32]} />
            <meshBasicMaterial color="#fcd34d" transparent opacity={0.4} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <mesh>
            <sphereGeometry args={[7, 32, 32]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.BackSide} />
        </mesh>
        
        {executionStep === 1 && (
            <InfoHotspot 
                position={[0, -3.5, 0]} 
                data={{ 
                    title: "Solar Energy", 
                    description: "Photons from the sun travel to the leaf. The leaf is broad and flat, angled towards the sun to capture maximum light energy." 
                }}
                onSelect={onInfoSelect}
                visible={showLabels}
            />
        )}
      </group>

      {/* GOD RAYS - Directed at Leaf */}
      <group position={sunPosition} lookAt={leafPosition}>
          {Array.from({ length: 12 }).map((_, i) => (
              <mesh key={i} position={[
                  (Math.random() - 0.5) * 8, 
                  (Math.random() - 0.5) * 8, 
                  6
              ]} rotation={[Math.PI/2, 0, 0]}>
                  <cylinderGeometry args={[0.05, 0.6, 25, 8]} />
                  <meshBasicMaterial 
                     color={executionStep === 1 ? "#ffffcc" : "#fff7ed"} 
                     transparent 
                     opacity={rayOpacity} 
                     side={THREE.DoubleSide} 
                     blending={THREE.AdditiveBlending} 
                     depthWrite={false} 
                  />
              </mesh>
          ))}
      </group>

      {/* THE LEAF MODEL */}
      <group ref={leafRef} position={leafPosition}>
        <mesh geometry={leafGeometry} receiveShadow castShadow>
            <meshPhysicalMaterial 
                color={executionStep === 1 ? "#facc15" : "#4d7c0f"} 
                emissive={executionStep === 1 ? "#facc15" : "#1a2e05"}
                emissiveIntensity={executionStep === 1 ? 0.3 : 0.0}
                roughness={0.35} 
                metalness={0.0}
                clearcoat={0.6} // Waxy Cuticle Effect
                clearcoatRoughness={0.2}
                side={THREE.DoubleSide}
                normalScale={new THREE.Vector2(0.5, -0.5)}
            />
        </mesh>

        <InfoHotspot 
            position={[0, 8, 0.5]} 
            data={{ 
                title: "Phototropism", 
                description: "Notice how the leaf faces the light source? Plants orient their leaves to maximize surface area exposure for photosynthesis." 
            }}
            onSelect={onInfoSelect}
            visible={showLabels}
        />

        {/* Central Vein (Midrib) */}
        <mesh position={[0, 5, 0.1]} rotation={[0,0,0]} scale={[1, 1, 1]}>
             <cylinderGeometry args={[0.08, 0.2, 11, 16]} />
             <meshPhysicalMaterial color={executionStep === 3 ? "#facc15" : "#84cc16"} roughness={0.6} clearcoat={0.1} />
        </mesh>

        {/* Petiole (Stalk) */}
         <mesh position={[0, -1, 0.1]} rotation={[0,0,0]}>
             <cylinderGeometry args={[0.2, 0.25, 3, 16]} />
             <meshPhysicalMaterial color="#65a30d" roughness={0.8} />
        </mesh>

        {/* Detailed Vein Network (Fractal-like) */}
        {[-1, 1].map((side) => 
            Array.from({length: 5}).map((_, i) => (
                <group key={i} position={[side * 0.1, i * 2 + 1, 0.1]} rotation={[0, 0, side * (-0.7 + i * 0.05)]}>
                    <mesh position={[0, 1.5, 0]}>
                        <cylinderGeometry args={[0.04, 0.06, 3.5, 8]} />
                        <meshPhysicalMaterial color={executionStep === 3 ? "#facc15" : "#84cc16"} roughness={0.6} />
                    </mesh>
                    {/* Secondary Branching */}
                    <mesh position={[0, 2, 0]} rotation={[0, 0, side * 0.5]}>
                        <cylinderGeometry args={[0.02, 0.04, 1.5, 8]} />
                        <meshPhysicalMaterial color={executionStep === 3 ? "#facc15" : "#84cc16"} roughness={0.6} />
                    </mesh>
                </group>
            ))
        )}

        {/* Stomata Detail */}
        <group position={[1.5, 3.5, 0.12]}>
             <mesh rotation={[Math.PI/2, 0, 0]}>
                 <torusGeometry args={[0.3, 0.08, 16, 32]} />
                 <meshStandardMaterial 
                    color={executionStep === 2 ? "#facc15" : "#14532d"} 
                    emissive={executionStep === 2 ? "#facc15" : "black"} 
                 />
             </mesh>
             <InfoHotspot 
                position={[0, 0, 0.3]} 
                data={{ 
                    title: "Stomata", 
                    description: "Pores that open and close to control gas exchange. CO₂ enters here for the Calvin Cycle." 
                }}
                onSelect={onInfoSelect}
                visible={showLabels}
            />
        </group>
      </group>

      {/* --- MOLECULES --- */}

      {/* CO2 - Atmospheric */}
      <group>
         <AtomicMolecule 
            type="co2" 
            position={[5, 2, 8]} // Start closer to camera/air
            animateTo={co2Target} 
            label={showLabels ? "CO₂" : undefined}
         />
      </group>
      
      {/* H2O - Roots */}
      <group>
         <AtomicMolecule 
            type="h2o" 
            position={[0, -9, 0]} 
            animateTo={h2oTarget} 
            label={showLabels ? "H₂O" : undefined}
         />
      </group>
      
      {/* O2 - Released */}
      <group>
         <AtomicMolecule 
            type="o2" 
            position={executionStep >= 4 ? [0, 1, 0.5] : [0, 1, 0.5]} 
            animateTo={o2Target} 
            label={showLabels ? "O₂" : undefined}
         />
      </group>

      <Sparkles count={100} scale={15} size={2} speed={0.4} opacity={0.3} color="#fcd34d" />
    </group>
  );
};