import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Center,
  Environment,
  Html,
  OrbitControls,
  PresentationControls,
  useGLTF,
} from "@react-three/drei";
import type { Group } from "three";
import type { Project } from "../data/portfolio";

export default function ModelCanvas({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
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

  return (
    <div className="model-canvas-mount" ref={ref}>
      {!canUse3D || !isNear ? (
        <ModelFallback project={project} />
      ) : (
        <Canvas
          camera={{ position: [0, 0.4, 4.2], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={1.8} />
          <directionalLight position={[3, 4, 4]} intensity={2.1} />
          <Suspense
            fallback={
              <Html center>
                <span className="canvas-loading">loading geometry</span>
              </Html>
            }
          >
            <PresentationControls
              global={false}
              polar={[-0.35, 0.35]}
              azimuth={[-0.45, 0.45]}
              speed={1.2}
              snap
            >
              <Center>
                <ProjectModel path={project.modelPath} index={index} />
              </Center>
            </PresentationControls>
            <Environment preset="warehouse" />
          </Suspense>
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={0.35 + index * 0.08}
          />
        </Canvas>
      )}
    </div>
  );
}

function ProjectModel({ path, index }: { path: string; index: number }) {
  const group = useRef<Group>(null);
  const gltf = useGLTF(path, true);
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);

  useFrame(({ clock }) => {
    if (!group.current) {
      return;
    }
    group.current.rotation.y = clock.elapsedTime * 0.16 + index * 0.2;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.38 + index) * 0.08;
  });

  return (
    <group ref={group} scale={1.35}>
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
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const lowMemory =
    "deviceMemory" in navigator &&
    typeof navigator.deviceMemory === "number" &&
    navigator.deviceMemory <= 4;

  return !reducedMotion && !coarsePointer && !lowMemory;
}
