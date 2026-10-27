import { Suspense, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
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
import { KTX2Support, withKTX2 } from "../lib/ktx2";

const INTRO_KEYCAP_ROTATION_X = 0;
const INTRO_KEYCAP_ROTATION_Y = Math.PI / 4;
const INTRO_KEYCAP_ROTATION_Z = 0;
const INTRO_REBOUND_START_MS = 240;
const INTRO_REVEAL_START_MS = 560;
const INTRO_COMPLETE_MS = 1180;
const INTRO_ENTER_KEYS = new Set(["Enter", " ", "Escape", "ArrowDown", "PageDown"]);
const INTRO_SWIPE_PX = 24;

type IntroPhase = "idle" | "pressing" | "rebounding" | "revealing";

type IntroGateProps = {
  isVisible: boolean;
  onEnter: () => void;
};

export default function IntroGate({ isVisible, onEnter }: IntroGateProps) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<IntroPhase>("idle");
  // Mirrors `phase` synchronously so a click plus a key or wheel event can't double-enter.
  const phaseRef = useRef<IntroPhase>("idle");
  const timers = useRef<number[]>([]);

  const clearIntroTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const changePhase = (next: IntroPhase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const enter = () => {
    if (phaseRef.current !== "idle") return;

    if (prefersReducedMotion) {
      changePhase("revealing");
      onEnter();
      return;
    }

    changePhase("pressing");
    timers.current = [
      window.setTimeout(() => changePhase("rebounding"), INTRO_REBOUND_START_MS),
      window.setTimeout(() => changePhase("revealing"), INTRO_REVEAL_START_MS),
      window.setTimeout(onEnter, INTRO_COMPLETE_MS),
    ];
  };

  const skip = () => {
    if (phaseRef.current !== "idle") return;
    changePhase("revealing");
    onEnter();
  };

  const onGesture = useEffectEvent(enter);

  useEffect(() => {
    if (!isVisible) {
      clearIntroTimers();
    }

    return clearIntroTimers;
  }, [isVisible]);

  // Scrolling, swiping up or pressing a key also presses the keycap, so nobody gets stuck here.
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    let touchStartY: number | null = null;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // Let focused buttons handle their own Enter/Space activation.
      if (target?.closest("button") && (event.key === "Enter" || event.key === " ")) {
        return;
      }
      if (INTRO_ENTER_KEYS.has(event.key)) {
        event.preventDefault();
        onGesture();
      }
    };
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 4) onGesture();
    };
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY;
      if (touchStartY !== null && currentY !== undefined && touchStartY - currentY > INTRO_SWIPE_PX) {
        touchStartY = null;
        onGesture();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

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
      <button type="button" className="intro-skip" onClick={skip}>
        Skip intro
      </button>
      <motion.button
        type="button"
        className="intro-keycap-button"
        aria-label="Click me to enter the portfolio"
        onClick={enter}
      >
        <span className="intro-burst" aria-hidden="true" />
        <span className="intro-keycap-stage" aria-hidden="true">
          <Canvas
            camera={{ position: [0, 8.6, 7.2], fov: 40, near: 0.1, far: 100 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          >
            <KTX2Support />
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
          <span className="intro-hint">or scroll / press enter</span>
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
  const gltf = useGLTF("/models/intro-keycap-press.glb", true, true, withKTX2);
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
