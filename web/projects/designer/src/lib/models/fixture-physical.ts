export class FixturePhysical {
  dimensions: number[] = [];

  constructor(data?: any) {
    if (!data) {
      return;
    }

    if (data.dimensions) {
      for (const dimension of data.dimensions) {
        this.dimensions.push(dimension);
      }
    }
  }
}
