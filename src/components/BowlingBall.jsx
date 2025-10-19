import { useControls } from "leva";
import { RigidBody } from "@react-three/rapier";
import { useRef, useState, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "../hooks/useGameState";

export const BowlingBall = ({ position = [0, 1, -5] }) => {
  const ballRef = useRef();
  const [isRolling, setIsRolling] = useState(false);

  const ballRadius = 0.11;

  const { power, spinX, spinY, aimX, restitution, friction, ballMass } =
    useControls("Bowling Ball", {
      power: { value: 15, min: 1, max: 25, step: 0.5 },
      aimX: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
      spinX: { value: -1.5, min: -5, max: 5, step: 0.1 },
      spinY: { value: 0, min: -3, max: 3, step: 0.1 },
      restitution: { value: 0.75, min: 0, max: 1, step: 0.05 },
      friction: { value: 0.2, min: 0, max: 2, step: 0.1 },
      ballMass: { value: 25, min: 5, max: 30, step: 1 },
    });

  const { setIsRolling: setIsRollingGlobal, setBallRef } = useGameState();

  const resetBall = useCallback(() => {
    if (ballRef.current) {
      ballRef.current.setTranslation({
        x: position[0],
        y: position[1],
        z: position[2],
      });
      ballRef.current.setLinvel({ x: 0, y: 0, z: 0 });
      ballRef.current.setAngvel({ x: 0, y: 0, z: 0 });
      setIsRolling(false);
      setIsRollingGlobal(false);
    }
  }, [position, setIsRollingGlobal]);

  const throwBall = useCallback(() => {
    if (ballRef.current && !isRolling) {
      setIsRolling(true);
      setIsRollingGlobal(true);

      // Apply linear velocity
      ballRef.current.setLinvel({
        x: aimX * power * 0.1,
        y: 0,
        z: power,
      });

      // Apply angular velocity (spin)
      // ballRef.current.setAngvel({
      //   x: spinX * power * 0.3,
      //   y: spinY * power * 0.3,
      //   z: 0,
      // });
    }
  }, [power, aimX, spinX, spinY, isRolling, setIsRollingGlobal]);

  useEffect(() => {
    setBallRef({
      throwBall,
      resetBall,
    });
  }, [throwBall, resetBall, setBallRef]);

  // Auto reset si la balle va trop loin
  useFrame(() => {
    if (ballRef.current) {
      const pos = ballRef.current.translation();
      const vel = ballRef.current.linvel();

      if (pos.z > 8 || pos.y < -1 || Math.abs(pos.x) > 2 || pos.y > 5) {
        setTimeout(resetBall, 1000);
      }
    }
  });

  return (
    <RigidBody
      ref={ballRef}
      position={position}
      type="dynamic"
      mass={ballMass}
      restitution={restitution}
      friction={friction}
      canSleep={false}
      colliders="ball"
      ccd={true}
      // linearDamping={0.05} // Mini mal air resistance
      // angularDamping={0.05}
    >
      <mesh castShadow>
        <sphereGeometry args={[ballRadius]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
};
