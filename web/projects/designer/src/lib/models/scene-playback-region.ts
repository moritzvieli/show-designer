export class ScenePlaybackRegion {
  sceneUuid: string;
  startMillis: number;
  endMillis: number;

  constructor(data?: any) {
    if (!data) {
      return;
    }

    this.sceneUuid = data.sceneUuid;
    this.startMillis = data.startMillis;
    this.endMillis = data.endMillis;
  }
}
