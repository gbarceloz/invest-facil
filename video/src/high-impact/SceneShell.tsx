import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "./constants";

type Props = {
  children: ReactNode;
  from: number;
  to: number;
  zIndex?: number;
  fadeIn?: boolean;
  enter?: "fade" | "rise" | "zoom" | "wipe";
  exitFade?: number;
};

export function SceneShell({ children, from, to, zIndex = 0, fadeIn = true, enter = "rise", exitFade = 12 }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterProgress = fadeIn
    ? spring({
        frame: frame - from,
        fps,
        config: { damping: 22, stiffness: 95, mass: 0.9 },
        durationInFrames: 14,
      })
    : 1;
  const exitOpacity = interpolate(frame, [to - exitFade, to], [1, 0], CLAMP);
  const opacity = Math.min(enterProgress, exitOpacity);
  const rise = interpolate(enterProgress, [0, 1], [34, 0]);
  const zoom = interpolate(enterProgress, [0, 1], [1.035, 1]);
  const wipe = interpolate(enterProgress, [0, 1], [100, 0]);

  return (
    <AbsoluteFill
      style={{
        zIndex,
        opacity,
        transform:
          enter === "rise" ? `translateY(${rise}px)` : enter === "zoom" ? `scale(${zoom})` : undefined,
        clipPath: enter === "wipe" ? `inset(0 0 ${wipe}% 0)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
