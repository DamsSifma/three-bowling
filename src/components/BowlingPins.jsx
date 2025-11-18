import { RigidBody } from "@react-three/rapier";
import { BowlingPin } from "./BowlingPin.jsx";
import { useControls, button } from "leva";
import { useRef, useMemo, useEffect, useCallback, Suspense } from "react";
import { useGameState } from "../hooks/useGameState";
import { useFrame } from "@react-three/fiber";
import useSoundBoard from "../hooks/useSoundBoard.js";

// TODO: enlever le commentaire mais c'est pour le texte du writeup
// const BowlingPin = ({ position, index }) => {
//   const pinRef = useRef();

//   // Bowling pin dimensions (scaled for better gameplay)
//   const pinHeight = 0.4; // Slightly taller
//   const pinBottomRadius = 0.04; // Slightly wider
//   const pinTopRadius = 0.025; // Slightly wider

//   return (
//     <RigidBody
//       ref={pinRef}
//       position={position}
//       type="dynamic"
//       mass={1.6} // ~3.5 pounds
//       restitution={0.4}
//       friction={0.8}
//     >
//       <mesh castShadow>
//         {/* Simplified pin shape using a cylinder */}
//         <cylinderGeometry
//           args={[pinTopRadius, pinBottomRadius, pinHeight, 8]}
//         />
//         <meshStandardMaterial color="#f8f8ff" roughness={0.6} metalness={0.1} />
//       </mesh>
//     </RigidBody>
//   );
// };

export const BowlingPins = ({ basePosition = [0, 0, 4] }) => {
  const pinRefs = useRef([]);
  const { sounds, loaded, allSoundsLoaded } = useSoundBoard();
  const {
    setPinRefs,
    checkPins,
    resetPinCount,
    resetPinsSelective,
    pinStates,
    isRolling,
    getGameInfo,
  } = useGameState();
  const lastCheckTime = useRef(0);
  const ballStoppedTime = useRef(null);

  const {
    spacing,
    rowSpacing,
    pinMass,
    pinFriction,
    pinRestitution,
    debugColliders,
  } = useControls("Pins", {
    spacing: {
      value: 0.23,
      min: 0.05,
      max: 0.3,
      step: 0.01,
    },
    rowSpacing: { value: 0.33, min: 0.1, max: 0.5, step: 0.01 },
    pinMass: { value: 1.5, min: 0.1, max: 2, step: 0.1 },
    pinFriction: { value: 0.1, min: 0, max: 1, step: 0.05 },
    pinRestitution: { value: 0.1, min: 0, max: 1, step: 0.05 },
    debugColliders: false,
  });

  const pinPositions = [
    [basePosition[0] - spacing * 1.5, basePosition[1], basePosition[2]],
    [basePosition[0] - spacing * 0.5, basePosition[1], basePosition[2]],
    [basePosition[0] + spacing * 0.5, basePosition[1], basePosition[2]],
    [basePosition[0] + spacing * 1.5, basePosition[1], basePosition[2]],

    [basePosition[0] - spacing, basePosition[1], basePosition[2] - rowSpacing],
    [basePosition[0], basePosition[1], basePosition[2] - rowSpacing],
    [basePosition[0] + spacing, basePosition[1], basePosition[2] - rowSpacing],

    [
      basePosition[0] - spacing * 0.5,
      basePosition[1],
      basePosition[2] - rowSpacing * 2,
    ],
    [
      basePosition[0] + spacing * 0.5,
      basePosition[1],
      basePosition[2] - rowSpacing * 2,
    ],

    [basePosition[0], basePosition[1], basePosition[2] - rowSpacing * 3],
  ];

  const getFreshPositions = () => {
    return [
      [basePosition[0] - spacing * 1.5, basePosition[1], basePosition[2]],
      [basePosition[0] - spacing * 0.5, basePosition[1], basePosition[2]],
      [basePosition[0] + spacing * 0.5, basePosition[1], basePosition[2]],
      [basePosition[0] + spacing * 1.5, basePosition[1], basePosition[2]],
      [
        basePosition[0] - spacing,
        basePosition[1],
        basePosition[2] - rowSpacing,
      ],
      [basePosition[0], basePosition[1], basePosition[2] - rowSpacing],
      [
        basePosition[0] + spacing,
        basePosition[1],
        basePosition[2] - rowSpacing,
      ],
      [
        basePosition[0] - spacing * 0.5,
        basePosition[1],
        basePosition[2] - rowSpacing * 2,
      ],
      [
        basePosition[0] + spacing * 0.5,
        basePosition[1],
        basePosition[2] - rowSpacing * 2,
      ],
      [basePosition[0], basePosition[1], basePosition[2] - rowSpacing * 3],
    ];
  };

  const resetPins = () => {
    console.log(
      "Reset pins - current spacing:",
      spacing,
      "rowSpacing:",
      rowSpacing
    );

    const freshPositions = getFreshPositions();
    console.log("Fresh positions:", freshPositions);

    freshPositions.forEach((position, index) => {
      const pinRef = pinRefs.current[index];
      if (pinRef) {
        pinRef.setTranslation({
          x: position[0],
          y: position[1] + 0.01,
          z: position[2],
        });
        pinRef.setRotation({ x: 0, y: 0, z: 0, w: 1 }); // remet la quille droite
        pinRef.setLinvel({ x: 0, y: 0, z: 0 });
        pinRef.setAngvel({ x: 0, y: 0, z: 0 });
      }
    });

    resetPinCount();
  };

  const resetPinsIntelligent = () => {
    const gameInfo = getGameInfo();
    const needsFullReset = gameInfo.needsFullReset;

    console.log("Smart pin reset called:", {
      needsFullReset,
      currentFrame: gameInfo.currentFrame,
      currentThrow: gameInfo.currentThrow,
      pinStates,
      pinsDown: gameInfo.frames[gameInfo.currentFrame]?.throws || [],
    });

    if (needsFullReset) {
      console.log("Full reset pins");
      resetPinCount();
      resetPins();
    } else {
      console.log("Selective reset for second throw");

      resetPinsSelective();

      const freshPositions = getFreshPositions();
      let resetCount = 0;
      let removedCount = 0;

      freshPositions.forEach((position, index) => {
        const pinRef = pinRefs.current[index];
        if (pinRef && !pinStates[index]) {
          resetCount++;
          console.log(`Resetting standing pin ${index}`);
          pinRef.setTranslation({
            x: position[0],
            y: position[1] + 0.01,
            z: position[2],
          });
          pinRef.setRotation({ x: 0, y: 0, z: 0, w: 1 });
          pinRef.setLinvel({ x: 0, y: 0, z: 0 });
          pinRef.setAngvel({ x: 0, y: 0, z: 0 });
        } else if (pinRef && pinStates[index]) {
          // Pin tombée on l'enlève
          removedCount++;
          console.log(`Removing fallen pin ${index}`);
          pinRef.setTranslation({
            x: position[0] + (Math.random() - 0.5) * 2,
            y: -5,
            z: position[2] + 3,
          });
          pinRef.setLinvel({ x: 0, y: 0, z: 0 });
          pinRef.setAngvel({ x: 0, y: 0, z: 0 });
        }
      });

      console.log(
        `Selective reset complete: ${resetCount} standing pins reset, ${removedCount} fallen pins removed`
      );
    }
  };

  useEffect(() => {
    setPinRefs(pinRefs.current);
  }, [setPinRefs]);

  useFrame((state) => {
    if (!isRolling && ballStoppedTime.current === null) {
      ballStoppedTime.current = state.clock.elapsedTime;
    }
    if (isRolling) {
      ballStoppedTime.current = null;
    }
    // Check pins while ball is rolling OR for 2 seconds after ball stops
    const timeSinceBallStopped = ballStoppedTime.current
      ? state.clock.elapsedTime - ballStoppedTime.current
      : 0;
    const shouldCheckPins = isRolling || timeSinceBallStopped < 2.0;

    if (
      shouldCheckPins &&
      state.clock.elapsedTime - lastCheckTime.current > 0.2
    ) {
      checkPins();
      lastCheckTime.current = state.clock.elapsedTime;
    }
  });

  const handlePinCollision = useCallback(
    (index) => (event) => {
      if (allSoundsLoaded && sounds.pinHit) {
        sounds.pinHit();
      }
    },
    [sounds, allSoundsLoaded]
  );

  const gameInfo = getGameInfo();

  useEffect(() => {
    console.log("Pin reset effect triggered:", {
      gamePhase: gameInfo.gamePhase,
      currentFrame: gameInfo.currentFrame,
      currentThrow: gameInfo.currentThrow,
      needsFullReset: gameInfo.needsFullReset,
    });

    if (gameInfo.gamePhase === "playing") {
      if (gameInfo.needsFullReset) {
        console.log("Triggering full reset (new frame/strike/spare)");
        setTimeout(() => {
          resetPinsIntelligent();
        }, 100);
      } else if (gameInfo.currentThrow === 1) {
        console.log("Triggering selective reset (second throw)");
        setTimeout(() => {
          resetPinsIntelligent();
        }, 100);
      }
    }
  }, [gameInfo.gamePhase, gameInfo.currentFrame, gameInfo.currentThrow]);

  // Du debug dans leva
  useControls("Pins Actions", {
    "Reset All Pins": button(resetPins),
    "Smart Reset": button(resetPinsIntelligent),
    "Force Full Reset": button(() => {
      console.log("Force Full Reset triggered");
      resetPinCount();
      resetPins();
    }),
    "Debug State": button(() => {
      const info = getGameInfo();
      console.log("Pin Debug State:", {
        gamePhase: info.gamePhase,
        currentFrame: info.currentFrame,
        currentThrow: info.currentThrow,
        needsFullReset: info.needsFullReset,
        pinStates: pinStates,
        pinsDown: info.frames[info.currentFrame]?.throws,
      });
    }),
  });

  return (
    <group>
      {pinPositions.map((position, index) => (
        <RigidBody
          key={`pin-${index}-${pinMass}-${pinFriction}-${pinRestitution}`}
          ref={(el) => (pinRefs.current[index] = el)}
          position={[position[0], position[1] + 0.01, position[2]]}
          type="dynamic"
          mass={pinMass}
          restitution={pinRestitution}
          friction={pinFriction}
          colliders="hull"
          ccd={true}
          onCollisionEnter={handlePinCollision(index)}
        >
          <BowlingPin scale={0.4} />
          {/* Debug indicator when pin is down */}
          {debugColliders && pinStates[index] && (
            <mesh position={[0, 0.3, 0]}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
          )}
        </RigidBody>
      ))}
    </group>
  );
};
