import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CLAMP, YELLOW } from "./constants";

const PARTICLES = Array.from({ length: 28 }, (_, index) => ({
  x: (index * 173 + 47) % 1040,
  y: (index * 251 + 90) % 1900,
  size: 1.5 + (index % 4) * 1.1,
  speed: 0.12 + (index % 5) * 0.045,
  phase: index * 0.73,
  opacity: 0.12 + (index % 4) * 0.06,
}));

export function BackgroundEffects({ intensity = 1 }: { intensity?: number }) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: -140,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          transform: `translateY(${interpolate(frame, [0, 1200], [0, -110], CLAMP)}px)`,
          opacity: 0.38 * intensity,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 34%, rgba(250,204,21,0.075) 0%, rgba(5,5,5,0) 46%), radial-gradient(circle at 80% 85%, rgba(250,204,21,0.035) 0%, rgba(5,5,5,0) 40%)",
        }}
      />
      {PARTICLES.map((particle, index) => {
        const y = (particle.y - frame * particle.speed + 2000) % 2050 - 80;
        const x = particle.x + Math.sin(frame / 47 + particle.phase) * 16;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: particle.size,
              height: particle.size,
              borderRadius: 999,
              background: YELLOW,
              opacity: particle.opacity * intensity,
              boxShadow: index % 5 === 0 ? "0 0 12px rgba(250,204,21,0.45)" : undefined,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          top: -300,
          bottom: -300,
          width: 240,
          left: interpolate(frame % 330, [0, 330], [-300, 1150], CLAMP),
          transform: "rotate(18deg)",
          background:
            "linear-gradient(90deg, rgba(250,204,21,0) 0%, rgba(250,204,21,0.045) 45%, rgba(250,204,21,0.10) 50%, rgba(250,204,21,0.045) 55%, rgba(250,204,21,0) 100%)",
          opacity: 0.55 * intensity,
          filter: "blur(12px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("${staticFile("hi01/grain.png")}")`,
          backgroundSize: "512px 512px",
          backgroundPosition: `${(frame * 1.7) % 512}px ${(frame * 2.3) % 512}px`,
          opacity: 0.055 * intensity,
          mixBlendMode: "overlay",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("${staticFile("hi01/scanlines.png")}")`,
          backgroundSize: "4px 4px",
          opacity: 0.05 * intensity,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.62) 100%)",
        }}
      />
    </AbsoluteFill>
  );
}
