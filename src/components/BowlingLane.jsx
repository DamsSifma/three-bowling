import { RigidBody } from "@react-three/rapier";
import { useControls } from "leva";
import { useRef } from "react";

export const BowlingLane = () => {
  const laneRef = useRef();
  const { laneFriction, laneRestitution } = useControls("Lane", {
    laneFriction: { value: 0.1, min: 0, max: 1, step: 0.05 },
    laneRestitution: { value: 0.3, min: 0, max: 1, step: 0.05 },
  });

  const laneLength = 12;
  const laneWidth = 1.2;
  const laneThickness = 0.1;

  return (
    <group>
      <RigidBody
        // this key is to force remount when friction or restitution change
        key={`lane-${laneFriction}-${laneRestitution}`}
        type="fixed"
        friction={laneFriction}
        restitution={laneRestitution}
        ref={laneRef}
      >
        <mesh position={[0, -laneThickness / 2, 0]} receiveShadow>
          <boxGeometry args={[laneWidth, laneThickness, laneLength]} />
          <meshStandardMaterial
            color="#DEB887"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </RigidBody>

      {/* Gouttière droite */}
      <RigidBody type="fixed">
        <mesh position={[-laneWidth / 2 - 0.15, 0, 0]} receiveShadow>
          <boxGeometry args={[0.3, 0.1, laneLength]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </RigidBody>

      {/* Gouttière gauche */}
      <RigidBody type="fixed">
        <mesh position={[laneWidth / 2 + 0.15, 0, 0]} receiveShadow>
          <boxGeometry args={[0.3, 0.1, laneLength]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </RigidBody>

      {/* Mur invisible qui contiennent la simulation physique */}
      <RigidBody type="fixed">
        <mesh position={[-laneWidth / 2 - 0.3, 1, 0]} visible={false}>
          <boxGeometry args={[0.1, 2, laneLength]} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed">
        <mesh position={[laneWidth / 2 + 0.3, 1, 0]} visible={false}>
          <boxGeometry args={[0.1, 2, laneLength]} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed">
        <mesh position={[0, 1, laneLength / 2 + 0.5]} visible={false}>
          <boxGeometry args={[laneWidth + 1, 2, 0.1]} />
        </mesh>
      </RigidBody>
    </group>
  );
};
