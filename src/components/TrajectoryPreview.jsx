import { Line } from "@react-three/drei";
import { Vector3 } from "three";

export const TrajectoryPreview = ({
  show,
  ballPosition,
  throwAngle,
  power,
  isRolling,
  controlPhase,
}) => {
  if (
    !show ||
    isRolling ||
    (controlPhase !== "aiming" && controlPhase !== "positioning")
  )
    return null;

  const points = [];
  const startPos = new Vector3(ballPosition.x, ballPosition.y, ballPosition.z);

  const angleRad =
    controlPhase === "positioning" ? 0 : (throwAngle * Math.PI) / 180;
  const direction = new Vector3(Math.sin(angleRad) * 0.1, 0, 1).normalize();

  for (let i = 0; i < 15; i++) {
    const t = i * 0.3;
    const point = new Vector3(
      startPos.x + direction.x * power * t,
      0.11,
      startPos.z + direction.z * power * t
    );
    points.push(point);
  }

  const color = controlPhase === "positioning" ? "#4a90e2" : "#4CAF50";
  const opacity = controlPhase === "positioning" ? 0.4 : 0.6;

  return (
    <Line
      points={points}
      color={color}
      lineWidth={3}
      transparent
      opacity={opacity}
      dashed={true}
      dashScale={2}
    />
  );
};
