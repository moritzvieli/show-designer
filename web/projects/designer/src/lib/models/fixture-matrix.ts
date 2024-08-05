import { FixtureMatrixPixelGroup } from './fixture-matrix-pixel-group';

export class FixtureMatrix {
  pixelKeys: string[][];
  pixelCount: number[] = [];
  pixelGroups: FixtureMatrixPixelGroup[] = [];

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
      for (const pixelGroup of data.pixelGroups) {
        this.pixelGroups.push(new FixtureMatrixPixelGroup(pixelGroup));
      }
    }
  }
}
