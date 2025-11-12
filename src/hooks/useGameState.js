import { useState, useEffect, useRef } from "react";
import { Euler, Quaternion } from "three";
import { BowlingGame } from "../game/BowlingGame.js";
import { GameController } from "../game/GameController.js";

// Est-ce qu'on devrait pas l'extraire dans le contexte global ?
let gameState = {
  isRolling: false,
  ballRef: null,
  pinRefs: [],
  pinsDown: 0,
  pinStates: Array(10).fill(false), // TODO: pas le meilleur naming car c'est plutôt un isPinDown
  pinOutOfBounds: Array(10).fill(false),
  bowlingGame: new BowlingGame(),
  gamePhase: "menu",
  controlPhase: "positioning",
  autoProgression: true,
  lastThrowResult: null,
  gameController: null,
  listeners: new Set(),
};

const notify = () => {
  gameState.listeners.forEach((listener) => listener({ ...gameState }));
};

const isPinDown = (pinRef) => {
  if (!pinRef) return false;
  const rotation = pinRef.rotation();

  const quaternion = new Quaternion(
    rotation.x,
    rotation.y,
    rotation.z,
    rotation.w
  );
  const euler = new Euler().setFromQuaternion(quaternion);
  const tiltThreshold = Math.PI / 6; // 30 degrès
  const isDown =
    Math.abs(euler.x) > tiltThreshold || Math.abs(euler.z) > tiltThreshold;

  return isDown;
};

const isPinOutOfBounds = (pinRef) => {
  if (!pinRef) return false;
  const position = pinRef.translation();
  return position.y < -25;
};

const updatePinCount = () => {
  // Don't check if no pins are registered yet
  if (gameState.pinRefs.length === 0) return;

  let downCount = 0;
  const newPinStates = gameState.pinRefs.map((pinRef, index) => {
    if (gameState.pinOutOfBounds[index]) {
      downCount++;
      return true;
    }

    if (isPinOutOfBounds(pinRef)) {
      gameState.pinOutOfBounds[index] = true;
      console.log(`Pin ${index} fell out of bounds`);
      downCount++;
      return true;
    }

    const isDown = isPinDown(pinRef);
    if (isDown) downCount++;
    return isDown;
  });

  const countChanged = gameState.pinsDown !== downCount;
  const statesChanged = newPinStates.some(
    (state, index) => state !== gameState.pinStates[index]
  );

  if (countChanged || statesChanged) {
    gameState.pinsDown = downCount;
    gameState.pinStates = newPinStates;
    notify();
  }
};

export const useGameState = () => {
  const [state, setState] = useState({ ...gameState });
  const gameStateRef = useRef();
  gameStateRef.current = {
    recordThrow: () => recordThrowInternal(),
    resetBall: () => resetBallInternal(),
    nextFrame: () => nextFrameInternal(),
  };

  useEffect(() => {
    gameState.listeners.add(setState);
    if (!gameState.gameController) {
      gameState.gameController = new GameController(gameStateRef);
    }

    return () => {
      gameState.listeners.delete(setState);
      if (gameState.gameController) {
        gameState.gameController.destroy();
      }
    };
  }, []);

  const startGame = () => {
    gameState.bowlingGame.reset();
    gameState.gamePhase = "playing";
    resetPinCount();
    if (gameState.gameController) {
      gameState.gameController.onFrameStart();
    }
    notify();
  };

  const throwBall = () => {
    if (
      gameState.ballRef &&
      !gameState.isRolling &&
      gameState.gamePhase === "playing"
    ) {
      gameState.ballRef.throwBall();
      gameState.isRolling = true;
      notify();
    }
  };

  const resetBallInternal = () => {
    if (gameState.ballRef) {
      gameState.ballRef.resetBall();
      gameState.isRolling = false;
      notify();
    }
  };

  const resetBall = resetBallInternal;

  const recordThrowInternal = () => {
    const currentFrame =
      gameState.bowlingGame.frames[gameState.bowlingGame.currentFrame];
    console.log("recordThrowInternal called:", {
      gamePhase: gameState.gamePhase,
      pinsDown: gameState.pinsDown,
      currentFrame: gameState.bowlingGame.currentFrame,
      currentThrow: gameState.bowlingGame.currentThrow,
      frameThrows: currentFrame?.throws || [],
      pinStates: gameState.pinStates,
      validation: {
        isSecondThrow: gameState.bowlingGame.currentThrow === 1,
        firstThrowPins: currentFrame?.throws[0] || 0,
        totalWouldBe: (currentFrame?.throws[0] || 0) + gameState.pinsDown,
      },
    });

    if (gameState.gamePhase !== "playing") {
      console.log("Cannot record throw - game phase is not 'playing'");
      return;
    }

    // Pour le deuxieme lancer, on ne compte que les nouvelles quilles tombées
    let actualPinsDown = gameState.pinsDown;

    if (gameState.bowlingGame.currentThrow === 1) {
      const firstThrowPins = currentFrame?.throws[0] || 0;
      const totalPinsNowDown = gameState.pinsDown;
      actualPinsDown = totalPinsNowDown - firstThrowPins;

      // console.log("Second throw calculation:", {
      //   totalPinsNowDown,
      //   firstThrowPins,
      //   actualPinsThisThrow: actualPinsDown,
      // });

      if (actualPinsDown < 0) {
        console.error("Error: Calculated negative pins for second throw");
        actualPinsDown = 0;
      }
      if (firstThrowPins + actualPinsDown > 10) {
        console.error("Error: Total pins would exceed 10, capping");
        actualPinsDown = 10 - firstThrowPins;
      }
    }

    console.log("Recording throw with pins:", actualPinsDown);
    const result = gameState.bowlingGame.recordThrow(actualPinsDown);
    console.log("Throw recorded with result:", result);

    gameState.lastThrowResult = result;

    if (result.success) {
      if (result.nextAction === "nextFrame") {
        console.log("Setting phase to frameComplete");
        gameState.gamePhase = "frameComplete";
      } else if (result.nextAction === "gameComplete") {
        console.log("Setting phase to gameComplete");
        gameState.gamePhase = "gameComplete";
      } else {
        console.log("Staying in playing phase for:", result.nextAction);
      }

      if (gameState.gameController && gameState.autoProgression) {
        console.log("Notifying GameController of throw result");
        gameState.gameController.onThrowRecorded(result);
      } else {
        console.log("Not notifying GameController:", {
          hasController: !!gameState.gameController,
          autoProgression: gameState.autoProgression,
        });
      }
    } else {
      console.error("Throw recording failed:", result);
    }

    notify();
    return result;
  };

  const recordThrow = recordThrowInternal;

  const nextFrameInternal = () => {
    console.log("nextFrameInternal called - moving to next frame");
    console.log("Before reset:", {
      currentFrame: gameState.bowlingGame.currentFrame,
      pinsDown: gameState.pinsDown,
      pinStates: gameState.pinStates,
    });

    resetPinCount();
    resetBall();
    gameState.gamePhase = "playing";

    console.log("After reset:", {
      currentFrame: gameState.bowlingGame.currentFrame,
      pinsDown: gameState.pinsDown,
      pinStates: gameState.pinStates,
      gamePhase: gameState.gamePhase,
    });

    if (gameState.gameController) {
      gameState.gameController.onFrameStart();
    }
    notify();
  };

  const nextFrame = nextFrameInternal;

  const setControlPhase = (phase) => {
    gameState.controlPhase = phase;
    notify();
  };

  const setBallRef = (ref) => {
    gameState.ballRef = ref;
  };

  const setIsRolling = (rolling) => {
    const prevRolling = gameState.isRolling;
    if (prevRolling === rolling) return;

    gameState.isRolling = rolling;

    if (
      !rolling &&
      prevRolling && // Only trigger when ball actually stops (was rolling, now not)
      gameState.gamePhase === "playing" &&
      gameState.autoProgression
    ) {
      if (gameState.gameController) {
        gameState.gameController.onBallStopped();
      }
    }

    notify();
  };

  const setPinRefs = (refs) => {
    gameState.pinRefs = refs;
  };

  const checkPins = () => {
    updatePinCount();
  };

  const resetPinCount = () => {
    console.log("resetPinCount called - resetting all pin tracking");
    gameState.pinsDown = 0;
    gameState.pinStates = Array(10).fill(false);
    gameState.pinOutOfBounds = Array(10).fill(false);
    notify();
  };

  const resetPinsSelective = () => {
    const needsFullReset = gameState.bowlingGame.needsFullPinReset();

    if (needsFullReset) {
      resetPinCount();
    } else {
      const currentFrame =
        gameState.bowlingGame.frames[gameState.bowlingGame.currentFrame];
      const firstThrowPins = currentFrame?.throws[0] || 0;

      console.log(
        "Selective pin reset - keeping first throw pins:",
        firstThrowPins
      );
      gameState.pinsDown = firstThrowPins;
    }

    notify();
  };

  const getGameInfo = () => {
    return {
      ...gameState.bowlingGame.getGameState(),
      remainingPins: gameState.bowlingGame.getRemainingPins(),
      needsFullReset: gameState.bowlingGame.needsFullPinReset(),
      gamePhase: gameState.gamePhase,
      lastThrowResult: gameState.lastThrowResult,
    };
  };

  const updateTimingConfig = (config) => {
    if (gameState.gameController) {
      gameState.gameController.updateConfig(config);
    }
  };

  return {
    ...state,
    // Game control
    startGame,
    nextFrame,
    getGameInfo,

    // Ball control
    throwBall,
    resetBall,
    setBallRef,
    setIsRolling,
    controlPhase: state.controlPhase,
    setControlPhase,

    // Pin control
    setPinRefs,
    checkPins,
    resetPinCount,
    resetPinsSelective,

    // Debug
    updateTimingConfig,

    // Manual controls (debug)
    recordThrow,
  };
};
