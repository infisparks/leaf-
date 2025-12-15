import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { InfoData } from '../../types';
import { InfoHotspot } from '../InfoHotspot';

interface Scene3Props {
  intensity: number;
  photolysis: boolean;
  showLabels: boolean;
  position?: [number, number, number];
  scale?: number;
  onInfoSelect: (data: InfoData) => void;
  executionStep: number;
}

// Organic "Protein" Blob Component
const ProteinBlob: React.FC<{ color: string, scale?: number, position: [number, number, number], name: string, highlighted?: boolean }> = ({ color, scale = 1, position, name, highlighted }) => {
  return (
    <group position={position} scale={scale}>
        {/* Main Unit */}
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
            <dodecahedronGeometry args={[1, 1]} /> 
            <meshStandardMaterial 
                color={highlighted ? "#facc15" : color} 
                emissive={highlighted ? "#facc15" : "#000000"}
                emissiveIntensity={highlighted ? 0.8 : 0}
                roughness={0.3} 
                metalness={0.1} 
            />
        </mesh>
        <mesh position={[0.6, 0.2, 0.4]} scale={0.6}>
             <sphereGeometry args={[1, 16, 16]} />
             <meshStandardMaterial color={highlighted ? "#facc15" : color} emissive={highlighted ? "#facc15" : "black"} />
        </mesh>
        <mesh position={[-0.5, 0.8, -0.3]} scale={0.5}>
             <sphereGeometry args={[1, 16, 16]} />
             <meshStandardMaterial color={highlighted ? "#facc15" : color} emissive={highlighted ? "#facc15" : "black"} />
        </mesh>
        
        <Text position={[0, 2, 0]} fontSize={0.3} color="white" outlineWidth={0.02}>{name}</Text>
    </group>
  )
}

// Particle Component
const Particle: React.FC<{ start: [number, number, number], end: [number, number, number], color: string, speed: number, size?: number }> = ({ start, end, color, speed, size=0.1 }) => {
    const ref = useRef<THREE.Mesh>(null);
    const offset = useRef(Math.random() * 100);

    useFrame((state) => {
        if (ref.current) {
            const t = (state.clock.elapsedTime * speed + offset.current) % 1;
            ref.current.position.lerpVectors(new THREE.Vector3(...start), new THREE.Vector3(...end), t);
            
            // Pulse effect
            const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
            ref.current.scale.setScalar(scale);
        }
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshBasicMaterial color={color} toneMapped={false} />
            <pointLight distance={1} intensity={0.5} color={color} />
        </mesh>
    );
};

export const Scene3LightReaction: React.FC<Scene3Props> = ({ intensity, photolysis, showLabels, position = [0,0,0], scale=1, onInfoSelect, executionStep }) => {
  const atpSynthaseRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (atpSynthaseRef.current) {
        // Spin faster during ATP generation step
      atpSynthaseRef.current.rotation.y += executionStep === 4 ? 0.3 : 0.05 * (intensity * 3);
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      
      {/* Background Sun - Circular Spheres - MOVED FAR AWAY */}
      {intensity > 0.1 && (
        <group position={[-20, 15, -15]} scale={1.5}>
            <mesh>
                <sphereGeometry args={[4, 32, 32]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            <mesh>
                <sphereGeometry args={[5, 32, 32]} />
                <meshBasicMaterial color="#fcd34d" transparent opacity={0.5} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
            <mesh>
                <sphereGeometry args={[7, 32, 32]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.BackSide} />
            </mesh>
        </group>
      )}

      {/* Lipid Bilayer Membrane - Detailed Floor */}
      <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
         <mesh position={[0, 0, 0.2]} receiveShadow>
            <boxGeometry args={[14, 8, 0.4]} />
            <meshStandardMaterial color="#86efac" roughness={0.5} />
         </mesh>
         <mesh position={[0, 0, -0.2]} receiveShadow>
            <boxGeometry args={[14, 8, 0.4]} />
            <meshStandardMaterial color="#86efac" roughness={0.5} />
         </mesh>
         <mesh position={[0, 0, 0]}>
             <boxGeometry args={[13.8, 7.8, 0.3]} />
             <meshStandardMaterial color="#064e3b" />
         </mesh>
      </group>

      <InfoHotspot 
         position={[0, -1, 3]} 
         data={{ title: "Thylakoid Membrane", description: "This phospholipid bilayer houses the Photosystems and Electron Transport Chain. It separates the Stroma from the Thylakoid Lumen." }}
         onSelect={onInfoSelect}
         visible={showLabels}
      />

      {/* Photosystem II */}
      <group position={[-4, 0, 0]}>
          <ProteinBlob name="Photosystem II" color="#16a34a" position={[0, 0, 0]} highlighted={executionStep === 1} />
          <InfoHotspot 
             position={[0, 1, 0]} 
             data={{ title: "Photosystem II", description: "The first protein complex in the light-dependent reactions. It absorbs light energy to energize electrons and splits water molecules (Photolysis)." }}
             onSelect={onInfoSelect}
             visible={showLabels}
          />
      </group>
      
      {/* Electron Transport Chain (Cytochrome Complex) */}
      <group position={[-1, 0, 0.5]}>
          <ProteinBlob name="Cytochrome" color="#d97706" scale={0.7} position={[0, 0, 0]} highlighted={executionStep === 2} />
          <InfoHotspot 
             position={[0, 1, 0]} 
             data={{ title: "Cytochrome Complex", description: "Pumps protons (H+) into the thylakoid lumen as electrons pass through it, creating a proton gradient used to make ATP." }}
             onSelect={onInfoSelect}
             visible={showLabels}
          />
      </group>

      {/* Photosystem I */}
      <group position={[2, 0, 0]}>
          <ProteinBlob name="Photosystem I" color="#22c55e" position={[0, 0, 0]} highlighted={executionStep === 3} />
          <InfoHotspot 
             position={[0, 1, 0]} 
             data={{ title: "Photosystem I", description: "Re-energizes electrons using light energy. These high-energy electrons are then used to convert NADP+ into NADPH." }}
             onSelect={onInfoSelect}
             visible={showLabels}
          />
      </group>

      {/* ATP Synthase */}
      <group position={[5, 0, 0]}>
         <group ref={atpSynthaseRef} position={[0, 1.2, 0]}>
            <mesh castShadow>
                <sphereGeometry args={[0.7, 16, 16]} />
                <meshStandardMaterial 
                    color={executionStep === 4 ? "#facc15" : "#f97316"} 
                    emissive={executionStep === 4 ? "#facc15" : "black"} 
                    roughness={0.2} 
                />
            </mesh>
            {[0, 1, 2].map(r => (
                <mesh key={r} rotation={[0, r * (Math.PI*2/3), 0]} position={[0, 0, 0]}>
                    <capsuleGeometry args={[0.15, 1.6, 4, 8]} />
                    <meshStandardMaterial color={executionStep === 4 ? "#fef08a" : "#fdba74"} />
                </mesh>
            ))}
         </group>
         <mesh position={[0, 0, 0]}>
             <cylinderGeometry args={[0.2, 0.2, 1.5]} />
             <meshStandardMaterial color="#fdba74" />
         </mesh>
         <Text position={[0, 2.8, 0]} fontSize={0.3} color="#fdba74">ATP Synthase</Text>
         <InfoHotspot 
             position={[0, 1.5, 0]} 
             data={{ title: "ATP Synthase", description: "A molecular turbine. As protons (H+) flow back through it, it spins and generates ATP from ADP and phosphate." }}
             onSelect={onInfoSelect}
             visible={showLabels}
          />
      </group>

      {/* VISUAL EFFECTS & LOGIC */}
      {(photolysis || executionStep > 0) && (
        <>
            {/* Water Splitting at PSII - Active during Step 1 */}
            {(executionStep === -1 || executionStep === 1) && (
                <group position={[-4, -1.5, 1]}>
                    <Html transform sprite>
                        <div className="text-blue-200 text-xs bg-blue-900/50 px-1 rounded whitespace-nowrap">H₂O → 2H⁺ + ½O₂ + 2e⁻</div>
                    </Html>
                    <Particle start={[0, -1, 0]} end={[0, 1.5, 0]} color="#fbbf24" speed={1} size={0.15} />
                    <Particle start={[0, 0, 0]} end={[1, 0.5, 1]} color="#ef4444" speed={0.5} size={0.2} />
                    <InfoHotspot 
                        position={[0, 0, 0]} 
                        data={{ title: "Photolysis", description: "Light energy splits water molecules into Oxygen, Protons, and Electrons. Oxygen is released as a byproduct." }}
                        onSelect={onInfoSelect}
                        visible={showLabels}
                    />
                </group>
            )}

            {/* Electron Flow Path - Active Step 2 & 3 */}
            {(executionStep === -1 || executionStep >= 2) && (
                <>
                    <Particle start={[-3.5, 0.5, 0]} end={[-1.5, 0.5, 0.5]} color="#fde047" speed={2 * intensity} />
                    <Particle start={[-0.5, 0.5, 0.5]} end={[1.5, 0.5, 0]} color="#fde047" speed={2 * intensity} />
                </>
            )}
            
            {(executionStep === -1 || executionStep >= 3) && (
                <Particle start={[2.5, 0.5, 0]} end={[3.5, 2, 0]} color="#fde047" speed={3 * intensity} />
            )}

            {/* Protons (H+) Pumping through ATP Synthase - Active Step 4 */}
            {(executionStep === -1 || executionStep === 4) && Array.from({length: 6}).map((_, i) => (
                <Particle key={`h-${i}`} start={[5, -2, 0]} end={[5, 2.5, 0]} color="#ffffff" speed={0.5 + Math.random() * 0.5 * intensity} size={0.08} />
            ))}

            <group position={[3.5, 2.2, 0]}>
                 <Float speed={2}>
                    <mesh>
                         <octahedronGeometry args={[0.4]} />
                         <meshStandardMaterial 
                            color="#3b82f6" 
                            emissive={executionStep === 3 ? "#3b82f6" : "#000000"} 
                            emissiveIntensity={executionStep === 3 ? 1 : 0.5} 
                        />
                    </mesh>
                 </Float>
                 <Text position={[0, 0.6, 0]} fontSize={0.3} color="#93c5fd">NADPH</Text>
                 <InfoHotspot 
                    position={[0, 0, 0]} 
                    data={{ title: "NADPH", description: "A high-energy electron carrier molecule produced in the light reaction. It carries energy to the Calvin Cycle." }}
                    onSelect={onInfoSelect}
                    visible={showLabels}
                />
            </group>

             <group position={[6, 2.5, 0]}>
                 <Float speed={4} rotationIntensity={2}>
                    <mesh>
                         <dodecahedronGeometry args={[0.4]} />
                         <meshStandardMaterial 
                            color="#eab308" 
                            emissive={executionStep === 4 ? "#eab308" : "#000000"} 
                            emissiveIntensity={executionStep === 4 ? 1 : 0.8} 
                        />
                    </mesh>
                 </Float>
                 <Text position={[0, 0.6, 0]} fontSize={0.3} color="#fde047">ATP</Text>
                 <InfoHotspot 
                    position={[0, 0, 0]} 
                    data={{ title: "ATP", description: "Adenosine Triphosphate. The primary energy currency of the cell. It powers the Calvin Cycle." }}
                    onSelect={onInfoSelect}
                    visible={showLabels}
                />
            </group>
        </>
      )}

      {/* Sun Rays */}
      {intensity > 0.1 && (
        <group position={[-2, 6, 0]} rotation={[0, 0, -0.2]}>
             <spotLight intensity={intensity * 2} distance={20} angle={0.5} penumbra={1} color="#fef08a" castShadow />
             <mesh rotation={[0, 0, 0]}>
                 <coneGeometry args={[2, 10, 32, 1, true]} />
                 <meshBasicMaterial color="#fef08a" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
             </mesh>
        </group>
      )}

    </group>
  );
};