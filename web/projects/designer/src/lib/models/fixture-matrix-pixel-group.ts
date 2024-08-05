import { FixtureMatrixPixelGroupConstraints } from './fixture-matrix-pixel-group-constraints';

export class FixtureMatrixPixelGroup {
  name: string;
  isAll: boolean = false;
  constraints: FixtureMatrixPixelGroupConstraints = null;

  constructor(name: string, isAll: boolean = false, constraints?: any) {
    this.name = name;
    this.isAll = isAll;
    if (constraints) {
      this.constraints = new FixtureMatrixPixelGroupConstraints(constraints);
    }
  }
}
