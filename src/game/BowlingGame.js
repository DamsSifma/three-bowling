export class BowlingGame {
  constructor() {
    this.frames = Array(10)
      .fill(null)
      .map(() => ({
        throws: [],
        score: null,
        isComplete: false,
        isStrike: false,
        isSpare: false,
      }));

    this.currentFrame = 0;
    this.currentThrow = 0;
    this.totalScore = 0;
    this.gameComplete = false;
    this.isGameStarted = false;
  }

  reset() {
    this.frames = Array(10)
      .fill(null)
      .map(() => ({
        throws: [],
        score: null,
        isComplete: false,
        isStrike: false,
        isSpare: false,
      }));

    this.currentFrame = 0;
    this.currentThrow = 0;
    this.totalScore = 0;
    this.gameComplete = false;
    this.isGameStarted = true;
  }

  recordThrow(pinsDown) {
    if (this.gameComplete) {
      return { success: false, message: "Game is complete" };
    }

    if (!this.isGameStarted) {
      this.isGameStarted = true;
    }

    const frame = this.frames[this.currentFrame];

    // Validate throw
    if (this.currentFrame < 9) {
      // Frames 1-9
      if (this.currentThrow === 0 && (pinsDown < 0 || pinsDown > 10)) {
        return {
          success: false,
          message: "Invalid pins count for first throw",
        };
      }
      if (
        this.currentThrow === 1 &&
        (pinsDown < 0 || frame.throws[0] + pinsDown > 10)
      ) {
        return {
          success: false,
          message: "Invalid pins count for second throw",
        };
      }
    } else {
      // Frame 10: Special rules
      if (pinsDown < 0 || pinsDown > 10) {
        return { success: false, message: "Invalid pins count" };
      }
    }

    frame.throws.push(pinsDown);

    let nextAction = "continue";
    let isFrameComplete = false;

    if (this.currentFrame < 9) {
      if (this.currentThrow === 0 && pinsDown === 10) {
        frame.isStrike = true;
        frame.isComplete = true;
        isFrameComplete = true;
        nextAction = "nextFrame";
      } else if (this.currentThrow === 1) {
        if (frame.throws[0] + pinsDown === 10) {
          frame.isSpare = true;
        }
        frame.isComplete = true;
        isFrameComplete = true;
        nextAction = "nextFrame";
      } else {
        // pas strike
        this.currentThrow = 1;
        nextAction = "secondThrow";
      }
    } else {
      // Logique spéciale pour la 10ème frame
      const totalThrows = frame.throws.length;

      if (totalThrows === 1 && pinsDown === 10) {
        // Strike premier lancer
        frame.isStrike = true;
        nextAction = "continue"; // Lancers bonus
      } else if (totalThrows === 2) {
        if (
          frame.throws[0] === 10 ||
          frame.throws[0] + frame.throws[1] === 10
        ) {
          // Strike ou spare au deuxième lancer
          if (
            frame.throws[0] + frame.throws[1] === 10 &&
            frame.throws[0] !== 10
          ) {
            frame.isSpare = true;
          }
          nextAction = "continue"; // troisème lancer
        } else {
          // Pas de strike ou spare, frame complète
          frame.isComplete = true;
          isFrameComplete = true;
          nextAction = "gameComplete";
        }
      } else if (totalThrows === 3) {
        // Troisième lancer en 10ème frame, jeu terminé
        frame.isComplete = true;
        isFrameComplete = true;
        nextAction = "gameComplete";
      }
    }

    if (isFrameComplete && this.currentFrame < 9) {
      this.currentFrame++;
      this.currentThrow = 0;
    }

    if (nextAction === "gameComplete") {
      this.gameComplete = true;
    }

    this.calculateScores();

    return {
      success: true,
      currentFrame: this.currentFrame,
      currentThrow: nextAction === "secondThrow" ? 1 : 0,
      isFrameComplete,
      isStrike: frame.isStrike,
      isSpare: frame.isSpare,
      nextAction,
      totalScore: this.totalScore,
      gameComplete: this.gameComplete,
    };
  }

  /**
   * Calculate scores for all frames following bowling rules
   */
  calculateScores() {
    let runningScore = 0;

    for (let i = 0; i < 10; i++) {
      const frame = this.frames[i];

      if (frame.throws.length === 0) {
        break;
      }

      let frameScore = 0;

      if (i < 9) {
        if (frame.isStrike) {
          frameScore = 10;
          // Add bonus from next two throws
          if (i + 1 < 10 && this.frames[i + 1].throws.length > 0) {
            frameScore += this.frames[i + 1].throws[0];
            if (
              this.frames[i + 1].isStrike &&
              i + 2 < 10 &&
              this.frames[i + 2].throws.length > 0
            ) {
              // Next frame is also a strike, get first throw from frame after that
              frameScore += this.frames[i + 2].throws[0];
            } else if (this.frames[i + 1].throws.length > 1) {
              // Next frame has second throw
              frameScore += this.frames[i + 1].throws[1];
            }
          }
        } else if (frame.isSpare) {
          frameScore = 10;
          // Add bonus from next throw
          if (i + 1 < 10 && this.frames[i + 1].throws.length > 0) {
            frameScore += this.frames[i + 1].throws[0];
          }
        } else {
          // Open frame
          frameScore = frame.throws.reduce((sum, pins) => sum + pins, 0);
        }
      } else {
        // Frame 10: Just sum all throws
        frameScore = frame.throws.reduce((sum, pins) => sum + pins, 0);
      }

      runningScore += frameScore;
      frame.score = runningScore;
    }

    this.totalScore = runningScore;
  }

  getGameState() {
    return {
      frames: [...this.frames],
      currentFrame: this.currentFrame,
      currentThrow: this.currentThrow,
      totalScore: this.totalScore,
      gameComplete: this.gameComplete,
      isGameStarted: this.isGameStarted,
    };
  }

  getRemainingPins() {
    if (this.gameComplete) return 10;

    const frame = this.frames[this.currentFrame];

    if (this.currentFrame < 9) {
      // Frames 1-9
      if (this.currentThrow === 0) return 10;
      return 10 - frame.throws[0];
    } else {
      // Frame 10
      const throwCount = frame.throws.length;
      if (throwCount === 0) return 10;
      if (throwCount === 1) {
        return frame.throws[0] === 10 ? 10 : 10 - frame.throws[0];
      }
      if (throwCount === 2) {
        if (frame.throws[0] === 10) return 10; // Strike
        if (frame.throws[0] + frame.throws[1] === 10) return 10; // Spare
        return 0;
      }
      return 0;
    }
  }

  needsFullPinReset() {
    if (this.gameComplete) return true;

    const frame = this.frames[this.currentFrame];

    if (this.currentFrame < 9) {
      // Frames 1-9
      return this.currentThrow === 0;
    } else {
      // Frame 10
      const throwCount = frame.throws.length;
      if (throwCount === 0) return true;
      if (throwCount === 1 && frame.throws[0] === 10) return true; // After strike
      if (throwCount === 2 && frame.throws[0] + frame.throws[1] === 10)
        return true; // After spare
      return false;
    }
  }
}
