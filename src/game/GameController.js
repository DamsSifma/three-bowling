export class GameController {
  constructor(gameStateRef) {
    this.gameStateRef = gameStateRef;
    this.timers = new Map();
    this.config = {
      ballSettleTime: 2000, // Temps pour que la balle se stabilise
      frameTransitionTime: 1000, // Temps de transition entre les frames
      ballResetTime: 2000, // Tempo pour réinitialiser la balle
      pinSettleTime: 2500, // Temps que les quilles se stabilisent
    };
  }

  clearTimer(name) {
    if (this.timers.has(name)) {
      clearTimeout(this.timers.get(name));
      this.timers.delete(name);
    }
  }

  clearAllTimers() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  setTimer(name, callback, delay) {
    this.clearTimer(name);
    const timer = setTimeout(() => {
      this.timers.delete(name);
      callback();
    }, delay);
    this.timers.set(name, timer);
  }

  onBallStopped() {
    // On attend que les quilles se stabilisent avant d'enregistrer le lancer
    this.setTimer(
      "recordThrow",
      () => {
        const gameState = this.gameStateRef.current;
        if (gameState && gameState.recordThrow) {
          gameState.recordThrow();
        }
      },
      this.config.pinSettleTime
    );
  }

  onThrowRecorded(result) {
    if (!result.success) {
      console.log("GameController: Throw was not successful, stopping");
      return;
    }

    if (result.nextAction === "secondThrow") {
      setTimeout(() => {
        const gameState = this.gameStateRef.current;
        if (gameState && gameState.resetBall) {
          gameState.resetBall();
        }
      }, this.config.ballSettleDelay);
    } else if (result.nextAction === "nextFrame") {
      this.setTimer(
        "nextFrame",
        () => {
          const gameState = this.gameStateRef.current;
          if (gameState && gameState.nextFrame) {
            gameState.nextFrame();
          }
        },
        this.config.frameTransitionTime
      );
    } else if (result.nextAction === "gameComplete") {
      console.log("GameController: Game completed!");
      this.clearAllTimers();
    } else if (result.nextAction === "continue") {
      setTimeout(() => {
        const gameState = this.gameStateRef.current;
        if (gameState && gameState.resetBall) {
          gameState.resetBall();
        }
      }, this.config.ballSettleDelay);
    } else {
      console.log("GameController: Unknown nextAction:", result.nextAction);
    }
  }

  onFrameStart() {
    this.clearAllTimers();
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  destroy() {
    this.clearAllTimers();
  }
}
