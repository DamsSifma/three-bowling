const API_BASE = "/api";

export async function saveScore({ playerName, totalScore, frames }) {
  const res = await fetch(`${API_BASE}/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName, totalScore, frames }),
  });
  if (!res.ok) throw new Error("Failed to save score");
  return res.json();
}

export async function getLeaderboard() {
  const res = await fetch(`${API_BASE}/scores`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}
