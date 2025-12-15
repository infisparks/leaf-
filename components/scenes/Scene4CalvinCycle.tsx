import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { InfoData } from '../../types';
import { InfoHotspot } from '../InfoHotspot';

interface Scene4Props {
  showLabels: boolean;
  position?: [number, number, number];
  scale?: number;
  onInfoSelect: (data: InfoData) => void;
  executionStep: number;
}

// Molecule Builder
const ChemicalMolecule: React.FC<{ carbons: number, color: string, label: string, position: [number, number, number], highlighted?: boolean }> = ({ carbons, color, label, position, highlighted }) => {
    return (
        <group position={position}>
            <group>
                {Array.from({ length: carbons }).map((_, i) => {
                    const angle = (i / carbons) * Math.PI * 2;
                    const radius = carbons > 2 ? 0.4 : 0.25;
                    const x = carbons > 1 ? Math.cos(angle) * radius : 0;
                    const y = carbons > 1 ? Math.sin(angle) * radius : 0;
                    
                    return (
                        <mesh key={i} position={[x, y, 0]} castShadow>
                            <sphereGeometry args={[0.25, 16, 16]} />
                            <meshStandardMaterial 
                                color={highlighted ? "#facc15" : color} 
                                emissive={highlighted ? "#facc15" : "#000000"} 
                                emissiveIntensity={highlighted ? 0.5 : 0}
                                roughness={0.2} 
                                metalness={0.1} 
                            />
                        </mesh>
                    )
                })}
                {carbons > 2 && (
                    <mesh rotation={[Math.PI/2, 0, 0]}>
                        <torusGeometry args={[0.4, 0.08, 8, 16]} />
                        <meshStandardMaterial color="white" opacity={0.5} transparent />
                    </mesh>
                )}
            </group>
            <Html position={[0, 0.8, 0]} center>
                <div className={`
                    text-xs font-bold px-2 py-1 rounded backdrop-blur-sm whitespace-nowrap border
                    ${highlighted ? 'bg-yellow-500/80 text-black border-yellow-300' : 'bg-black/40 text-white border-white/10'}
                `}>
                    {label}
                </div>
            </Html>
        </group>
    )
}

export const Scene4CalvinCycle: React.FC<Scene4Props> = ({ showLabels, position = [0,0,0], scale=1, onInfoSelect, executionStep }) => {
  const cycleRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (cycleRef.current) {
        cycleRef.current.rotation.z = -state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
        
        {/* Cycle Path Floor Decal */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
             <ringGeometry args={[3, 4, 64]} />
             <meshBasicMaterial color="#ffffff" opacity={0.05} transparent side={THREE.DoubleSide} />
        </mesh>
        
        {[0, 90, 180, 270].map((deg, i) => (
             <group key={i} rotation={[-Math.PI/2, 0, (deg * Math.PI) / 180]}>
                 <mesh position={[3.5, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
                    <coneGeometry args={[0.2, 0.5, 16]} />
                    <meshBasicMaterial color="white" opacity={0.2} transparent />
                 </mesh>
             </group>
        ))}

        <group ref={cycleRef}>
            {/* RuBP */}
            <group position={[3.5, 0, 0]}>
                <ChemicalMolecule position={[0,0,0]} carbons={5} color="#a855f7" label="RuBP" highlighted={executionStep === 1} />
                <InfoHotspot 
                    position={[0, 1.2, 0]} 
                    data={{ title: "Carbon Fixation", description: "The enzyme Rubisco attaches CO₂ to RuBP (a 5-carbon molecule). This is the crucial first step where inorganic carbon becomes organic." }}
                    onSelect={onInfoSelect}
                    visible={showLabels}
                />
            </group>
            
            {/* PGA */}
            <group position={[0, 3.5, 0]}>
                <ChemicalMolecule position={[0,0,0]} carbons={3} color="#f472b6" label="PGA" />
            </group>

            {/* G3P */}
            <group position={[-3.5, 0, 0]}>
                <ChemicalMolecule position={[0,0,0]} carbons={3} color="#34d399" label="G3P" highlighted={executionStep === 2} />
                <InfoHotspot 
                    position={[0, 1.2, 0]} 
                    data={{ title: "Reduction Phase", description: "ATP and NADPH from the light reaction are used to convert PGA into G3P, a 3-carbon sugar precursor." }}
                    onSelect={onInfoSelect}
                    visible={showLabels}
                />
            </group>
            
            {/* Regeneration */}
            <group position={[0, -3.5, 0]}>
                <ChemicalMolecule position={[0,0,0]} carbons={4} color="#60a5fa" label="Regeneration" highlighted={executionStep === 4} />
                <InfoHotspot 
                    position={[0, 1.2, 0]} 
                    data={{ title: "Regeneration of RuBP", description: "Some G3P leaves the cycle to form glucose, but most is recycled back into RuBP using ATP, so the cycle can continue." }}
                    onSelect={onInfoSelect}
                    visible={showLabels}
                />
            </group>
        </group>

        {/* Inputs */}
        <group position={[4, 4, 0]}>
            <Float floatIntensity={2} speed={2}>
                 <ChemicalMolecule position={[0,0,0]} carbons={1} color="#94a3b8" label="CO₂" highlighted={executionStep === 1} />
            </Float>
            <mesh position={[-1, -1, 0]} rotation={[0, 0, Math.PI/4]}>
                <cylinderGeometry args={[0.02, 0.02, 3]} />
                <meshBasicMaterial color={executionStep === 1 ? "#facc15" : "white"} opacity={0.3} transparent />
            </mesh>
        </group>

        <group position={[-4, 4, 0]}>
             <Float floatIntensity={1} speed={3}>
                <group>
                    <Text position={[0, 0.8, 0]} fontSize={0.3} color="#fbbf24">Energy Input</Text>
                     <mesh position={[-0.4, 0, 0]}>
                        <dodecahedronGeometry args={[0.3]} />
                        <meshStandardMaterial color={executionStep === 2 ? "#facc15" : "#fbbf24"} emissive={executionStep === 2 ? "#facc15" : "black"} />
                    </mesh>
                    <mesh position={[0.4, 0, 0]}>
                        <octahedronGeometry args={[0.3]} />
                        <meshStandardMaterial color={executionStep === 2 ? "#facc15" : "#60a5fa"} emissive={executionStep === 2 ? "#facc15" : "black"} />
                    </mesh>
                </group>
            </Float>
             <mesh position={[1, -1, 0]} rotation={[0, 0, -Math.PI/4]}>
                <cylinderGeometry args={[0.02, 0.02, 3]} />
                <meshBasicMaterial color={executionStep === 2 ? "#facc15" : "white"} opacity={0.3} transparent />
            </mesh>
        </group>

        {/* Output */}
        <group position={[-5, -2, 0]}>
            <Float floatIntensity={0.5} speed={1}>
                 <group>
                    <ChemicalMolecule position={[0,0,0]} carbons={6} color="#22c55e" label="Glucose" highlighted={executionStep === 3} />
                    <InfoHotspot 
                        position={[0, 1.2, 0]} 
                        data={{ title: "Glucose Output", description: "Two G3P molecules combine to form one Glucose molecule (C₆H₁₂O₆), which is used by the plant for energy and growth." }}
                        onSelect={onInfoSelect}
                        visible={showLabels}
                    />
                 </group>
            </Float>
             <mesh position={[2, 1, 0]} rotation={[0, 0, Math.PI/4]}>
                <cylinderGeometry args={[0.05, 0.05, 2]} />
                <meshBasicMaterial color={executionStep === 3 ? "#facc15" : "white"} opacity={0.5} transparent />
            </mesh>
        </group>
        
        {showLabels && (
            <Text position={[0, 0, 0]} fontSize={0.5} color="#cbd5e1" maxWidth={4} textAlign="center" fillOpacity={0.5}>
                Calvin Cycle
            </Text>
        )}
    </group>
  );
};