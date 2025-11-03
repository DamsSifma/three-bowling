import { useEffect, useState } from "react";
import useSound from "use-sound";

const useSoundBoard = () => {
  const [loaded, setLoaded] = useState(0);
  const onLoad = () => {
    setLoaded((loader) => loader + 1);
  };

  const [playPinHit] = useSound("/sounds/hit.mp3", {
    volume: 0.7,
    onload: onLoad,
  });

  const sounds = {
    pinHit: playPinHit,
  };
  const toLoad = Object.keys(sounds).length;

  useEffect(() => {
    if (loaded < toLoad) return;
    console.log("All sounds loaded:", loaded, "/", toLoad);
  }, [loaded, toLoad]);

  return {
    sounds,
    loaded,
    allSoundsLoaded: loaded >= toLoad,
  };
};

export default useSoundBoard;
