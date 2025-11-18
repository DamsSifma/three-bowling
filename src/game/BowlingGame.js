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

    // Validate throw - same rules for all frames
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
        // Not strike
        this.currentThrow = 1;
        nextAction = "secondThrow";
      }
    } else {
      if (this.currentThrow === 0 && pinsDown === 10) {
        frame.isStrike = true;
        frame.isComplete = true;
        isFrameComplete = true;
        nextAction = "gameComplete";
      } else if (this.currentThrow === 1) {
        if (frame.throws[0] + pinsDown === 10) {
          frame.isSpare = true;
        }
        frame.isComplete = true;
        isFrameComplete = true;
        nextAction = "gameComplete";
      } else {
        // Not strike
        this.currentThrow = 1;
        nextAction = "secondThrow";
      }
    }

    // Normal frame advancement
    if (isFrameComplete && this.currentFrame < 9) {
      this.currentFrame++;
      this.currentThrow = 0;
    }

    if (nextAction === "gameComplete") {
      this.gameComplete = true;
    }

    this.calculateScores();

    const strikeThisThrow = this.currentThrow === 0 && pinsDown === 10;
    const spareThisThrow =
      this.currentThrow === 1 && frame.throws[0] + pinsDown === 10;

    return {
      success: true,
      currentFrame: this.currentFrame,
      currentThrow: nextAction === "secondThrow" ? 1 : 0,
      isFrameComplete,
      isStrike: strikeThisThrow,
      isSpare: spareThisThrow,
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

    if (this.currentThrow === 0) return 10;
    return 10 - frame.throws[0];
  }

  needsFullPinReset() {
    if (this.gameComplete) return true;

    return this.currentThrow === 0;
  }
}
