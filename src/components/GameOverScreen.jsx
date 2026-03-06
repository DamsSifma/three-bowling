import { useState, useEffect } from "react";
import { saveScore, getLeaderboard } from "../api/scores";

const GameOverScreen = ({ gameInfo, onPlayAgain }) => {
  const [playerName, setPlayerName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLeaderboard()
      .then(setLeaderboard)
      .catch(() => {});
  }, [saved]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveScore({
        playerName: playerName.trim() || "Anonyme",
        totalScore: gameInfo.totalScore,
        frames: gameInfo.frames,
      });
      setSaved(true);
      const scores = await getLeaderboard();
      setLeaderboard(scores);
    } catch {
      setError("Impossible de sauvegarder le score");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="game-over-overlay">
      <div className="game-over-card">
        <h2>🎳 Partie terminée !</h2>
        <p className="final-score">Score final : {gameInfo.totalScore}</p>

        {!saved ? (
          <div className="save-score-form">
            <input
              type="text"
              placeholder="Ton nom (optionnel)"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={50}
              className="player-name-input"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="save-score-btn"
            >
              {saving ? "Sauvegarde..." : "Enregistrer le score"}
            </button>
            {error && <p className="save-error">{error}</p>}
          </div>
        ) : (
          <p className="save-success">✅ Score enregistré !</p>
        )}

        {leaderboard.length > 0 && (
          <div className="leaderboard">
            <h3>🏆 Top 10</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Joueur</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr key={entry.id}>
                    <td>{i + 1}</td>
                    <td>{entry.player_name}</td>
                    <td>{entry.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={onPlayAgain} className="play-again-btn">
          Rejouer
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
