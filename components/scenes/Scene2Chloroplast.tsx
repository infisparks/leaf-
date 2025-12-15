import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { InfoData } from '../../types';
import { InfoHotspot } from '../InfoHotspot';

interface Scene2Props {
  showLabels: boolean;
  opacity?: number;
  onInfoSelect: (data: InfoData) => void;
  executionStep: number;
}

export const Scene2Chloroplast: React.FC<Scene2Props> = ({ showLabels, opacity = 1, onInfoSelect, executionStep }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
        groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  const getHighlightColor = (isActive: boolean, baseColor: string, highlightColor: string = "#facc15") => {
      return isActive ? highlightColor : baseColor;
  };

  const getEmissive = (isActive: boolean) => isActive ? 0.5 : 0;

  return (
    <group ref={groupRef}>
      
      {/* Main Title Label */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text 
            position={[0, 6.5, 0]} 
            fontSize={0.6} 
            color="#ecfccb" 
            anchorX="center" 
            anchorY="middle" 
            outlineWidth={0.04} 
            outlineColor="#14532d"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        >
            CHLOROPLAST STRUCTURE
        </Text>
      </Float>

      {/* Outer Membrane */}
      <mesh receiveShadow castShadow>
        <capsuleGeometry args={[3.2, 8, 4, 32]} />
        <meshPhysicalMaterial 
            color={getHighlightColor(executionStep === 1, "#4ade80")}
            emissive={executionStep === 1 ? "#4ade80" : "#000000"}
            emissiveIntensity={getEmissive(executionStep === 1)}
            transparent 
            opacity={0.15 * opacity} 
            roughness={0.1} 
            metalness={0.1} 
            transmission={0.5} 
            thickness={1}
            side={THREE.DoubleSide}
            clearcoat={1}
        />
      </mesh>
       <mesh receiveShadow>
        <capsuleGeometry args={[3, 7.8, 4, 32]} />
        <meshPhysicalMaterial 
            color="#22c55e" 
            transparent 
            opacity={0.1 * opacity} 
            roughness={0.2} 
            side={THREE.DoubleSide}
        />
      </mesh>

      <InfoHotspot 
        position={[3.2, 2, 0]} 
        data={{ 
            title: "Double Membrane", 
            description: "The chloroplast is surrounded by a double membrane (outer and inner) which regulates the movement of molecules in and out of the organelle." 
        }}
        onSelect={onInfoSelect}
        visible={showLabels}
      />

      {/* Internal Structures - Grana (Stacks) */}
      <group position={[0, -2, 0]}>
        {[
            { pos: [-1.2, 0, 0], rot: [0, 0, 0.05], height: 8 },
            { pos: [1.2, 1, 0.5], rot: [0.1, 0, -0.05], height: 6 },
            { pos: [-0.5, 2.5, -1.2], rot: [-0.1, 0, 0], height: 5 },
            { pos: [0.5, -1.5, 1.2], rot: [0, 0, 0.1], height: 4 },
        ].map((stack, stackIdx) => (
            <group key={stackIdx} position={stack.pos as any} rotation={stack.rot as any}>
                {Array.from({ length: stack.height }).map((_, i) => (
                    <mesh key={i} position={[0, i * 0.35, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.8, 0.8, 0.25, 32]} />
                        <meshStandardMaterial 
                            color={getHighlightColor(executionStep === 2, "#15803d")}
                            emissive={executionStep === 2 ? "#22c55e" : "#000000"}
                            emissiveIntensity={getEmissive(executionStep === 2)}
                            roughness={0.3} 
                        />
                        {i % 3 === 0 && stackIdx < 2 && (
                             <mesh position={[1, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                                 <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
                                 <meshStandardMaterial color="#166534" />
                             </mesh>
                        )}
                    </mesh>
                ))}
            </group>
        ))}

        {/* Stroma Visualization - Enhanced Highlight */}
        {executionStep === 3 && (
            <group>
                <mesh position={[0, 2, 0]}>
                     <sphereGeometry args={[2.8, 32, 32]} />
                     <meshBasicMaterial 
                        color="#facc15" 
                        transparent 
                        opacity={0.25} 
                        side={THREE.DoubleSide} 
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
                <mesh position={[0, 2, 0]}>
                     <sphereGeometry args={[3.0, 32, 32]} />
                     <meshBasicMaterial 
                        color="#facc15" 
                        transparent 
                        opacity={0.1} 
                        side={THREE.BackSide} 
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            </group>
        )}

        <InfoHotspot 
            position={[-1.2, 3, 1]} 
            data={{ 
                title: "Thylakoid Stack (Granum)", 
                description: "Thylakoids are disc-like sacs arranged in stacks called Grana. Their membranes contain chlorophyll and are the site of the Light Reactions." 
            }}
            onSelect={onInfoSelect}
            visible={showLabels}
        />
        
        <InfoHotspot 
            position={[2, 0, 0]} 
            data={{ 
                title: "Stroma", 
                description: "The Stroma is the fluid-filled space surrounding the grana. This is where the Calvin Cycle occurs, converting CO₂, ATP, and NADPH into sugar." 
            }}
            onSelect={onInfoSelect}
            visible={showLabels}
        />
      </group>
        
      <Sparkles count={50} scale={6} size={2} color="#fef08a" opacity={0.3} speed={0.2} />
    </group>
  );
};