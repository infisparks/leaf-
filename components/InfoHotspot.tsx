import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { Info } from 'lucide-react';
import { InfoData } from '../types';
import * as THREE from 'three';

interface InfoHotspotProps {
  position: [number, number, number];
  data: InfoData;
  onSelect: (data: InfoData) => void;
  visible?: boolean;
}

export const InfoHotspot: React.FC<InfoHotspotProps> = ({ position, data, onSelect, visible = true }) => {
  const [hovered, setHovered] = useState(false);

  if (!visible) return null;

  return (
    <group position={position}>
      {/* Visual anchor point on the model */}
      <mesh>
        <sphereGeometry args={[0.08]} />
        <meshBasicMaterial color="#4ade80" toneMapped={false} />
      </mesh>
      
      {/* 3D Pulse Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.6} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      <Html center distanceFactor={12} zIndexRange={[50, 0]} style={{ pointerEvents: 'none' }}>
        <div className="flex flex-col items-center gap-0.5 pointer-events-auto transform transition-transform duration-200"
             style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)', marginBottom: '3rem' }} // Shift up to clear the point
             onClick={() => onSelect(data)}
             onMouseEnter={() => setHovered(true)}
             onMouseLeave={() => setHovered(false)}
        >
             
            {/* Always Visible Title Label */}
            <div className={`
                px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.5)] border cursor-pointer
                transition-colors duration-300 backdrop-blur-md
                ${hovered 
                    ? 'bg-green-500 text-white border-white' 
                    : 'bg-black/70 text-green-100 border-green-500/40'}
            `}>
                {data.title}
            </div>

            {/* Connector Line */}
            <div className={`w-0.5 h-4 transition-colors duration-300 ${hovered ? 'bg-green-500' : 'bg-green-500/50'}`}></div>

            {/* Icon Button */}
            <div className={`
                flex items-center justify-center w-8 h-8 rounded-full cursor-pointer
                border-2 transition-all duration-300 shadow-lg
                ${hovered ? 'bg-green-500 border-white text-white' : 'bg-black/80 border-green-500/50 text-green-400'}
            `}>
                <Info size={16} />
            </div>
        </div>
      </Html>
    </group>
  );
};