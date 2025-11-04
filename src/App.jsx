import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Leva, useControls } from "leva";
import { Perf } from "r3f-perf";
import { GameUI } from "./components/GameUI";
import { MainMenu } from "./components/MainMenu";
import { useGameState } from "./hooks/useGameState";

function App() {
  const [appState, setAppState] = useState("menu");
  const { startGame } = useGameState();

  const { backgroundColor } = useControls("Colors", {
    backgroundColor: { value: "#1e1e1e" },
  });

  const handleStartGame = () => {
    startGame();
    setAppState("playing");
  };

  const handleBackToMenu = () => {
    setAppState("menu");
  };

  return (
    <>
      <Leva theme={{ sizes: { rootWidth: "350px" } }} />

      {appState === "playing" && (
        <>
          <Canvas shadows camera={{ position: [0, 4, -2], fov: 60 }}>
            <Perf showGraph={false} position="top-left" />
            <color attach="background" args={[backgroundColor]} />
            <Experience />
          </Canvas>
          <GameUI onBackToMenu={handleBackToMenu} />
        </>
      )}

      {appState === "menu" && <MainMenu onStartGame={handleStartGame} />}
    </>
  );
}

export default App;
