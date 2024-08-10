import { FixtureMatrixPixelGroupConstraints } from './fixture-matrix-pixel-group-constraints';

export class FixtureMatrixPixelGroup {
  isAll: boolean = false;
  constraints: FixtureMatrixPixelGroupConstraints = null;

  constructor(isAll: boolean = false, constraints?: any) {
    this.isAll = isAll;
    if (constraints) {
      this.constraints = new FixtureMatrixPixelGroupConstraints(constraints);
    }
  }
}
