import { ScenePlaybackRegion } from './scene-playback-region';

export class Composition {
  public uuid: string;
  public name: string;

  // none or audio
  public syncType = 'audio';

  public audioFileName: string;
  public audioFileInLibrary = false;

  public beatsPerMinute = 120;
  public timeSignatureUpper = 4;
  public timeSignatureLower = 4;

  public snapToGrid = true;

  public tempoGuessed = false;

  // time based or musical
  public gridType = 'musical';
  public gridOffsetMillis = 0;

  // 1/1, 1/2, 1/4, 1/8, etc.
  public gridResolution = 1;

  // if no sync
  public durationMillis = 0;

  // Regions, where the scene will be played
  public scenePlaybackRegions: ScenePlaybackRegion[] = [];

  constructor(data?: any) {
    if (!data) {
      return;
    }

    this.uuid = data.uuid;
    this.name = data.name;
    this.syncType = data.syncType;
    this.audioFileName = data.audioFileName;
    this.audioFileInLibrary = data.audioFileInLibrary;
    this.beatsPerMinute = data.beatsPerMinute;
    this.timeSignatureUpper = data.timeSignatureUpper;
    this.timeSignatureLower = data.timeSignatureLower;
    this.snapToGrid = data.snapToGrid;

    // never guess again (and overwrite), when a composition is loaded
    this.tempoGuessed = true;

    this.gridType = data.gridType;
    this.gridOffsetMillis = data.gridOffsetMillis;
    this.gridResolution = data.gridResolution;
    this.durationMillis = data.durationMillis;

    if (data.scenePlaybackRegions) {
      for (const scenePlaybackRegion of data.scenePlaybackRegions) {
        this.scenePlaybackRegions.push(new ScenePlaybackRegion(scenePlaybackRegion));
      }
    }
  }
}
