import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CLAMP } from "./constants";

type Props = {
  children: ReactNode;
  from: number;
  to: number;
  zoomFrom?: number;
  zoomTo?: number;
  panX?: number;
  panY?: number;
  rotate?: number;
};

export function CameraMovement({
  children,
  from,
  to,
  zoomFrom = 1,
  zoomTo = 1.045,
  panX = 0,
  panY = 0,
  rotate = 0,
}: Props) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [from, to], [0, 1], CLAMP);
  const zoom = zoomFrom + (zoomTo - zoomFrom) * progress;
  const driftX = Math.sin(progress * Math.PI) * panX;
  const driftY = Math.sin(progress * Math.PI) * panY;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${driftX}px, ${driftY}px) scale(${zoom}) rotate(${rotate}deg)`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
