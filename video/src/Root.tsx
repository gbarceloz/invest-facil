import { Composition } from "remotion";
import { InvestFacilHighImpact01 } from "./high-impact/InvestFacilHighImpact01";
import { InvestFacilLab } from "./InvestFacilLab";
import { InvestFacilLabV2 } from "./InvestFacilLabV2";
import { InvestFacilV01 } from "./variants/v01/V01";
import { InvestFacilV02, V02Duration } from "./variants/v02/V02";
import { InvestFacilV03, V03Duration } from "./variants/v03/V03";
import { InvestFacilV04, V04Duration } from "./variants/v04/V04";
import { InvestFacilV05, V05Duration } from "./variants/v05/V05";
import { InvestFacilV06, V06Duration } from "./variants/v06/V06";
import { InvestFacilV07, V07Duration } from "./variants/v07/V07";
import { InvestFacilV08, V08Duration } from "./variants/v08/V08";
import { InvestFacilV09, V09Duration } from "./variants/v09/V09";
import { InvestFacilV10, V10Duration } from "./variants/v10/V10";
import "./styles.css";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="InvestFacilLab"
        component={InvestFacilLab}
        durationInFrames={570}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="InvestFacilLabV2"
        component={InvestFacilLabV2}
        durationInFrames={570}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ showGuides: false, showCaptions: false }}
      />
      <Composition
        id="InvestFacilLabV2CC"
        component={InvestFacilLabV2}
        durationInFrames={570}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ showGuides: false, showCaptions: true }}
      />
      <Composition
        id="InvestFacilLabV2Guides"
        component={InvestFacilLabV2}
        durationInFrames={570}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ showGuides: true, showCaptions: true }}
      />
      <Composition
        id="InvestFacilHighImpact01"
        component={InvestFacilHighImpact01}
        durationInFrames={1200}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="InvestFacilV01"
        component={InvestFacilV01}
        durationInFrames={1020}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition id="InvestFacilV02" component={InvestFacilV02} durationInFrames={V02Duration} fps={30} width={1080} height={1920} />
      <Composition id="InvestFacilV03" component={InvestFacilV03} durationInFrames={V03Duration} fps={30} width={1080} height={1920} />
      <Composition id="InvestFacilV04" component={InvestFacilV04} durationInFrames={V04Duration} fps={30} width={1080} height={1920} />
      <Composition id="InvestFacilV05" component={InvestFacilV05} durationInFrames={V05Duration} fps={30} width={1080} height={1920} />
      <Composition id="InvestFacilV06" component={InvestFacilV06} durationInFrames={V06Duration} fps={30} width={1080} height={1920} />
      <Composition id="InvestFacilV07" component={InvestFacilV07} durationInFrames={V07Duration} fps={30} width={1080} height={1920} />
      <Composition id="InvestFacilV08" component={InvestFacilV08} durationInFrames={V08Duration} fps={30} width={1080} height={1920} />
      <Composition id="InvestFacilV09" component={InvestFacilV09} durationInFrames={V09Duration} fps={30} width={1080} height={1920} />
      <Composition id="InvestFacilV10" component={InvestFacilV10} durationInFrames={V10Duration} fps={30} width={1080} height={1920} />
    </>
  );
};
