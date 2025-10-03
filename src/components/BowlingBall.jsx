import { useControls } from "leva";
import { RigidBody } from "@react-three/rapier";
import { Html } from "@react-three/drei";
import { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";

export const BowlingBall = ({ position = [0, 1, -5] }) => {
  const ballRef = useRef();
  const [isRolling, setIsRolling] = useState(false);
  const [ballsThrown, setBallsThrown] = useState(0);

  const ballRadius = 0.11;

  const { power, spinX, spinY, aimX, restitution, friction, ballMass } =
    useControls("Bowling Ball", {
      power: { value: 15, min: 1, max: 25, step: 0.5 },
      aimX: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
      spinX: { value: -1.5, min: -5, max: 5, step: 0.1 },
      spinY: { value: 0, min: -3, max: 3, step: 0.1 },
      restitution: { value: 0.2, min: 0, max: 1, step: 0.05 },
      friction: { value: 0.1, min: 0, max: 2, step: 0.1 },
      ballMass: { value: 15, min: 5, max: 30, step: 1 },
    });

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
    }
  }, [position]);

  const throwBall = useCallback(() => {
    if (ballRef.current && !isRolling) {
      setIsRolling(true);
      setBallsThrown((prev) => prev + 1);

      // Apply linear velocity
      ballRef.current.setLinvel({
        x: aimX * power,
        y: 0,
        z: power,
      });

      // Apply angular velocity (spin)
      ballRef.current.setAngvel({
        x: spinX * power * 0.3,
        y: spinY * power * 0.3,
        z: 0,
      });
    }
  }, [power, aimX, spinX, spinY, isRolling]);

  // Auto reset si la balle va trop loin
  useFrame(() => {
    if (ballRef.current) {
      const pos = ballRef.current.translation();
      const vel = ballRef.current.linvel();

      if (
        pos.z > 8 ||
        pos.y < -5 ||
        (isRolling && Math.abs(vel.x) + Math.abs(vel.z) < 0.1)
      ) {
        setTimeout(resetBall, 2000);
      }
    }
  });

  return (
    <>
      <RigidBody
        ref={ballRef}
        position={position}
        type="dynamic"
        mass={ballMass}
        restitution={restitution}
        friction={friction}
        canSleep={false}
        colliders="ball"
      >
        <mesh castShadow>
          <sphereGeometry args={[ballRadius]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </RigidBody>

      {/* TODO enlever quand polished interface */}
      <Html position={[-2, 2, -4]}>
        <div
          style={{
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <strong>Bowling Game</strong>
            <br />
            Balls thrown: {ballsThrown}
          </div>
          <button
            onClick={throwBall}
            style={{
              margin: "2px",
              padding: "8px 16px",
              backgroundColor: isRolling ? "#666" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isRolling ? "not-allowed" : "pointer",
            }}
            disabled={isRolling}
          >
            {isRolling ? "Rolling..." : "THROW BALL"}
          </button>
          <button
            onClick={resetBall}
            style={{
              margin: "2px",
              padding: "8px 16px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
          <div style={{ marginTop: "10px", fontSize: "10px" }}>
            Use Leva controls to adjust:
            <br />
            • Power: Ball speed
            <br />
            • Aim X: Left/right direction
            <br />
            • Spin X/Y: Ball rotation
            <br />• Physics properties
          </div>
        </div>
      </Html>
    </>
  );
};
