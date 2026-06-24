import { KTX2Loader } from "three-stdlib";
import { useThree } from "@react-three/fiber";

export const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath("/basis/");

let detected = false;

// Render this inside a Canvas before any model Suspense boundary.
// Calling detectSupport during render (not in an effect) ensures it runs
// before useGLTF fires its request.
export function KTX2Support() {
  const gl = useThree((s) => s.gl);
  if (!detected) {
    ktx2Loader.detectSupport(gl);
    detected = true;
  }
  return null;
}

export function withKTX2(loader: { setKTX2Loader: (l: KTX2Loader) => unknown }) {
  loader.setKTX2Loader(ktx2Loader);
}
