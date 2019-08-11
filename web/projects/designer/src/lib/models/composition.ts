import { ScenePlaybackRegion } from "./scene-playback-region";

export class Composition {

    public uuid: string;
    public name: string;

    // none or audio
    public syncType: string = 'audio';

    public audioFileName: string;
    public audioFileInLibrary: boolean = false;

    public beatsPerMinute: number = 120;
    public timeSignatureUpper: number = 4;
    public timeSignatureLower: number = 4;

    public snapToGrid: boolean = true;

    // time based or musical
    public gridType: string = 'musical';
    public gridOffsetMillis: number = 0;

    // 1/1, 1/2, 1/4, 1/8, etc.
    public gridResolution: number = 1;

    // if no sync
    public durationMillis: number = 0;

    // Regions, where the scene will be played
    public scenePlaybackRegions: ScenePlaybackRegion[] = [];

    constructor(data?: any) {
        if(!data) {
            return;
        }

        // TODO
    }

}
