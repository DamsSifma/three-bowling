import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Leva, useControls } from "leva";
import { Perf } from "r3f-perf";
import { GameUI } from "./components/GameUI";
import { MainMenu } from "./components/MainMenu";

function App() {
  const [gameState, setGameState] = useState("menu");

  const { backgroundColor } = useControls("Colors", {
    backgroundColor: { value: "#1e1e1e" },
  });

  // TODO gérer les états avec un hook custom ou dans useGameState
  const handleStartGame = () => {
    setGameState("playing");
  };

  const handleBackToMenu = () => {
    setGameState("menu");
  };

  return (
    <>
      <Leva theme={{ sizes: { rootWidth: "350px" } }} />

      {gameState === "playing" && (
        <>
          <Canvas shadows camera={{ position: [0, 4, -2], fov: 60 }}>
            <Perf showGraph={false} position="top-left" />
            <color attach="background" args={[backgroundColor]} />
            <Experience />
          </Canvas>
          <GameUI onBackToMenu={handleBackToMenu} />
        </>
      )}

      {gameState === "menu" && <MainMenu onStartGame={handleStartGame} />}
    </>
  );
}

export default App;
