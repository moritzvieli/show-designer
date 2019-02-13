import { Effect } from "./effect";
import { SceneFixtureProperties } from "./scene-fixture-properties";
import { ScenePlaybackRegion } from "./scene-playback-region";

export class Scene {

    uid: string;
    name: string;
    position: number;
    effects: Effect[] = [];
    sceneFixturePropertiesList: SceneFixtureProperties[] = [];
    scenePlaybackRegionList: ScenePlaybackRegion[] = [];
    fadeInMillis: number = 2000;
    fadeOutMillis: number = 2000;

    isSelected: boolean;

}
