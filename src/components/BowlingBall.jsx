import { useControls } from "leva";
import { RigidBody } from "@react-three/rapier";
import { useRef, useCallback, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGameState } from "../hooks/useGameState";
import { TrajectoryPreview } from "./TrajectoryPreview";

export const BowlingBall = ({ position = [0, 1, -5] }) => {
  const ballRef = useRef();
  const { gl } = useThree();

  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0.11, z: -5 });
  const [throwAngle, setThrowAngle] = useState(0);

  const ballRadius = 0.11;

  const { restitution, friction, ballMass } = useControls("Ball Physics", {
    restitution: { value: 0.75, min: 0, max: 1, step: 0.05 },
    friction: { value: 0.2, min: 0, max: 2, step: 0.1 },
    ballMass: { value: 25, min: 5, max: 30, step: 1 },
  });

  const { setIsRolling, setBallRef, isRolling, controlPhase, setControlPhase } =
    useGameState();

  const handleMouseMove = useCallback(
    (event) => {
      if (isRolling) return;

      const rect = gl.domElement.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1; // -1 à 1

      if (controlPhase === "positioning") {
        const newX = -mouseX * 0.8;
        setBallPosition((prev) => ({ ...prev, x: newX }));
      } else if (controlPhase === "aiming") {
        const newAngle = -mouseX * 60; // -60 à 60 degrès
        setThrowAngle(newAngle);
      }
    },
    [isRolling, controlPhase, gl.domElement]
  );

  const handleMouseClick = useCallback(() => {
    if (isRolling) return;

    if (controlPhase === "positioning") {
      setControlPhase("aiming");
    } else if (controlPhase === "aiming") {
      setControlPhase("power");
    }
  }, [isRolling, controlPhase]);

  const resetBall = useCallback(() => {
    if (ballRef.current) {
      // Reset
      const resetPosition = { x: 0, y: 0.11, z: -5 };
      setBallPosition(resetPosition);
      setThrowAngle(0);
      setControlPhase("positioning"); // Always reset control phase when explicitly reset

      ballRef.current.setTranslation({
        x: resetPosition.x,
        y: resetPosition.y,
        z: resetPosition.z,
      });
      ballRef.current.setLinvel({ x: 0, y: 0, z: 0 });
      ballRef.current.setAngvel({ x: 0, y: 0, z: 0 });
      setIsRolling(false);
    }
  }, [setIsRolling, setControlPhase]);

  const [selectedPower, setSelectedPower] = useState(15);

  const throwBall = useCallback(() => {
    if (ballRef.current && !isRolling && controlPhase === "power") {
      setIsRolling(true);
      setControlPhase("ready");

      const angleRad = (throwAngle * Math.PI) / 180;
      ballRef.current.setLinvel({
        x: Math.sin(angleRad) * selectedPower * 0.1,
        y: 0,
        z: selectedPower,
      });
    }
  }, [throwAngle, selectedPower, isRolling, controlPhase, setIsRolling]);

  useEffect(() => {
    setBallRef({
      throwBall,
      resetBall,
      setPower: (p) => setSelectedPower(p),
    });
  }, [throwBall, resetBall, setBallRef]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleMouseClick);
    canvas.style.cursor = isRolling ? "default" : "crosshair";

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleMouseClick);
    };
  }, [handleMouseMove, handleMouseClick, isRolling, gl.domElement]);

  const lastVelocityCheck = useRef(0);

  useFrame((state) => {
    if (ballRef.current) {
      const pos = ballRef.current.translation();
      const vel = ballRef.current.linvel();

      if (!isRolling) {
        const targetX = ballPosition.x;
        if (Math.abs(pos.x - targetX) > 0.01) {
          ballRef.current.setTranslation({
            x: targetX,
            y: ballPosition.y,
            z: ballPosition.z,
          });
        }
      }

      // Check si boule OOB
      if (pos.z > 8 || pos.y < -1 || Math.abs(pos.x) > 2 || pos.y > 5) {
        ballRef.current.setLinvel({ x: 0, y: 0, z: 0 });
        ballRef.current.setAngvel({ x: 0, y: 0, z: 0 });
      }

      // Check pour savoir si la boule s'est arrêtée (throttled to prevent spam)
      if (
        isRolling &&
        state.clock.elapsedTime - lastVelocityCheck.current > 0.2
      ) {
        const velocity = Math.sqrt(
          vel.x * vel.x + vel.y * vel.y + vel.z * vel.z
        );
        const isMoving = velocity > 0.1;

        if (!isMoving) {
          setIsRolling(false);
          // Don't automatically reset control phase - let game logic handle it
          console.log("🎳 Ball stopped - waiting for game logic to reset");
        }
        lastVelocityCheck.current = state.clock.elapsedTime;
      }
    }
  });

  return (
    <>
      <RigidBody
        ref={ballRef}
        position={[ballPosition.x, ballPosition.y, ballPosition.z]}
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
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </RigidBody>

      <TrajectoryPreview
        show={true}
        ballPosition={ballPosition}
        throwAngle={throwAngle}
        power={15}
        isRolling={isRolling}
        controlPhase={controlPhase}
      />
    </>
  );
};
