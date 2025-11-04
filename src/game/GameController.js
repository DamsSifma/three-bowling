export class GameController {
  constructor(gameStateRef) {
    this.gameStateRef = gameStateRef;
    this.timers = new Map();
    this.config = {
      ballSettleTime: 1500, // Temps pour que la balle se stabilise
      frameTransitionTime: 2000, // Temps de transition entre les frames
      ballResetTime: 1000, // Tempo pour réinitialiser la balle
      pinSettleTime: 500, // Temps que les quilles se stabilisent
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
    console.log("GameController: Ball stopped, starting auto-progression");

    // On attend que les quilles se stabilisent avant d'enregistrer le lancer
    this.setTimer(
      "recordThrow",
      () => {
        console.log("GameController: Recording throw");
        const gameState = this.gameStateRef.current;
        if (gameState && gameState.recordThrow) {
          gameState.recordThrow();
        }
      },
      this.config.pinSettleTime
    );
  }

  onThrowRecorded(result) {
    console.log("GameController: Throw recorded with result:", result);

    if (!result.success) {
      console.log("GameController: Throw was not successful, stopping");
      return;
    }

    if (result.nextAction === "secondThrow") {
      console.log(
        "GameController: Setting timer for ball reset (second throw)"
      );
      this.setTimer(
        "ballReset",
        () => {
          console.log("GameController: Resetting ball for second throw");
          const gameState = this.gameStateRef.current;
          if (gameState && gameState.resetBall) {
            gameState.resetBall();
          }
        },
        this.config.ballResetTime
      );
    } else if (result.nextAction === "nextFrame") {
      console.log("GameController: Setting timer for next frame transition");
      this.setTimer(
        "nextFrame",
        () => {
          console.log("GameController: Moving to next frame");
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
    } else {
      console.log("GameController: Unknown nextAction:", result.nextAction);
    }
  }

  onFrameStart() {
    console.log("GameController: Frame started, resetting timers");
    this.clearAllTimers();
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  destroy() {
    this.clearAllTimers();
  }
}
