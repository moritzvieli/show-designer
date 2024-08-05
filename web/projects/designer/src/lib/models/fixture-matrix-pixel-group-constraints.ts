export class FixtureMatrixPixelGroupConstraints {
  // constraint the pixel keys directly
  keys: string[] = [];

  // constraints by coordinates
  x: string[] = [];
  y: string[] = [];
  z: string[] = [];

  // a name regexp-constraint
  name: string[] = [];

  constructor(data?: any) {
    if (!data) {
      return;
    }

    if (Array.isArray(data)) {
      // an array of pixel keys
      this.keys = data;
    } else {
      // an object of constraints
      this.x = data.x;
      this.y = data.y;
      this.z = data.z;
      this.name = data.name;
    }
  }
}
