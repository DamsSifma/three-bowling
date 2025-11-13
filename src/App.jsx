import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Leva, useControls } from "leva";
import { Perf } from "r3f-perf";
import { GameUI } from "./components/GameUI";
import { MainMenu } from "./components/MainMenu";
import { PowerMeter } from "./components/PowerMeter";
import { useGameState } from "./hooks/useGameState";

function App() {
  const [appState, setAppState] = useState("menu");
  const { startGame } = useGameState();
  const isDev = process.env.NODE_ENV !== "production";

  const { backgroundColor, showPerf, showGraph } = useControls("Debug", {
    backgroundColor: { value: "#1e1e1e" },
    showPerf: false,
    showGraph: false,
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
      <Leva
        collapsed
        hidden={!isDev}
        theme={{ sizes: { rootWidth: "350px" } }}
      />
      {appState === "playing" && (
        <>
          <Canvas shadows camera={{ position: [0, 4, -2], fov: 60 }}>
            {showPerf && <Perf showGraph={showGraph} position="top-left" />}
            <color attach="background" args={[backgroundColor]} />
            <Experience />
          </Canvas>
          <GameUI onBackToMenu={handleBackToMenu} />
          <PowerMeter />
        </>
      )}

      {appState === "menu" && <MainMenu onStartGame={handleStartGame} />}
    </>
  );
}

export default App;
