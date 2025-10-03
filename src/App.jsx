import { StrictMode } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Leva, useControls } from "leva";
import { Perf } from "r3f-perf";

function App() {
  const { backgroundColor } = useControls("Colors", {
    backgroundColor: { value: "#1e1e1e" },
  });
  return (
    <>
      <Leva theme={{ sizes: { rootWidth: "350px" } }} />
      <Canvas shadows camera={{ position: [0, 4, -2], fov: 60 }}>
        <Perf showGraph={false} position="top-left" />
        <color attach="background" args={[backgroundColor]} />
        <Experience />
      </Canvas>
    </>
  );
}

export default App;
