import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Center,
  Environment,
  Html,
  PresentationControls,
  useGLTF,
} from "@react-three/drei";
import { Box3, Vector3, type Group } from "three";
import type { Project } from "../data/portfolio";
import { KTX2Support, withKTX2 } from "../lib/ktx2";

export default function ModelCanvas({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [isNear, setIsNear] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  const canUse3D = useMemo(() => computeCanUse3D(), []);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const openProject = () => {
    window.open(project.modelHref, "_blank", "noopener,noreferrer");
  };

  // Distinguish a click (open link) from a drag (rotate model).
  const handlePointerDown = (event: React.PointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) {
      return;
    }
    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (moved < 6) {
      openProject();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProject();
    }
  };

  return (
    <div
      className="model-canvas-mount"
      ref={ref}
      role="link"
      tabIndex={0}
      aria-label={`Open ${project.title}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      {!canUse3D || !isNear ? (
        <ModelFallback project={project} />
      ) : (
        <Canvas
          camera={{ position: [0, 7.4, 0.9], fov: 44, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <KTX2Support />
          <CameraLookAt />
          <ambientLight intensity={0.72} />
          <directionalLight position={[2, 6, 3]} intensity={1.05} />
          <Suspense
            fallback={
              <Html center>
                <span className="canvas-loading">loading geometry</span>
              </Html>
            }
          >
            <PresentationControls
              global={false}
              polar={[0, 0]}
              azimuth={[-0.75, 0.75]}
              speed={0.7}
              snap
            >
              <Center>
                <ProjectModel path={project.modelPath} index={index} />
              </Center>
            </PresentationControls>
            <Environment preset="warehouse" environmentIntensity={0.42} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

function CameraLookAt() {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function ProjectModel({ path, index }: { path: string; index: number }) {
  const group = useRef<Group>(null);
  const gltf = useGLTF(path, true, true, withKTX2);
  const { scene, fitScale } = useMemo(() => {
    const clonedScene = gltf.scene.clone();
    clonedScene.updateMatrixWorld(true);

    const box = new Box3().setFromObject(clonedScene);
    const size = box.getSize(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    const nextScale =
      maxDimension > 0 && Number.isFinite(maxDimension)
        ? 4.7 / maxDimension
        : 2.1;

    return {
      scene: clonedScene,
      fitScale: Math.max(1.3, Math.min(12, nextScale)),
    };
  }, [gltf.scene]);

  useFrame(({ clock }) => {
    if (!group.current) {
      return;
    }
    group.current.rotation.x = 0;
    group.current.rotation.y =
      Math.sin(clock.elapsedTime * 0.42 + index * 0.35) * 0.1;
    group.current.rotation.z = index * 0.012;
  });

  return (
    <group ref={group} scale={fitScale}>
      <primitive object={scene} />
    </group>
  );
}

function ModelFallback({ project }: { project: Project }) {
  return (
    <img
      className="model-fallback"
      src={project.fallbackImage}
      alt={`${project.title} placeholder render`}
    />
  );
}

function computeCanUse3D() {
  if (typeof window.matchMedia !== "function") {
    return false;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return !reducedMotion;
}
