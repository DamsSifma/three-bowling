import { OrbitControls, Environment } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { BowlingLane } from "./BowlingLane";
import { BowlingBall } from "./BowlingBall";
import { BowlingPins } from "./BowlingPins";
import { StrikeSpareAnimation } from "./StrikeSpareAnimation";
import { useControls } from "leva";
import { useThree } from "@react-three/fiber";

export const Experience = () => {
  const { camera } = useThree();

  const { debug } = useControls("Camera & Physics", {
    debug: false,
    cameraPosition: {
      value: [0, 2.5, -9],
      step: 0.1,
      onChange: (value) => {
        camera.position.set(...value);
      },
    },
  });

  return (
    <>
      <OrbitControls makeDefault />

      <StrikeSpareAnimation />

      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      <Environment preset="warehouse" />

      <Physics gravity={[0, -9.81, 0]} debug={debug}>
        <BowlingLane />
        <BowlingBall position={[0, 1, -5]} />
        <BowlingPins basePosition={[0, 0.2, 4]} />
      </Physics>
    </>
  );
};
