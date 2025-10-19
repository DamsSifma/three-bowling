import { useGameState } from "../hooks/useGameState";

export const GameUI = () => {
  const { ballsThrown, isRolling, throwBall, resetBall, pinsDown, pinStates } =
    useGameState();

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        background: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: "20px",
        borderRadius: "10px",
        fontSize: "14px",
        minWidth: "200px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
      }}
    >
      <div style={{ marginBottom: "15px" }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
          🎳 Bowling Game
        </h3>
        <div>
          Balls thrown: <strong>{ballsThrown}</strong>
        </div>
        <div>
          Pins down: <strong>{pinsDown}/10</strong>
        </div>
        {pinsDown === 10 && (
          <div style={{ color: "#4CAF50", fontWeight: "bold" }}>🎉 STRIKE!</div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={throwBall}
          style={{
            padding: "12px 20px",
            backgroundColor: isRolling ? "#555" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isRolling ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.2s",
          }}
          disabled={isRolling}
        >
          {isRolling ? "🎳 Rolling..." : "🚀 THROW"}
        </button>

        <button
          onClick={resetBall}
          style={{
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            transition: "background-color 0.2s",
          }}
        >
          🔄 Reset Ball
        </button>
      </div>
    </div>
  );
};
