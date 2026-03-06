import React from "react";
import { Composition, Sequence } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { LandingScene } from "./scenes/LandingScene";
import { MapScene } from "./scenes/MapScene";
import { ReportScene } from "./scenes/ReportScene";
import { DeployScene } from "./scenes/DeployScene";
import { EchoingScene } from "./scenes/EchoingScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { TechStackScene } from "./scenes/TechStackScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { FPS, VIDEO_WIDTH, VIDEO_HEIGHT } from "./theme";

/* ── Scene durations in seconds ── */
const SCENES = [
    { id: "hook", Component: HookScene, duration: 15 },
    { id: "landing", Component: LandingScene, duration: 25 },
    { id: "map", Component: MapScene, duration: 40 },
    { id: "report", Component: ReportScene, duration: 40 },
    { id: "deploy", Component: DeployScene, duration: 40 },
    { id: "echoing", Component: EchoingScene, duration: 20 },
    { id: "features", Component: FeaturesScene, duration: 50 },
    { id: "techStack", Component: TechStackScene, duration: 15 },
    { id: "closing", Component: ClosingScene, duration: 15 },
] as const;

const TOTAL_DURATION = SCENES.reduce((sum, s) => sum + s.duration, 0);

/* ── Full Demo Composition ── */
const CivicEchoDemo: React.FC = () => {
    let offset = 0;
    return (
        <>
            {SCENES.map((scene) => {
                const from = offset * FPS;
                const durationInFrames = scene.duration * FPS;
                offset += scene.duration;
                return (
                    <Sequence key={scene.id} from={from} durationInFrames={durationInFrames} name={scene.id}>
                        <scene.Component />
                    </Sequence>
                );
            })}
        </>
    );
};

/* ── Remotion Root ── */
export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* Full video composition */}
            <Composition
                id="CivicEchoDemo"
                component={CivicEchoDemo}
                durationInFrames={TOTAL_DURATION * FPS}
                fps={FPS}
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
            />

            {/* Individual scene previews for development */}
            {SCENES.map((scene) => (
                <Composition
                    key={scene.id}
                    id={scene.id}
                    component={scene.Component}
                    durationInFrames={scene.duration * FPS}
                    fps={FPS}
                    width={VIDEO_WIDTH}
                    height={VIDEO_HEIGHT}
                />
            ))}
        </>
    );
};
