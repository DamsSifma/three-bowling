import { useGameState } from "../hooks/useGameState";
import Scoreboard from "./Scoreboard";

export const GameUI = ({ onBackToMenu }) => {
  const {
    isRolling,
    throwBall,
    resetBall,
    pinsDown,
    gamePhase,
    getGameInfo,
    nextFrame,
    recordThrow,
  } = useGameState();

  const gameInfo = getGameInfo();

  const canThrow = gamePhase === "playing" && !isRolling;
  const showNextFrame = gamePhase === "frameComplete";

  const getStatusMessage = () => {
    if (gamePhase === "gameComplete") return "🎉 Game Complete!";
    if (gamePhase === "frameComplete") {
      const lastResult = gameInfo.lastThrowResult;
      if (lastResult?.isStrike) return "🎯 STRIKE!";
      if (lastResult?.isSpare) return "🎳 SPARE!";
      return "Frame Complete";
    }
    if (gamePhase === "playing") {
      const { currentFrame, currentThrow } = gameInfo;
      const throwNumber = currentThrow === 0 ? "1st" : "2nd";
      return `Frame ${currentFrame + 1} - ${throwNumber} throw`;
    }
    return "Ready to play";
  };

  return (
    <>
      {/* Scoreboard */}
      <div className="scoreboard-wrapper">
        <Scoreboard gameInfo={gameInfo} />
      </div>

      {/* Game Controls */}
      <div className="game-controls">
        <div className="game-info">
          <h3 className="game-title">🎳 Bowling Game</h3>

          <div className="game-status-message">
            <strong>{getStatusMessage()}</strong>
          </div>

          <div className="pins-status">
            Pins down:{" "}
            <strong>
              {pinsDown}/{gameInfo.remainingPins}
            </strong>
          </div>

          {gameInfo.lastThrowResult?.isStrike && (
            <div className="strike-notification">🎯 STRIKE!</div>
          )}

          {gameInfo.lastThrowResult?.isSpare && (
            <div className="spare-notification">🎳 SPARE!</div>
          )}
        </div>

        <div className="button-container">
          <button
            onClick={throwBall}
            className={`game-button throw-button ${
              canThrow ? "enabled" : "disabled"
            }`}
            disabled={!canThrow}
          >
            {isRolling ? "🎳 Rolling..." : "🚀 THROW"}
          </button>

          {showNextFrame && (
            <button
              onClick={nextFrame}
              className="game-button next-frame-button"
            >
              ▶️ Next Frame
            </button>
          )}

          <button onClick={resetBall} className="game-button reset-button">
            🔄 Reset Ball
          </button>

          {/* Debug/Manual controls */}
          <button onClick={recordThrow} className="game-button debug-button">
            📝 Record Throw
          </button>

          <button
            onClick={() => {
              console.log("Debug Game State Button Clicked");
              const info = getGameInfo();
              console.log("Current Game State:", {
                gamePhase: info.gamePhase,
                currentFrame: info.currentFrame,
                currentThrow: info.currentThrow,
                pinsDown,
                isRolling,
              });
            }}
            className="game-button debug-button"
          >
            🐛 Debug State
          </button>

          <button onClick={onBackToMenu} className="game-button menu-button">
            🏠 MENU
          </button>
        </div>
      </div>
    </>
  );
};
