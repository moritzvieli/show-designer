import { Effect } from "./effect";
import { SceneFixtureProperties } from "./scene-fixture-properties";

export class Scene {

    uid: string;
    name: string;
    position: number;
    effects: Effect[] = [];
    sceneFixturePropertiesList: SceneFixtureProperties[] = []; 

}
