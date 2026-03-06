import { useState } from "react";
import { useGameState } from "../hooks/useGameState";
import Scoreboard from "./Scoreboard";
import GameOverScreen from "./GameOverScreen";

export const GameUI = ({ onBackToMenu }) => {
  const [isScoreboardCollapsed, setIsScoreboardCollapsed] = useState(false);

  const { getGameInfo, startGame } = useGameState();

  const gameInfo = getGameInfo();

  const handlePlayAgain = () => {
    startGame();
  };

  return (
    <div className="scoreboard-wrapper">
      <div className="scoreboard-header-controls">
        <button
          onClick={() => setIsScoreboardCollapsed(!isScoreboardCollapsed)}
          className="scoreboard-toggle"
        >
          {isScoreboardCollapsed ? "Montrer les scores" : "Cacher les scores"}
        </button>
      </div>

      <div
        className={`scoreboard-content ${
          isScoreboardCollapsed ? "collapsed" : ""
        }`}
      >
        <Scoreboard gameInfo={gameInfo} />
      </div>

      {gameInfo.gameComplete && (
        <GameOverScreen gameInfo={gameInfo} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  );
};
