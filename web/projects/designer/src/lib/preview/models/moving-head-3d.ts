import { Fixture3d } from './fixture-3d';
import * as THREE from 'three';
import { Positioning, Fixture } from '../../models/fixture';
import { FixtureCapabilityValue } from '../../models/fixture-capability-value';
import { FixtureCapabilityType } from '../../models/fixture-capability';
import { forkJoin } from 'rxjs';
import { PreviewMeshService } from '../../services/preview-mesh.service';
import { map } from 'rxjs/operators';
import { FixtureService } from '../../services/fixture.service';
import { FixtureChannelValue } from '../../models/fixture-channel-value';

export class MovingHead3d extends Fixture3d {

    private readonly pointLightMaxIntensity: number = 2;
    private readonly spotLightLightMaxIntensity: number = 10;

    private pan: number;
    private tilt: number;

    private socket: THREE.Mesh;
    private arm: THREE.Mesh;
    private head: THREE.Mesh;

    private headGroup: THREE.Object3D = new THREE.Object3D();
    private spotlightGroup: THREE.Object3D = new THREE.Object3D();
    private armGroup: THREE.Object3D = new THREE.Object3D();
    private objectGroup: THREE.Object3D = new THREE.Object3D();
    private spotLight: THREE.SpotLight;
    private spotLightHelper: THREE.SpotLightHelper;
    private spotLightBeam: THREE.Mesh;

    private pointLight: THREE.PointLight;

    private lastBeamAngleDegrees: number;
    private lastSelected: boolean;

    private material: THREE.MeshStandardMaterial;

    private atmosphereMat() {
        var vertexShader = [
            'varying vec3	vVertexWorldPosition;',
            'varying vec3	vVertexNormal;',

            'void main(){',
            '	vVertexNormal = normalize(normalMatrix * normal);',

            '	vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;',

            '	// set gl_Position',
            '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            '}',

        ].join('\n')
        var fragmentShader = [
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
        ].join('\n')

        // create custom material from the shader code above
        // that is within specially labeled script tags
        var material = new THREE.ShaderMaterial({
            uniforms: {
                coeficient: {
                    type: 'f',
                    value: 0.3
                },
                power: {
                    type: 'f',
                    value: 1.3
                },
                opacity: {
                    type: 'f',
                    value: 1.0
                },
                glowColor: {
                    type: 'c',
                    value: new THREE.Color('white')
                }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            //blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: true
        });

        return material;
    }

    private createSpotLightBeam() {
        if (this.spotLightBeam) {
            this.spotlightGroup.remove(this.spotLightBeam);
        }

        // TODO update the correct angle from the template
        let beamAngleDegrees = 14;
        let geometry = new THREE.CylinderGeometry(0.1, beamAngleDegrees * 1.2, 100, 64, 20, false);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -geometry.parameters.height / 2, 0));
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

        //var zrak_mat = new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, opacity: 0.1 });

        this.spotLightBeam = new THREE.Mesh(geometry, this.atmosphereMat());
        this.spotLightBeam.position.set(0, -0.02, 0);

        this.spotlightGroup.add(this.spotLightBeam);
        this.spotLightBeam.rotation.x = Math.PI / 2;
    }

    private createObjects() {
        // TODO
        // let path = './assets/textures/SwedishRoyalCastle/';
        // let format = '.jpg';
        // let urls = [
        //     path + 'px' + format, path + 'nx' + format,
        //     path + 'py' + format, path + 'ny' + format,
        //     path + 'pz' + format, path + 'nz' + format
        // ];

        // var reflectionCube = new THREE.CubeTextureLoader().load(urls);

        // this.material = new THREE.MeshStandardMaterial({
        //     color: 0xffffff,
        //     roughness: 0.07,
        //     metalness: 1,
        //     envMap: reflectionCube,
        //     envMapIntensity: 1.4
        // });

        (<any>this.material) = new THREE.MeshLambertMaterial({
            color: 0x0d0d0d,
            emissive: 0x0d0d0d
        });

        this.socket.material = this.material;
        this.arm.material = this.material;
        this.head.material = this.material;

        // Add the head
        this.head.scale.multiplyScalar(0.9);
        this.head.position.set(-0.1, 0, 0);
        let headPivotGroup = new THREE.Object3D();
        headPivotGroup.add(this.head);
        this.headGroup.add(headPivotGroup);

        // Add the spotlight
        this.spotLight = new THREE.SpotLight(0xffffff, 1);
        this.spotLight.angle = 0.244;
        this.spotLight.penumbra = 0.5;
        this.spotLight.decay = 2;
        this.spotLight.distance = 60000;
        this.spotLight.castShadow = false;
        this.spotLight.intensity = 10;

        this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
        //scene.add(this.spotLightHelper);

        let spotLightTarget = new THREE.Object3D();
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

        this.headGroup.add(this.spotlightGroup);

        // Add the arm
        this.armGroup.add(this.headGroup);
        this.headGroup.position.set(0, -0.6, 0);
        this.armGroup.add(this.arm);

        // Add the socket
        this.objectGroup.add(this.armGroup);
        this.objectGroup.add(this.socket);
        this.socket.position.set(0, 1.2, 0);

        // A moving head has about 32 cm in width
        this.objectGroup.scale.multiplyScalar(9);

        this.scene.add(this.objectGroup);

        this.isLoaded = true;
    }

    constructor(fixtureService: FixtureService, previewMeshService: PreviewMeshService, fixture: Fixture, scene: any) {
        super(fixtureService, fixture, scene);

        forkJoin(
            previewMeshService.getMesh('moving_head_socket'),
            previewMeshService.getMesh('moving_head_arm'),
            previewMeshService.getMesh('moving_head_head')
        ).pipe(map(([socket, arm, head]) => {
            this.socket = socket;
            this.arm = arm;
            this.head = head;

            this.createObjects();
        })).subscribe();
    }

    public getObject(): THREE.Object3D {
        return this.objectGroup;
    }

    public updatePreview(channelValues: FixtureChannelValue[], masterDimmerValue: number): void {
        super.updatePreview(channelValues, masterDimmerValue);

        if (!this.isLoaded) {
            return;
        }

        // Apply default settings
        let panStart: number;
        let panEnd: number;

        let tiltStart: number;
        let tiltEnd: number;

        this.pan = 0;
        this.tilt = 0;

        // Apply the known property values
        for (let channelValue of channelValues) {
            let capability = this.fixtureService.getCapabilityInValue(channelValue.channelName, channelValue.fixtureTemplateUuid, channelValue.value);
            let channel = this.fixtureService.getChannelByName(channelValue.channelName, this.fixture);

            if (capability) {
                switch (capability.type) {
                    case FixtureCapabilityType.Pan: {
                        panStart = this.fixtureService.getRotationAngleDeg(capability.angleStart) || 0;
                        panEnd = this.fixtureService.getRotationAngleDeg(capability.angleEnd) || 540;
                        this.pan = channelValue.value / this.fixtureService.getMaxValueByChannel(channel.fixtureChannel);
                        break;
                    }
                    case FixtureCapabilityType.Tilt: {
                        tiltStart = this.fixtureService.getRotationAngleDeg(capability.angleStart) || 0;
                        tiltEnd = this.fixtureService.getRotationAngleDeg(capability.angleEnd) || 2700;
                        this.tilt = channelValue.value / this.fixtureService.getMaxValueByChannel(channel.fixtureChannel);
                        break;
                    }
                }
            }
        }

        // Update the position
        switch (this.fixture.positioning) {
            case Positioning.topFront: {
                this.objectGroup.rotation.x = THREE.Math.degToRad(0);
                this.objectGroup.position.set(this.fixture.positionX, this.fixture.positionY - 13, this.fixture.positionZ);
                break;
            }
            case Positioning.bottomFront: {
                this.objectGroup.rotation.x = THREE.Math.degToRad(180);
                this.objectGroup.position.set(this.fixture.positionX, this.fixture.positionY + 13, this.fixture.positionZ);
                break;
            }
            case Positioning.topBack: {
                this.objectGroup.rotation.x = THREE.Math.degToRad(0);
                this.objectGroup.position.set(this.fixture.positionX, this.fixture.positionY - 13, this.fixture.positionZ);
                break;
            }
            case Positioning.bottomBack: {
                this.objectGroup.rotation.x = THREE.Math.degToRad(180);
                this.objectGroup.position.set(this.fixture.positionX, this.fixture.positionY + 13, this.fixture.positionZ);
                break;
            }
        }

        // calculate the y/x rotation in radiants based on pan/tilt (0-1) respecting the max pan/tilt
        this.armGroup.rotation.y = THREE.Math.degToRad(panEnd * this.pan + panStart) - THREE.Math.degToRad(panEnd / 2);
        this.headGroup.rotation.x = THREE.Math.degToRad(tiltEnd * this.tilt + tiltStart) - THREE.Math.degToRad(tiltEnd / 2);

        // Update the angle (only on change, because it's expensive)
        // TODO update the correct angle from the template
        let beamAngleDregrees = 14;
        if (this.lastBeamAngleDegrees != beamAngleDregrees) {
            this.spotLight.angle = THREE.Math.degToRad(beamAngleDregrees);
            this.createSpotLightBeam();
            this.lastBeamAngleDegrees = beamAngleDregrees;
        }

        // Update the material
        if (this.lastSelected != this.isSelected) {
            if (this.isSelected) {
                this.socket.material = this.selectedMaterial;
                this.arm.material = this.selectedMaterial;
                this.head.material = this.selectedMaterial;
            } else {
                this.socket.material = this.material;
                this.arm.material = this.material;
                this.head.material = this.material;
            }

            this.lastSelected = this.isSelected;
        }

        // Update the light helpers
        this.spotLightHelper.update();

        // Apply the colors
        var color = new THREE.Color("rgb(" + this.colorRed + ", " + this.colorGreen + ", " + this.colorBlue + ")");

        this.pointLight.color = color;

        this.spotLight.color = color;
        (<any>this.spotLightBeam.material).uniforms.glowColor.value = color;

        // Apply the dimmer value
        // Take the color into account for the beam (don't show a black beam)
        let intensityColor = Math.max(this.colorRed, this.colorGreen, this.colorBlue);
        (<any>this.spotLightBeam.material).uniforms.opacity.value = Math.min(intensityColor, this.dimmer);

        this.spotLight.intensity = this.spotLightLightMaxIntensity * this.dimmer;
        this.pointLight.intensity = this.pointLightMaxIntensity * this.dimmer;

        // this.spotLightBeam.material.uniforms.viewVector.value =
        //     new THREE.Vector3().subVectors(this.camera.position, this.spotLightBeam.position);
    }

    destroy() {
        this.scene.remove(this.objectGroup);
    }

}
