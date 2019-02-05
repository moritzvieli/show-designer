import { Effect } from "./effect";
import { SceneFixtureSettings } from "./scene-fixture-settings";

export class Scene {

    uid: string;
    name: string;
    position: number;
    effects: Effect[] = [];
    sceneFixtureSettingsList: SceneFixtureSettings[] = []; 

}
