import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, ContactShadows, BakeShadows } from '@react-three/drei';
import * as THREE from 'three';
import { SceneType, SimulationState, InfoData, SCENE_SCRIPTS } from './types';
import { UIOverlay } from './components/UIOverlay';
import { InfoModal } from './components/InfoModal';
import { Scene1Leaf } from './components/scenes/Scene1Leaf';
import { Scene2Chloroplast } from './components/scenes/Scene2Chloroplast';
import { Scene3LightReaction } from './components/scenes/Scene3LightReaction';
import { Scene4CalvinCycle } from './components/scenes/Scene4CalvinCycle';
import { Scene5Summary } from './components/scenes/Scene5Summary';
import { Scene6Practice } from './components/scenes/Scene6Practice';

// --- Camera Director Component for Auto Zoom ---
const CameraDirector: React.FC<{ 
  appState: SimulationState; 
  controlsRef: React.RefObject<any>;
}> = ({ appState, controlsRef }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 4, 12));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    // Only control camera if execution is active
    if (!appState.executionActive) {
        return; 
    }
    
    const script = SCENE_SCRIPTS[appState.currentScene];
    const step = script?.[appState.executionStep];
    
    if (step) {
      // Determine targets - Default to Overview position if not specified
      const stepCamPos = step.cameraPos ? new THREE.Vector3(...step.cameraPos) : new THREE.Vector3(0, 4, 12);
      const stepLookAt = step.cameraLookAt ? new THREE.Vector3(...step.cameraLookAt) : new THREE.Vector3(0, -1, 0);

      // Smoothly interpolate current targets
      targetPos.current.lerp(stepCamPos, delta * 2); // Speed of camera move
      targetLookAt.current.lerp(stepLookAt, delta * 2); // Speed of lookAt turn

      // Apply to camera and controls
      camera.position.lerp(targetPos.current, delta * 2);
      
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, delta * 2);
        controlsRef.current.update();
      }
    }
  });
  return null;
}

// --- Voice Selection Helper ---
const getIndianVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  // Priority list for Indian voices
  const preferred = voices.find(v => v.name.includes("Rishi") || v.name.includes("Sangeeta") || v.name.includes("Veena") || v.name.includes("Prabhat"));
  if (preferred) return preferred;
  
  const anyHindi = voices.find(v => v.lang.includes("hi-IN") || v.name.includes("Hindi"));
  if (anyHindi) return anyHindi;

  const anyIndianEnglish = voices.find(v => v.lang === "en-IN");
  if (anyIndianEnglish) return anyIndianEnglish;

  return null;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<SimulationState>({
    currentScene: SceneType.LEAF_OVERVIEW,
    lightIntensity: 0.8,
    photolysisEnabled: true,
    showLabels: true,
    executionActive: false,
    executionStep: 0,
  });

  const [selectedInfo, setSelectedInfo] = useState<InfoData | null>(null);
  const controlsRef = useRef<any>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load Voices
  useEffect(() => {
    const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Handle Scene Transitions
  const nextScene = () => {
    stopExecution();
    setAppState((prev) => ({
      ...prev,
      currentScene: Math.min(prev.currentScene + 1, SceneType.PRACTICE),
    }));
    setSelectedInfo(null);
  };

  const prevScene = () => {
    stopExecution();
    setAppState((prev) => ({
      ...prev,
      currentScene: Math.max(prev.currentScene - 1, SceneType.LEAF_OVERVIEW),
    }));
    setSelectedInfo(null);
  };

  const jumpToScene = (scene: SceneType) => {
    stopExecution();
    setAppState((prev) => ({ ...prev, currentScene: scene }));
    setSelectedInfo(null);
  };

  // Execution Logic
  const startExecution = () => {
    setAppState(prev => ({ ...prev, executionActive: true, executionStep: 0 }));
  };

  const stopExecution = () => {
    setAppState(prev => ({ ...prev, executionActive: false, executionStep: 0 }));
    window.speechSynthesis.cancel();
    if ((window as any).speechInterval) {
        clearInterval((window as any).speechInterval);
    }
  };

  // Execution Loop - Robust Speech Handling with "Keep Alive" for Chrome
  useEffect(() => {
    if (!appState.executionActive) {
      window.speechSynthesis.cancel();
      return;
    }

    const script = SCENE_SCRIPTS[appState.currentScene];
    if (!script || appState.executionStep >= script.length) {
      stopExecution();
      return;
    }

    const stepData = script[appState.executionStep];
    
    // 1. Clean up previous
    window.speechSynthesis.cancel();
    if ((window as any).speechInterval) clearInterval((window as any).speechInterval);
    
    const utterance = new SpeechSynthesisUtterance(stepData.text);
    
    // 2. Setup Voice
    const currentVoices = window.speechSynthesis.getVoices();
    const indianVoice = getIndianVoice(currentVoices);
    if (indianVoice) {
        utterance.voice = indianVoice;
        utterance.rate = 0.9; 
    } else {
        utterance.rate = 0.9;
    }
    utterance.pitch = 1.0;
    
    // 3. Attach to window to prevent Garbage Collection (Fix for cutting off early)
    (window as any).currentSimulationUtterance = utterance;

    // 4. CHROME FIX: Resume interval. Chrome stops speech after ~15s. This kicks it to keep going.
    const resumeInterval = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
        }
    }, 4000); // Run every 4 seconds
    (window as any).speechInterval = resumeInterval;

    // 5. Handle Event Completion
    utterance.onend = () => {
        clearInterval(resumeInterval);
        // Wait 1.5s after finishing to ensure full sentence is processed and provide pacing
        setTimeout(() => {
            setAppState(prev => {
                if (!prev.executionActive || prev.executionStep !== appState.executionStep) return prev;
                return { ...prev, executionStep: prev.executionStep + 1 };
            });
        }, 1500);
    };

    utterance.onerror = (e) => {
        console.warn("Speech error, falling back to timer", e);
        clearInterval(resumeInterval);
        // Fallback safety timer
        setTimeout(() => {
          setAppState(prev => {
              if (!prev.executionActive || prev.executionStep !== appState.executionStep) return prev;
              return { ...prev, executionStep: prev.executionStep + 1 };
          });
        }, 2000);
    };

    // 6. Start Speaking (Delayed slightly to allow cancel to process)
    setTimeout(() => {
         if (appState.executionActive) {
            window.speechSynthesis.speak(utterance);
         }
    }, 50);
    
    return () => {
        if ((window as any).speechInterval) clearInterval((window as any).speechInterval);
        // Note: We intentionally do not cancel here to allow the sentence to finish 'trailing' if needed, 
        // but the next effect iteration calls cancel() at the top anyway.
    };

  }, [appState.executionActive, appState.executionStep, appState.currentScene]);


  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Info Modal Layer - Highest Z-Index */}
      <InfoModal info={selectedInfo} onClose={() => setSelectedInfo(null)} />

      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas 
            shadows 
            dpr={[1, 2]}
            gl={{ 
                antialias: true, 
                toneMapping: THREE.ACESFilmicToneMapping, 
                toneMappingExposure: 1.2,
                outputColorSpace: THREE.SRGBColorSpace
            }}
        >
          <PerspectiveCamera makeDefault position={[0, 4, 12]} fov={40} />
          
          {/* Camera Director for Auto Zoom */}
          <CameraDirector appState={appState} controlsRef={controlsRef} />

          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 10, 40]} />
          
          {/* Cinematic Lighting Setup */}
          <ambientLight intensity={0.4} color="#a5f3fc" />
          
          <directionalLight 
            position={[8, 15, 8]} 
            intensity={appState.lightIntensity * 4} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
            color="#fff7ed"
          >
             <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
          </directionalLight>

          <spotLight 
            position={[-5, 5, 0]} 
            intensity={2} 
            color="#4ade80" 
            angle={0.6} 
            penumbra={0.5} 
            distance={20}
          />
          
          <Environment preset="forest" background={false} blur={0.5} />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.2} />
          
          <group position={[0, -1.5, 0]}>
            <Suspense fallback={null}>
              {appState.currentScene === SceneType.LEAF_OVERVIEW && (
                <Scene1Leaf 
                  showLabels={appState.showLabels} 
                  onInfoSelect={setSelectedInfo}
                  executionStep={appState.executionActive ? appState.executionStep : -1} 
                />
              )}
              {appState.currentScene === SceneType.CHLOROPLAST_ZOOM && (
                <Scene2Chloroplast 
                  showLabels={appState.showLabels} 
                  onInfoSelect={setSelectedInfo}
                  executionStep={appState.executionActive ? appState.executionStep : -1}
                />
              )}
              {appState.currentScene === SceneType.LIGHT_REACTION && (
                <Scene3LightReaction 
                  intensity={appState.lightIntensity} 
                  photolysis={appState.photolysisEnabled}
                  showLabels={appState.showLabels} 
                  onInfoSelect={setSelectedInfo}
                  executionStep={appState.executionActive ? appState.executionStep : -1}
                />
              )}
              {appState.currentScene === SceneType.CALVIN_CYCLE && (
                <Scene4CalvinCycle 
                  showLabels={appState.showLabels} 
                  onInfoSelect={setSelectedInfo}
                  executionStep={appState.executionActive ? appState.executionStep : -1}
                />
              )}
              {appState.currentScene === SceneType.SUMMARY && (
                <group>
                  <Scene3LightReaction intensity={0.5} photolysis={true} showLabels={false} position={[-6, 0, 0]} scale={0.5} onInfoSelect={() => {}} executionStep={-1} />
                  <Scene4CalvinCycle showLabels={false} position={[6, 0, 0]} scale={0.5} onInfoSelect={() => {}} executionStep={-1} />
                </group>
              )}
              {appState.currentScene === SceneType.PRACTICE && (
                <Scene2Chloroplast showLabels={false} opacity={0.3} onInfoSelect={() => {}} executionStep={-1} />
              )}
            </Suspense>
            {/* Soft Contact Shadows for realism */}
            <ContactShadows opacity={0.6} scale={40} blur={2.5} far={4} color="#000000" />
          </group>
          
          <BakeShadows />
          <OrbitControls 
            ref={controlsRef}
            enablePan={false} 
            enableZoom={true} 
            minDistance={2} 
            maxDistance={35}
            autoRotate={appState.currentScene === SceneType.LEAF_OVERVIEW && !appState.executionActive}
            autoRotateSpeed={0.3}
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 1.6}
          />
        </Canvas>
      </div>

      {/* UI Overlay Layer */}
      <UIOverlay 
        appState={appState} 
        setAppState={setAppState} 
        onNext={nextScene}
        onPrev={prevScene}
        onJump={jumpToScene}
        onStartExecution={startExecution}
        onStopExecution={stopExecution}
      />
    </div>
  );
};

export default App;