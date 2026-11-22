import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");

// Optional override for environments where Edge/Chromium is not auto-detected.
// When absent, Remotion keeps its default browser resolution.
const browserExecutable = process.env.INVESTFACIL_EDGE_EXECUTABLE_PATH;
if (browserExecutable) {
  Config.setBrowserExecutable(browserExecutable);
}
