import { Audio, Sequence, staticFile } from "remotion";
import { FPS } from "./constants";

type Props = {
  file: string;
  at: number;
  volume?: number;
  durationInFrames?: number;
  base?: string;
};

export function SoundEffect({ file, at, volume = 0.3, durationInFrames = 150, base = "hi01/sfx" }: Props) {
  return (
    <Sequence from={Math.round(at * FPS)} durationInFrames={durationInFrames} layout="none">
      <Audio src={staticFile(`${base}/${file}`)} volume={volume} />
    </Sequence>
  );
}
