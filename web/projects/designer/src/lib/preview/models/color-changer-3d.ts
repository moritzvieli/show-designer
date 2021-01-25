import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import * as THREE from 'three';
import { Mesh } from 'three';
import { CachedFixture } from '../../models/cached-fixture';
import { FixtureChannelValue } from '../../models/fixture-channel-value';
import { FixtureService } from '../../services/fixture.service';
import { PreviewMeshService } from '../../services/preview-mesh.service';
import { Fixture3d } from './fixture-3d';

export class ColorChanger3d extends Fixture3d {
  private readonly pointLightMaxIntensity: number = 2;
  private readonly spotLightMaxIntensity: number = 5;

  private mesh: THREE.Mesh;

  private objectGroup: THREE.Object3D = new THREE.Object3D();
  private spotlightGroup: THREE.Object3D = new THREE.Object3D();
  private spotLight: THREE.SpotLight;
  private spotLightHelper: THREE.SpotLightHelper;
  private spotLightBeam: THREE.Mesh;

  private pointLight: THREE.PointLight;

  private lastSelected: boolean;

  private material: THREE.MeshStandardMaterial;
  private atmosphereMaterial: THREE.ShaderMaterial;

  private atmosphereMat() {
    const vertexShader = [
      'varying vec3	vVertexWorldPosition;',
      'varying vec3	vVertexNormal;',

      'void main(){',
      '	vVertexNormal = normalize(normalMatrix * normal);',

      '	vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;',

      '	// set gl_Position',
      '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}',
    ].join('\n');
    const fragmentShader = [
      'uniform vec3	glowColor;',
      'uniform float	coeficient;',
      'uniform float	power;',
      'uniform float	opacity;',

      'varying vec3	vVertexNormal;',
      'varying vec3	vVertexWorldPosition;',

      'void main(){',
      '	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;',
      '	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
      '	viewCameraToVertex	= normalize(viewCameraToVertex);',
      '	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
      '	gl_FragColor		= vec4(glowColor, intensity * opacity);',
      '}',
    ].join('\n');

    // create custom material from the shader code above
    // that is within specially labeled script tags
    const material = new THREE.ShaderMaterial({
      uniforms: {
        coeficient: {
          type: 'f',
          value: 0.3,
        },
        power: {
          type: 'f',
          value: 1.3,
        },
        opacity: {
          type: 'f',
          value: 1.0,
        },
        glowColor: {
          type: 'c',
          value: new THREE.Color('white'),
        },
      },
      vertexShader,
      fragmentShader,
      // blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    return material;
  }

  private createSpotLightBeam() {
    if (this.spotLightBeam) {
      this.spotlightGroup.remove(this.spotLightBeam);
    }

    // TODO update the correct angle from the profile
    const beamAngleDegrees = 14;
    const geometry = new THREE.CylinderGeometry(0.8, beamAngleDegrees * 1.2, 100, 64, 20, false);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -geometry.parameters.height / 2, 0));
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    this.atmosphereMaterial = this.atmosphereMat();
    this.spotLightBeam = new THREE.Mesh(geometry, this.atmosphereMaterial);
    this.spotLightBeam.position.set(0, -0.02, 0);

    this.spotlightGroup.add(this.spotLightBeam);
    this.spotLightBeam.rotation.x = Math.PI / 2;
  }

  private createObjects() {
    (this.material as any) = new THREE.MeshLambertMaterial({
      color: 0x0d0d0d,
      emissive: 0x0d0d0d,
    });

    this.mesh.material = this.material;

    // Add the spotlight
    this.spotLight = new THREE.SpotLight(0xffffff, 1);
    this.spotLight.angle = 0.244;
    this.spotLight.penumbra = 0.5;
    this.spotLight.decay = 2;
    this.spotLight.distance = 60000;
    this.spotLight.castShadow = false;
    this.spotLight.intensity = 10;

    this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
    // scene.add(this.spotLightHelper);

    const spotLightTarget = new THREE.Object3D();
    this.spotLight.target = spotLightTarget;

    this.spotlightGroup.add(this.spotLight);
    this.spotlightGroup.add(spotLightTarget);
    this.spotLight.position.set(0, -1.4, 0);
    spotLightTarget.position.set(0, -10, 0);

    // Add the point light for the surrounding light
    this.pointLight = new THREE.PointLight(0xffffff, 2, 1000);
    this.spotlightGroup.add(this.pointLight);
    this.pointLight.position.set(0, -1.4, 0);

    // Add the light beam
    this.createSpotLightBeam();

    this.objectGroup.add(this.spotlightGroup);
    this.objectGroup.add(this.mesh);

    // A moving head has about 32 cm in width
    this.objectGroup.scale.multiplyScalar(9);

    this.scene.add(this.objectGroup);

    this.isLoaded = true;
  }

  constructor(fixtureService: FixtureService, previewMeshService: PreviewMeshService, fixture: CachedFixture, scene: any) {
    super(fixtureService, fixture, scene);

    forkJoin([previewMeshService.getMesh('color-changer')])
      .pipe(
        map(([colorChanger]) => {
          this.mesh = colorChanger;

          this.createObjects();
        })
      )
      .subscribe();
  }

  public getObject(): THREE.Object3D {
    return this.objectGroup;
  }

  public updatePreview(channelValues: FixtureChannelValue[], masterDimmerValue: number): void {
    super.updatePreview(channelValues, masterDimmerValue);

    if (!this.isLoaded) {
      return;
    }

    this.updatePosition(this.objectGroup);

    // Update the material
    if (this.lastSelected !== this.isSelected) {
      if (this.isSelected) {
        for (const child of this.mesh.children) {
          (child as Mesh).material = this.selectedMaterial;
        }
      } else {
        for (const child of this.mesh.children) {
          (child as Mesh).material = this.material;
        }
      }

      this.lastSelected = this.isSelected;
    }

    // Update the light helpers
    this.spotLightHelper.update();

    // Apply the colors
    const color = new THREE.Color('rgb(' + this.colorRed + ', ' + this.colorGreen + ', ' + this.colorBlue + ')');

    this.pointLight.color = color;

    this.spotLight.color = color;
    (this.spotLightBeam.material as any).uniforms.glowColor.value = color;

    // Apply the dimmer value
    // Take the color into account for the beam (don't show a black beam)
    const intensityColor = Math.max(this.colorRed, this.colorGreen, this.colorBlue);
    (this.spotLightBeam.material as any).uniforms.opacity.value = Math.min(intensityColor, this.dimmer) * 0.5;

    this.spotLight.intensity = this.spotLightMaxIntensity * this.dimmer;
    this.pointLight.intensity = this.pointLightMaxIntensity * this.dimmer;
  }

  destroy() {
    this.scene.remove(this.objectGroup);
    this.material.dispose();
    this.atmosphereMaterial.dispose();
  }
}
