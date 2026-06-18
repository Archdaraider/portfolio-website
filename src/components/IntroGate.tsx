import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Center,
  Environment,
  Html,
  PerspectiveCamera,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { motion, useReducedMotion } from "motion/react";
import { Box3, LoopOnce, Vector3, type Group } from "three";

const INTRO_KEYCAP_ROTATION_X = 0;
const INTRO_KEYCAP_ROTATION_Y = Math.PI / 4;
const INTRO_KEYCAP_ROTATION_Z = 0;
const INTRO_REBOUND_START_MS = 240;
const INTRO_REVEAL_START_MS = 560;
const INTRO_COMPLETE_MS = 1180;

type IntroPhase = "idle" | "pressing" | "rebounding" | "revealing";

type IntroGateProps = {
  isVisible: boolean;
  onEnter: () => void;
};

export default function IntroGate({ isVisible, onEnter }: IntroGateProps) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<IntroPhase>("idle");
  const timers = useRef<number[]>([]);

  const clearIntroTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  useEffect(() => {
    if (!isVisible) {
      clearIntroTimers();
    }

    return clearIntroTimers;
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const enter = () => {
    if (phase !== "idle") return;

    if (prefersReducedMotion) {
      setPhase("revealing");
      onEnter();
      return;
    }

    setPhase("pressing");
    timers.current = [
      window.setTimeout(() => setPhase("rebounding"), INTRO_REBOUND_START_MS),
      window.setTimeout(() => setPhase("revealing"), INTRO_REVEAL_START_MS),
      window.setTimeout(onEnter, INTRO_COMPLETE_MS),
    ];
  };

  return (
    <motion.section
      className={`intro-gate ${phase !== "idle" ? `is-${phase}` : ""}`}
      data-intro-phase={phase}
      role="dialog"
      aria-label="Intro landing"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="intro-noise" aria-hidden="true" />
      <motion.button
        type="button"
        className="intro-keycap-button"
        aria-label="click me"
        onClick={enter}
      >
        <span className="intro-burst" aria-hidden="true" />
        <span className="intro-keycap-stage" aria-hidden="true">
          <Canvas
            camera={{ position: [0, 8.6, 7.2], fov: 40, near: 0.1, far: 100 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          >
            <IntroCamera />
            <ambientLight intensity={0.68} />
            <directionalLight position={[2, 4, 4]} intensity={0.95} />
            <Suspense
              fallback={
                <Html center>
                  <span className="canvas-loading">loading keycap</span>
                </Html>
              }
            >
              <Center>
                <IntroKeycapModel phase={phase} />
              </Center>
              <Environment preset="warehouse" environmentIntensity={0.5} />
            </Suspense>
          </Canvas>
        </span>
        <motion.span
          className="intro-subtitle"
          animate={{ opacity: phase === "idle" ? 1 : 0, y: phase === "idle" ? 0 : 10 }}
        >
          click me
        </motion.span>
      </motion.button>
    </motion.section>
  );
}

function IntroCamera() {
  const size = useThree((state) => state.size);
  const canvasWidth = size?.width ?? 1440;
  const isNarrow = canvasWidth < 640;

  return (
    <PerspectiveCamera
      makeDefault
      position={[0, isNarrow ? 10.2 : 8.6, isNarrow ? 8.8 : 7.2]}
      fov={isNarrow ? 56 : 40}
      near={0.1}
      far={100}
      onUpdate={(camera) => camera.lookAt(0, 0, 0)}
    />
  );
}

function IntroKeycapModel({ phase }: { phase: IntroPhase }) {
  const group = useRef<Group>(null);
  const gltf = useGLTF("/models/intro-keycap-press.glb", true);
  const { actions, names } = useAnimations(gltf.animations, group);
  const { scene, fitScale } = useMemo(() => {
    const clonedScene = gltf.scene.clone();
    clonedScene.traverse((node) => {
      if (node.name === "Backdrop") {
        node.visible = false;
      }
      if (node.name === "LogoAndFace_AttachedToKeycap") {
        node.rotation.y += Math.PI;
      }
    });
    clonedScene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(clonedScene);
    const size = box.getSize(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    const nextScale =
      maxDimension > 0 && Number.isFinite(maxDimension)
        ? 4.8 / maxDimension
        : 2.35;

    return {
      scene: clonedScene,
      fitScale: Math.max(1.8, Math.min(9.5, nextScale)),
    };
  }, [gltf.scene]);

  useEffect(() => {
    const clipName = names.includes("key_press") ? "key_press" : names[0];
    const action = clipName ? actions[clipName] : undefined;

    if (!action) {
      return;
    }

    if (phase === "pressing") {
      action.reset();
      action.setLoop(LoopOnce, 1);
      action.play();
    }

    if (phase === "idle") {
      action.stop();
    }
  }, [actions, names, phase]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const breath = phase === "idle" ? Math.sin(clock.elapsedTime * 1.4) * 0.035 : 0;
    group.current.position.y += (breath - group.current.position.y) * 0.18;
    group.current.rotation.x = INTRO_KEYCAP_ROTATION_X;
    group.current.rotation.y = INTRO_KEYCAP_ROTATION_Y;
    group.current.rotation.z = INTRO_KEYCAP_ROTATION_Z;
  });

  return (
    <group ref={group} scale={fitScale}>
      <primitive object={scene} />
    </group>
  );
}
