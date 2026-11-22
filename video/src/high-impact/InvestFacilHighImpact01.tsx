import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { BackgroundEffects } from "./BackgroundEffects";
import { SceneShell } from "./SceneShell";
import { SoundEffect } from "./SoundEffect";
import { BG, CLAMP, FONT, SCENES, WHITE } from "./constants";
import { BasketScene } from "./scenes/BasketScene";
import { ExpectationScene } from "./scenes/ExpectationScene";
import { ExplanationScene } from "./scenes/ExplanationScene";
import { HookScene } from "./scenes/HookScene";
import { ImpactScene } from "./scenes/ImpactScene";
import { OutroScene } from "./scenes/OutroScene";

const AUDIO = "hi01";

function MusicTrack() {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const duck = interpolate(t, [0, 0.4, 0.9, 35.0, 35.7, 36.4, 40], [1, 1, 0.68, 0.68, 0.88, 0.88, 0.7], CLAMP);
  const fadeIn = interpolate(t, [0, 0.7], [0, 1], CLAMP);
  const fadeOut = interpolate(t, [37.4, 40], [1, 0], CLAMP);
  return (
    <Audio
      src={staticFile(`${AUDIO}/music.wav`)}
      volume={() => 0.92 * duck * fadeIn * fadeOut}
    />
  );
}

export function InvestFacilHighImpact01() {
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT, color: WHITE }}>
      <style>{`@font-face { font-family: "Plus Jakarta Sans"; src: url("${staticFile(
        "fonts/PlusJakartaSans.ttf",
      )}") format("truetype"); font-weight: 100 900; font-style: normal; font-display: block; }`}</style>

      <BackgroundEffects />

      <SceneShell {...SCENES.hook} zIndex={10} fadeIn={false} enter="fade">
        <HookScene />
      </SceneShell>
      <SceneShell {...SCENES.expectation} zIndex={20} enter="wipe">
        <ExpectationScene />
      </SceneShell>
      <SceneShell {...SCENES.basket} zIndex={30} enter="zoom">
        <BasketScene />
      </SceneShell>
      <SceneShell {...SCENES.explanation} zIndex={40} enter="rise">
        <ExplanationScene />
      </SceneShell>
      <SceneShell {...SCENES.impact} zIndex={50} enter="fade">
        <ImpactScene />
      </SceneShell>
      <SceneShell {...SCENES.outro} zIndex={60} enter="fade">
        <OutroScene />
      </SceneShell>

      <Sequence from={Math.round(0.35 * 30)} durationInFrames={1100} layout="none">
        <Audio src={staticFile(`${AUDIO}/narracao.wav`)} volume={1} />
      </Sequence>
      <MusicTrack />

      <SoundEffect file="impact.wav" at={0.0} volume={0.55} />
      <SoundEffect file="whoosh.wav" at={0.55} volume={0.34} />
      <SoundEffect file="click.wav" at={1.5} volume={0.2} />
      <SoundEffect file="whoosh.wav" at={3.35} volume={0.34} />
      <SoundEffect file="bass-hit.wav" at={5.75} volume={0.4} />
      <SoundEffect file="whoosh.wav" at={9.35} volume={0.3} />
      <SoundEffect file="click.wav" at={9.8} volume={0.16} />
      <SoundEffect file="click.wav" at={10.05} volume={0.16} />
      <SoundEffect file="click.wav" at={10.3} volume={0.16} />
      <SoundEffect file="click.wav" at={10.55} volume={0.16} />
      <SoundEffect file="click.wav" at={10.8} volume={0.16} />
      <SoundEffect file="riser.wav" at={10.9} volume={0.16} />
      <SoundEffect file="impact.wav" at={11.75} volume={0.35} />
      <SoundEffect file="riser.wav" at={13.35} volume={0.24} />
      <SoundEffect file="tick.wav" at={14.2} volume={0.12} />
      <SoundEffect file="tick.wav" at={16.2} volume={0.12} />
      <SoundEffect file="tick.wav" at={18.1} volume={0.12} />
      <SoundEffect file="impact.wav" at={18.55} volume={0.4} />
      <SoundEffect file="whoosh.wav" at={20.75} volume={0.34} />
      <SoundEffect file="bass-hit.wav" at={22.55} volume={0.36} />
      <SoundEffect file="ui-pop.wav" at={24.4} volume={0.18} />
      <SoundEffect file="riser.wav" at={26.6} volume={0.28} />
      <SoundEffect file="impact.wav" at={27.45} volume={0.6} />
      <SoundEffect file="glitch.wav" at={27.6} volume={0.28} />
      <SoundEffect file="reverse-impact.wav" at={29.4} volume={0.3} />
      <SoundEffect file="whoosh.wav" at={30.35} volume={0.3} />
      <SoundEffect file="riser.wav" at={34.4} volume={0.25} />
      <SoundEffect file="impact.wav" at={35.35} volume={0.42} />
      <SoundEffect file="ui-pop.wav" at={36.0} volume={0.18} />
      <SoundEffect file="sweep.wav" at={39.2} volume={0.18} />
    </AbsoluteFill>
  );
}
