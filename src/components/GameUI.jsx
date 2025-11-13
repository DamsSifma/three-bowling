import { useState } from "react";
import { useGameState } from "../hooks/useGameState";
import Scoreboard from "./Scoreboard";

export const GameUI = ({ onBackToMenu }) => {
  const [isScoreboardCollapsed, setIsScoreboardCollapsed] = useState(false);

  const { getGameInfo } = useGameState();

  const gameInfo = getGameInfo();

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
    </div>
  );
};
