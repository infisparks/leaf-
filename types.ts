import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

export enum SceneType {
  LEAF_OVERVIEW = 0,
  CHLOROPLAST_ZOOM = 1,
  LIGHT_REACTION = 2,
  CALVIN_CYCLE = 3,
  SUMMARY = 4,
  PRACTICE = 5,
}

export interface SimulationState {
  currentScene: SceneType;
  lightIntensity: number; // 0 to 1
  photolysisEnabled: boolean;
  showLabels: boolean;
  executionActive: boolean;
  executionStep: number;
}

export interface InfoData {
  title: string;
  description: string;
}

export interface ScriptStep {
  text: string;
  duration: number; // milliseconds (Used as fallback/minimum)
  highlight?: string; // identifier for 3D object to highlight
  cameraPos?: [number, number, number];
  cameraLookAt?: [number, number, number];
}

export const SCENE_SCRIPTS: Record<number, ScriptStep[]> = {
  [SceneType.LEAF_OVERVIEW]: [
    { 
        text: "Welcome to the Leaf Overview. Notice how the leaf is oriented towards the light source to maximize energy absorption.", 
        duration: 5000,
        // ZOOMED OUT & CENTERED VIEW - Distance increased to 28
        cameraPos: [0, 2, 28], 
        cameraLookAt: [0, 2, 0] 
    },
    { 
        text: "Photons from the sun strike the leaf's broad surface. The waxy cuticle allows light to pass while preventing water loss.", 
        duration: 6000, 
        highlight: "sun",
        cameraPos: [0, 2, 28],
        cameraLookAt: [0, 2, 0]
    },
    { 
        text: "Carbon Dioxide (CO₂) from the atmosphere enters the leaf through adjustable pores called stomata.", 
        duration: 6000, 
        highlight: "co2",
        cameraPos: [0, 2, 28],
        cameraLookAt: [0, 2, 0]
    },
    { 
        text: "Water (H₂O) is absorbed by roots and travels up the stem through the xylem veins.", 
        duration: 5000, 
        highlight: "h2o",
        cameraPos: [0, 2, 28],
        cameraLookAt: [0, 2, 0]
    },
    { 
        text: "Inside the leaf cells, chloroplasts use these ingredients to produce glucose, releasing Oxygen (O₂) as a byproduct.", 
        duration: 7000, 
        highlight: "o2",
        cameraPos: [0, 2, 28],
        cameraLookAt: [0, 2, 0]
    }
  ],
  [SceneType.CHLOROPLAST_ZOOM]: [
    { 
        text: "We have zoomed into a single Chloroplast, the solar power plant of the cell.", 
        duration: 5000,
        cameraPos: [0, 8, 16], // Further back
        cameraLookAt: [0, 0, 0]
    },
    { 
        text: "It is protected by a Double Membrane that regulates transport.", 
        duration: 4000, 
        highlight: "membrane",
        cameraPos: [6, 6, 12], // Further back
        cameraLookAt: [0, 0, 0]
    },
    { 
        text: "Inside, we see stacks of discs called Thylakoids (Grana). This is where the Light Reaction captures energy.", 
        duration: 6000, 
        highlight: "thylakoid",
        cameraPos: [-4, 5, 12], // Further back
        cameraLookAt: [0, 0, 0]
    },
    { 
        text: "The fluid surrounding them is the Stroma. This is where the Calvin Cycle synthesizes sugar.", 
        duration: 6000, 
        highlight: "stroma",
        cameraPos: [4, 5, 12], // Further back
        cameraLookAt: [0, 0, 0]
    }
  ],
  [SceneType.LIGHT_REACTION]: [
    { 
        text: "We are now on the Thylakoid Membrane for the Light Reaction.", 
        duration: 4000,
        cameraPos: [0, 6, 18], // Further back
        cameraLookAt: [0, 0, 0]
    },
    { 
        text: "Step 1: Light hits Photosystem II. Water is split (Photolysis), releasing Oxygen and electrons.", 
        duration: 7000, 
        highlight: "ps2",
        cameraPos: [-4, 5, 12], // Further back
        cameraLookAt: [-4, 0, 0]
    },
    { 
        text: "Step 2: Excited electrons travel through the Cytochrome Complex, pumping protons (H+) inside.", 
        duration: 6000, 
        highlight: "cytochrome",
        cameraPos: [-1, 5, 12], // Further back
        cameraLookAt: [-1, 0, 0]
    },
    { 
        text: "Step 3: Electrons reach Photosystem I and are re-energized to create NADPH.", 
        duration: 6000, 
        highlight: "ps1",
        cameraPos: [2, 5, 12], // Further back
        cameraLookAt: [2, 0, 0]
    },
    { 
        text: "Step 4: The proton gradient powers ATP Synthase, generating ATP. ATP and NADPH now head to the Calvin Cycle.", 
        duration: 7000, 
        highlight: "atp",
        cameraPos: [5, 5, 12], // Further back
        cameraLookAt: [5, 1, 0]
    }
  ],
  [SceneType.CALVIN_CYCLE]: [
    { 
        text: "Welcome to the Stroma for the Calvin Cycle (Dark Reaction).", 
        duration: 4000,
        cameraPos: [0, 0, 20], // Further back
        cameraLookAt: [0, 0, 0]
    },
    { 
        text: "Step 1: Carbon Fixation. CO₂ attaches to RuBP to start the cycle.", 
        duration: 5000, 
        highlight: "rubp",
        cameraPos: [3, 4, 14], // Further back
        cameraLookAt: [3.5, 0, 0]
    },
    { 
        text: "Step 2: Reduction. Energy from ATP and NADPH converts the molecule into G3P.", 
        duration: 6000, 
        highlight: "reduction",
        cameraPos: [-3, 4, 14], // Further back
        cameraLookAt: [-3.5, 0, 0]
    },
    { 
        text: "Step 3: Glucose Production. Some G3P leaves the cycle to become Glucose (food).", 
        duration: 6000, 
        highlight: "glucose",
        cameraPos: [-5, 2, 14], // Further back
        cameraLookAt: [-5, -2, 0]
    },
    { 
        text: "Step 4: Regeneration. The remaining G3P is recycled back into RuBP to keep the cycle going.", 
        duration: 6000, 
        highlight: "regeneration",
        cameraPos: [0, -2, 14], // Further back
        cameraLookAt: [0, -3.5, 0]
    }
  ],
  [SceneType.SUMMARY]: [],
  [SceneType.PRACTICE]: []
};

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const QUIZ_DATA: QuizQuestion[] = [
  {
    id: 1,
    question: "Where does the Light Reaction occur?",
    options: ["Stroma", "Thylakoid Membrane", "Outer Membrane", "Nucleus"],
    correctAnswer: 1,
    explanation: "The Light Reaction takes place in the Thylakoid membranes where chlorophyll is located.",
  },
  {
    id: 2,
    question: "What is the main output of the Calvin Cycle?",
    options: ["Oxygen", "ATP", "Glucose (G3P)", "Water"],
    correctAnswer: 2,
    explanation: "The Calvin Cycle fixes CO2 to produce G3P, which forms Glucose.",
  },
  {
    id: 3,
    question: "Which molecule provides energy for the Calvin Cycle?",
    options: ["ATP & NADPH", "Oxygen", "ADP", "Sunlight directly"],
    correctAnswer: 0,
    explanation: "ATP and NADPH produced in the Light Reaction fuel the Calvin Cycle.",
  }
];