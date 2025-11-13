const Scoreboard = ({ gameInfo }) => {
  const { frames, currentFrame, totalScore, gameComplete } = gameInfo;

  const formatThrow = (throwValue, throwIndex, frame) => {
    if (throwValue === undefined) return "";

    if (throwIndex === 0 && throwValue === 10) {
      return "X"; // Strike
    }

    if (throwIndex === 1) {
      const total = frame.throws[0] + throwValue;
      if (total === 10) {
        return "/"; // Spare
      }
    }

    if (throwValue === 0) return "-";
    return throwValue.toString();
  };

  const formatFrame10 = (frame) => {
    const throws = frame.throws || [];
    const formatted = [];

    for (let i = 0; i < 3; i++) {
      if (i >= throws.length) {
        formatted.push("");
        continue;
      }

      const throwValue = throws[i];

      if (throwValue === 10) {
        formatted.push("X");
      } else if (
        i > 0 &&
        throws[i - 1] !== 10 &&
        throws[i - 1] + throwValue === 10
      ) {
        formatted.push("/");
      } else if (throwValue === 0) {
        formatted.push("-");
      } else {
        formatted.push(throwValue.toString());
      }
    }

    return formatted;
  };

  return (
    <div className="scoreboard">
      <div className="scoreboard-header">
        <div className="total-score">
          <span className="score-label">Total:</span>
          <span className="score-value">{totalScore}</span>
        </div>
      </div>

      <div className="frame-container">
        {frames.map((frame, index) => (
          <div
            key={index}
            className={`frame ${index === currentFrame ? "current" : ""} ${
              frame.isComplete ? "complete" : ""
            }`}
          >
            <div className="frame-number">{index + 1}</div>

            {index < 9 ? (
              // Frames 1-9
              <div className="throws">
                <div className="throw-boxes">
                  <div className="throw-box first">
                    {frame.isStrike
                      ? "X"
                      : formatThrow(frame.throws[0], 0, frame)}
                  </div>
                  <div className="throw-box second">
                    {frame.isStrike
                      ? ""
                      : formatThrow(frame.throws[1], 1, frame)}
                  </div>
                </div>
                <div className="frame-score">
                  {frame.score !== null ? frame.score : ""}
                </div>
              </div>
            ) : (
              // Frame 10
              <div className="throws tenth-frame">
                <div className="throw-boxes">
                  {formatFrame10(frame).map((throwStr, throwIndex) => (
                    <div key={throwIndex} className="throw-box">
                      {throwStr}
                    </div>
                  ))}
                </div>
                <div className="frame-score">
                  {frame.score !== null ? frame.score : ""}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="game-status">
        {gameComplete && (
          <div className="game-complete">
            🎳 Partie terminée ! Score final: {totalScore}
          </div>
        )}
        {!gameComplete && (
          <div className="current-frame">
            Frame {currentFrame + 1}{" "}
            {frames[currentFrame]?.isComplete ? "(Terminée)" : "(En cours)"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;
