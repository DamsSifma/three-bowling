import { useEffect, useRef, useState } from "react";
import { useControls } from "leva";
import { useSpring, animated } from "@react-spring/web";
import { useGameState } from "../hooks/useGameState";

export const PowerMeter = () => {
  const { throwBall, isRolling, ballRef, controlPhase } = useGameState();

  const { minPower, maxPower, barSpeed } = useControls("Power Meter", {
    minPower: { value: 5, min: 1, max: 15, step: 1 },
    maxPower: { value: 25, min: 15, max: 50, step: 1 },
    barSpeed: { value: 0.6, min: 0.1, max: 2, step: 0.1 },
  });

  const showMeter = controlPhase === "power" && !isRolling;

  const [locked, setLocked] = useState(false);
  const [lockedPower, setLockedPower] = useState(0);
  const [lockedPercent, setLockedPercent] = useState(0);

  const { percent } = useSpring({
    from: { percent: 0 },
    to: async (next) => {
      if (!showMeter || locked) return;

      while (showMeter && !locked) {
        await next({ percent: 1, config: { duration: 1000 / barSpeed } });
        if (!showMeter || locked) break;
        await next({ percent: 0, config: { duration: 1000 / barSpeed } });
      }
    },
    reset: showMeter && !locked,
    immediate: locked,
  });

  useEffect(() => {
    if (controlPhase === "positioning") {
      setLocked(false);
      setLockedPower(0);
      setLockedPercent(0);
    }
  }, [controlPhase]);

  const onLock = () => {
    if (!showMeter || locked) return;
    const currentPercent = percent.get();
    const selectedPower = minPower + currentPercent * (maxPower - minPower);
    console.log(
      "PowerMeter: Locking power at",
      selectedPower,
      "percent:",
      currentPercent
    );
    setLocked(true);
    setLockedPower(selectedPower);
    setLockedPercent(currentPercent);

    if (ballRef?.setPower) {
      ballRef.setPower(selectedPower);
    }

    // Délai pour s'assurer qu'on tire avec la puissance qui vient d'être choisie
    setTimeout(() => {
      throwBall();
    }, 10);
  };

  // Clavier
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space" && showMeter && !locked) {
        e.preventDefault();
        onLock();
      }
    };

    if (showMeter) {
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [showMeter, locked]);

  const displayPercent = locked ? lockedPercent : percent;

  const getButtonClass = () => {
    if (locked) return "power-meter-button locked";
    if (showMeter) return "power-meter-button active";
    return "power-meter-button disabled";
  };

  return (
    <div className="power-meter-container">
      <div className="power-meter">
        <animated.div
          className="power-meter-fill"
          style={{
            height: locked
              ? `${Math.round(lockedPercent * 100)}%`
              : displayPercent.to((p) => `${Math.round(p * 100)}%`),
            background: locked
              ? "linear-gradient(0deg, #ff8a00, #ffb84d)"
              : displayPercent.to((p) => {
                  const red = Math.round(p * 255);
                  const green = Math.round((1 - p) * 255);
                  return `linear-gradient(0deg, rgb(${red}, ${green}, 0), rgb(${Math.min(
                    255,
                    red + 50
                  )}, ${Math.min(255, green + 50)}, 0))`;
                }),
          }}
        />
      </div>
      <button
        className={getButtonClass()}
        onClick={onLock}
        disabled={!showMeter || locked}
      >
        {locked ? "🎯 LOCKED" : "🚀 THROW"}
      </button>
    </div>
  );
};
