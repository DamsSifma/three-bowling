import {
  ConvexHullCollider,
  CylinderCollider,
  RigidBody,
} from "@react-three/rapier";
import { BowlingPin } from "./BowlingPin.jsx";
import { useControls, button } from "leva";
import { useRef, useMemo } from "react";

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

  const { spacing, rowSpacing, pinMass, pinFriction, pinRestitution } =
    useControls("Pins", {
      spacing: {
        value: 0.23,
        min: 0.05,
        max: 0.3,
        step: 0.01,
      },
      rowSpacing: { value: 0.33, min: 0.1, max: 0.5, step: 0.01 },
      pinMass: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
      pinFriction: { value: 0.1, min: 0, max: 1, step: 0.05 },
      pinRestitution: { value: 0.05, min: 0, max: 0.5, step: 0.05 },
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

  const resetPins = () => {
    console.log(
      "Reset pins - current spacing:",
      spacing,
      "rowSpacing:",
      rowSpacing
    );

    // TOFIX je recalcule les positions car avec un useMemo sur pinPositions ça ne marche pas
    const freshPositions = [
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

    console.log("Fresh positions:", freshPositions);

    freshPositions.forEach((position, index) => {
      const pinRef = pinRefs.current[index];
      if (pinRef) {
        console.log(`Resetting pin ${index} to:`, position);
        pinRef.setTranslation({
          x: position[0],
          y: position[1] + 0.2,
          z: position[2],
        });
        pinRef.setRotation({ x: 0, y: 0, z: 0, w: 1 }); // remet la quille droite
        pinRef.setLinvel({ x: 0, y: 0, z: 0 });
        pinRef.setAngvel({ x: 0, y: 0, z: 0 });
      }
    });
  };

  // Add reset button to controls
  useControls("Pins Actions", {
    "Reset Pins": button(resetPins),
  });

  return (
    <group>
      {pinPositions.map((position, index) => (
        <RigidBody
          key={index}
          ref={(el) => (pinRefs.current[index] = el)}
          position={[position[0], position[1] + 0.2, position[2]]}
          type="dynamic"
          mass={pinMass}
          restitution={pinRestitution}
          friction={pinFriction}
          colliders="hull"
        >
          <BowlingPin scale={0.4} />
        </RigidBody>
      ))}
    </group>
  );
};
