import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import * as THREE from 'three';
import { Mesh } from 'three';
import { CachedFixture } from '../../models/cached-fixture';
import { FixtureChannelValue } from '../../models/fixture-channel-value';
import { FixtureService } from '../../services/fixture.service';
import { PreviewMeshService } from '../../services/preview-mesh.service';
import { Fixture3d } from './fixture-3d';
import { PreviewService } from '../../services/preview.service';

export class ColorChanger3d extends Fixture3d {
  private mesh: THREE.Mesh;
  private objectGroup: THREE.Object3D = new THREE.Object3D();

  constructor(
    public fixtureService: FixtureService,
    public previewService: PreviewService,
    previewMeshService: PreviewMeshService,
    fixture: CachedFixture,
    scene: any
  ) {
    super(fixtureService, previewService, fixture, scene, true);

    forkJoin([previewMeshService.getMesh('color-changer')])
      .pipe(
        map(([colorChanger]) => {
          this.mesh = colorChanger;
          this.createObjects();
        })
      )
      .subscribe();
  }

  protected createObjects() {
    super.createObjects();

    this.mesh.material = this.previewService.fixtureMaterial;

    this.objectGroup.add(this.spotlightGroup);
    this.objectGroup.add(this.mesh);
    this.objectGroup.scale.multiplyScalar(9);
    this.scene.add(this.objectGroup);

    this.isLoaded = true;
  }

  public updatePreview(channelValues: FixtureChannelValue[], masterDimmerValue: number): void {
    if (!this.isLoaded) {
      return;
    }

    super.updatePreview(channelValues, masterDimmerValue);
    this.updatePosition(this.objectGroup);

    // Update the material
    if (this.lastSelected !== this.isSelected) {
      if (this.isSelected) {
        for (const child of this.mesh.children) {
          (child as Mesh).material = this.previewService.fixtureSelectedMaterial;
        }
      } else {
        for (const child of this.mesh.children) {
          (child as Mesh).material = this.previewService.fixtureMaterial;
        }
      }

      this.lastSelected = this.isSelected;
    }
  }

  destroy() {
    this.scene.remove(this.objectGroup);
  }
}
