import { Text3D } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import { useState, useEffect, Suspense } from "react";
import { useControls, button } from "leva";
import { useGameState } from "../hooks/useGameState";

const AnimatedText3D = animated(Text3D);

export const StrikeSpareAnimation = () => {
  const [currentText, setCurrentText] = useState(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [lastPinsDown, setLastPinsDown] = useState(0);

  const { getGameInfo, pinsDown } = useGameState();

  // c'est pas clean mais j'ai pas trouvé mieux sans avoir des soucis
  useEffect(() => {
    const gameInfo = getGameInfo();
    if (pinsDown === 10 && lastPinsDown < 10) {
      const currentThrow = gameInfo.currentThrow;

      if (currentThrow === 0) {
        setCurrentText("STRIKE");
        setShouldAnimate(true);
      } else if (currentThrow === 1) {
        setCurrentText("SPARE");
        setShouldAnimate(true);
      }
    }

    setLastPinsDown(pinsDown);
  }, [pinsDown, lastPinsDown, getGameInfo]);

  const { emissiveIntensity, metalness, roughness, spareColor, strikeColor } =
    useControls("Text Material", {
      emissiveIntensity: { value: 0.3, min: 0, max: 2, step: 0.1 },
      metalness: { value: 1, min: 0, max: 1, step: 0.05 },
      roughness: { value: 0, min: 0, max: 1, step: 0.05 },
      spareColor: { value: "#d9d7d7" },
      strikeColor: { value: "#dce011" },
    });

  // Debug controls
  useControls("Animation Debug", {
    "Reset Tracking": button(() => {
      console.log("🔄 RESETTING pin tracking");
      setLastPinsDown(0);
      setCurrentText(null);
      setShouldAnimate(false);
    }),
    "Current Pins Down": pinsDown,
    "Last Pins Down": lastPinsDown,
    "Current Animation": currentText || "NONE",
  });

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => {
        setShouldAnimate(false);
        setCurrentText(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  const { scale } = useSpring({
    scale: shouldAnimate ? 1 : 0,
    config: { tension: 280, friction: 20 },
  });

  // Don't render anything if no animation should be shown
  if (!currentText || !shouldAnimate) {
    return null;
  }

  const color = currentText === "STRIKE" ? strikeColor : spareColor;

  return (
    <group>
      {/* Suspense car sinon y'a écran blanc sur le premier strike / spare */}
      <Suspense fallback={null}>
        <AnimatedText3D
          font="/LuckiestGuy_Regular.json"
          size={0.5}
          height={0.2}
          position={[1, 1.25, -5]}
          scale={scale}
          rotation={[Math.PI / 6, Math.PI, 0]}
          // le bevel rend vraiment bien mais beaucoup de triangles
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelSegments={5}
        >
          {currentText}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            metalness={metalness}
            roughness={roughness}
          />
        </AnimatedText3D>
      </Suspense>
    </group>
  );
};
