import { useState, useEffect } from "react";
import { Euler, Quaternion } from "three";

let gameState = {
  ballsThrown: 0,
  isRolling: false,
  ballRef: null,
  pinRefs: [],
  pinsDown: 0,
  pinStates: Array(10).fill(false),
  pinOutOfBounds: Array(10).fill(false),
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

  // More precise change detection
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

  useEffect(() => {
    gameState.listeners.add(setState);
    return () => gameState.listeners.delete(setState);
  }, []);

  const throwBall = () => {
    if (gameState.ballRef && !gameState.isRolling) {
      gameState.ballRef.throwBall();
      gameState.isRolling = true;
      gameState.ballsThrown++;
      notify();
    }
  };

  const resetBall = () => {
    if (gameState.ballRef) {
      gameState.ballRef.resetBall();
      gameState.isRolling = false;
      notify();
    }
  };

  const setBallRef = (ref) => {
    gameState.ballRef = ref;
  };

  const setIsRolling = (rolling) => {
    gameState.isRolling = rolling;
    notify();
  };

  const setPinRefs = (refs) => {
    gameState.pinRefs = refs;
  };

  const checkPins = () => {
    updatePinCount();
  };

  const resetPinCount = () => {
    gameState.pinsDown = 0;
    gameState.pinStates = Array(10).fill(false);
    gameState.pinOutOfBounds = Array(10).fill(false);
    notify();
  };

  return {
    ...state,
    throwBall,
    resetBall,
    setBallRef,
    setIsRolling,
    setPinRefs,
    checkPins,
    resetPinCount,
  };
};
