import { FixtureMatrixPixelGroup } from './fixture-matrix-pixel-group';

export class FixtureMatrix {
  pixelKeys: string[][];
  pixelCount: number[] = [];
  pixelGroups: any = {};

  constructor(data?: any) {
    if (!data) {
      return;
    }

    if (data.pixelKeys) {
      this.pixelKeys = data.pixelKeys;
    }
    if (data.pixelCount) {
      for (const pixelCountEntry of data.pixelCount) {
        this.pixelCount.push(pixelCountEntry);
      }
    }
    if (data.pixelGroups) {
      for (const property of Object.keys(data.pixelGroups)) {
        const pixelGroup = new FixtureMatrixPixelGroup(data.pixelGroups[property]);
        this.pixelGroups[property] = pixelGroup;
      }
    }
  }
}
