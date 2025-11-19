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

  const getPointerPosition = useCallback(
    (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      return ((clientX - rect.left) / rect.width) * 2 - 1; // -1 à 1
    },
    [gl.domElement]
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (isRolling) return;

      const pointerX = getPointerPosition(event);

      if (controlPhase === "positioning") {
        const newX = -pointerX * 0.8;
        setBallPosition((prev) => ({ ...prev, x: newX }));
      } else if (controlPhase === "aiming") {
        const newAngle = -pointerX * 60; // -60 à 60 degrès
        setThrowAngle(newAngle);
      }
    },
    [isRolling, controlPhase, getPointerPosition]
  );

  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback(
    (event) => {
      if (isRolling) return;
      setIsDragging(true);
      event.preventDefault();
    },
    [isRolling]
  );

  const handlePointerUp = useCallback(() => {
    if (isRolling || !isDragging) return;

    setIsDragging(false);

    if (controlPhase === "positioning") {
      setControlPhase("aiming");
    } else if (controlPhase === "aiming") {
      setControlPhase("power");
    }
  }, [isRolling, isDragging, controlPhase]);

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

    // Mouse events
    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("mouseup", handlePointerUp);

    // Touch events
    canvas.addEventListener("touchmove", handlePointerMove, { passive: false });
    canvas.addEventListener("touchstart", handlePointerDown, {
      passive: false,
    });
    canvas.addEventListener("touchend", handlePointerUp);

    canvas.style.cursor = isRolling ? "default" : "crosshair";
    canvas.style.touchAction = "none"; // Prevent default touch behaviors

    return () => {
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("mousedown", handlePointerDown);
      canvas.removeEventListener("mouseup", handlePointerUp);
      canvas.removeEventListener("touchmove", handlePointerMove);
      canvas.removeEventListener("touchstart", handlePointerDown);
      canvas.removeEventListener("touchend", handlePointerUp);
    };
  }, [
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    isRolling,
    gl.domElement,
  ]);

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

      // Check pour savoir si la boule s'est arrêtée
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
