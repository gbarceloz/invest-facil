import type { ReactNode } from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BackgroundEffects } from "../../high-impact/BackgroundEffects";
import { SoundEffect } from "../../high-impact/SoundEffect";
import { CLAMP, FONT, MUTED, WHITE, YELLOW } from "../v01/data";
import { SceneRenderer } from "./Scenes";
import type { VariantConfig } from "./types";

export function durationInFrames(config: VariantConfig) {
  const last = config.lines[config.lines.length - 1];
  return Math.ceil((last.end + 0.9) * 30);
}

export function secondsForScene(config: VariantConfig, index: number) {
  const scene = config.scenes[index];
  const start = config.lines[scene.lines[0]].start;
  const end = config.lines[scene.lines[1]].end;
  return { from: Math.max(0, start - 0.04), to: end + 0.04 };
}

function PunchWrap({ children, local, sceneFrames }: { children: ReactNode; local: number; sceneFrames: number }) {
  const cuts = sceneFrames > 180 ? 2 : sceneFrames > 110 ? 1 : 0;
  const stage = cuts === 0 ? 0 : Math.min(cuts, Math.floor(local / (sceneFrames / (cuts + 1))));
  const scale = 1 + stage * 0.018;
  return <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>{children}</AbsoluteFill>;
}

function CutScene({ from, to, zIndex = 0, children }: { from: number; to: number; zIndex?: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) {
    return null;
  }
  return <AbsoluteFill style={{ zIndex }}>{children}</AbsoluteFill>;
}

function TopLabel({ variant }: { variant: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 70,
        right: 120,
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: FONT,
        zIndex: 200,
      }}
    >
      <div style={{ width: 9, height: 9, borderRadius: 99, background: YELLOW, boxShadow: `0 0 16px ${YELLOW}` }} />
      <div style={{ color: WHITE, fontSize: 21, fontWeight: 800, letterSpacing: "0.14em" }}>INVEST FÁCIL</div>
      <div style={{ color: MUTED, fontSize: 21, fontWeight: 700, letterSpacing: "0.14em" }}>/ {variant}</div>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
    </div>
  );
}

function ProgressLine({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [0, duration], [0, 100], CLAMP);
  return <div style={{ position: "absolute", top: 0, left: 0, width: `${width}%`, height: 3, background: YELLOW, zIndex: 250 }} />;
}

function MusicTrack({ src, duration }: { src: string; duration: number }) {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const fadeIn = interpolate(t, [0, 0.5], [0, 1], CLAMP);
  const fadeOut = interpolate(t, [duration - 1.2, duration], [1, 0], CLAMP);
  return <Audio src={staticFile(src)} volume={() => 0.21 * fadeIn * fadeOut} />;
}

export function VariantVideo({ config, duration }: { config: VariantConfig; duration: number }) {
  const frame = useCurrentFrame();
  const narration = `projects/investfacil-10-creative-variants/${config.id.toLowerCase()}/narration/narracao.wav`;
  const scenes = config.scenes.map((scene, index) => {
    const { from, to } = secondsForScene(config, index);
    return {
      scene,
      from: Math.round(from * 30),
      to: index === config.scenes.length - 1 ? duration : Math.round(to * 30),
    };
  });

  return (
    <AbsoluteFill style={{ background: "#050505", fontFamily: FONT, color: WHITE }}>
      <style>{`@font-face { font-family: "Plus Jakarta Sans"; src: url("${staticFile(
        "fonts/PlusJakartaSans.ttf",
      )}") format("truetype"); font-weight: 100 900; font-style: normal; font-display: block; }`}</style>

      <BackgroundEffects intensity={0.58} />
      <TopLabel variant={config.title} />
      <ProgressLine duration={duration} />

      {scenes.map(({ scene, from, to }, index) => (
        <CutScene key={index} from={from} to={to} zIndex={10 + index * 10}>
          <PunchWrap local={Math.max(0, frame - from)} sceneFrames={to - from}>
            <SceneRenderer scene={scene} local={Math.max(0, frame - from)} sceneFrames={to - from} />
          </PunchWrap>
        </CutScene>
      ))}

      <Audio src={staticFile(narration)} volume={1} />
      <MusicTrack src={config.music} duration={duration / 30} />

      {scenes.map(({ from }, index) => (
        <SoundEffect
          key={`whoosh-${index}`}
          base={config.sfxBase}
          file="whoosh.wav"
          at={from / 30}
          volume={index === 0 ? 0.22 : 0.16}
        />
      ))}
      <SoundEffect base={config.sfxBase} file="impact.wav" at={0.0} volume={0.42} />
      <SoundEffect base={config.sfxBase} file="impact.wav" at={config.lines[config.lines.length - 2]?.end ?? 0} volume={0.34} />
      <SoundEffect base={config.sfxBase} file="ui-pop.wav" at={scenes[scenes.length - 1].from / 30} volume={0.14} />
      <SoundEffect base={config.sfxBase} file="sweep.wav" at={Math.max(0, duration / 30 - 1.0)} volume={0.10} />
    </AbsoluteFill>
  );
}
