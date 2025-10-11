import { useState, useEffect } from "react";

let gameState = {
  ballsThrown: 0,
  isRolling: false,
  ballRef: null,
  listeners: new Set(),
};

const notify = () => {
  gameState.listeners.forEach((listener) => listener({ ...gameState }));
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

  return {
    ...state,
    throwBall,
    resetBall,
    setBallRef,
    setIsRolling,
  };
};
