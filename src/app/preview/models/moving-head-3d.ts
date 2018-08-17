import { Fixture } from './../../models/fixture';
import { MovingHeadChannel } from '../../models/moving-head';
import { IFixture3d } from './i-fixture-3d';
import { MovingHead } from '../../models/moving-head';
import * as THREE from 'three';
import { Positioning } from '../../models/fixture';

export class MovingHead3d implements IFixture3d {
    movingHead: MovingHead;

    private scene: THREE.scene;

    private socket: THREE.Mesh;
    private arm: THREE.Mesh;
    private head: THREE.Mesh;

    private headGroup: THREE.Object3D = new THREE.Object3D();
    private spotlightGroup: THREE.Object3D = new THREE.Object3D();
    private armGroup: THREE.Object3D = new THREE.Object3D();
    private objectGroup: THREE.Object3D = new THREE.Object3D();
    private spotLight: THREE.SpotLight;
    private spotLightHelper: THREE.SpotLightHelper;
    private shadowCameraHelper: THREE.CameraHelper;
    private spotLightBeam: THREE.Mesh;

    private lastBeamAngleDegrees: number;
    private lastSelected: boolean;

    private material: THREE.MeshStandardMaterial;
    private selectedMaterial: THREE.MeshLambertMaterial;

    private atmosphereMat() {
        var vertexShader = [
            'varying vec3	vVertexWorldPosition;',
            'varying vec3	vVertexNormal;',

            'void main(){',
            '	vVertexNormal	= normalize(normalMatrix * normal);',

            '	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;',

            '	// set gl_Position',
            '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            '}',

        ].join('\n')
        var fragmentShader = [
            'uniform vec3	glowColor;',
            'uniform float	coeficient;',
            'uniform float	power;',

            'varying vec3	vVertexNormal;',
            'varying vec3	vVertexWorldPosition;',

            'void main(){',
            '	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;',
            '	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
            '	viewCameraToVertex	= normalize(viewCameraToVertex);',
            '	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
            '	gl_FragColor		= vec4(glowColor, intensity);',
            '}',
        ].join('\n')

        // create custom material from the shader code above
        //   that is within specially labeled script tags
        var material = new THREE.ShaderMaterial({
            uniforms: {
                coeficient: {
                    type: "f",
                    value: 0.3
                },
                power: {
                    type: "f",
                    value: 1.3
                },
                glowColor: {
                    type: "c",
                    value: new THREE.Color('white')
                },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            //blending	: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: true,
        });

        return material;
    }

    private createSpotLightBeam() {
        if (this.spotLightBeam) {
            this.spotlightGroup.remove(this.spotLightBeam);
        }

        let geometry = new THREE.CylinderGeometry(0.1, this.movingHead.beamAngleDegrees * 1.2, 100, 64, 20, false);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -geometry.parameters.height / 2, 0));
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

        //var zrak_mat = new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, opacity: 0.1 });

        this.spotLightBeam = new THREE.Mesh(geometry, this.atmosphereMat());
        this.spotLightBeam.position.set(0, -0.02, 0);

        this.spotlightGroup.add(this.spotLightBeam);
        this.spotLightBeam.rotation.x = Math.PI / 2;
    }

    constructor(movingHead: MovingHead, scene: THREE.scene, camera: THREE.camera, socket: THREE.Mesh, arm: THREE.Mesh, head: THREE.Mesh) {
        this.movingHead = movingHead;
        this.scene = scene;
        this.socket = socket;
        this.arm = arm;
        this.head = head;

        // TODO
        let path = './assets/textures/SwedishRoyalCastle/';
        let format = '.jpg';
        let urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];

        var reflectionCube = new THREE.CubeTextureLoader().load(urls);

        this.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.07,
            metalness: 1,
            envMap: reflectionCube,
            envMapIntensity: 1.4
        });

        this.selectedMaterial = new THREE.MeshLambertMaterial({
            color: 0xff00ff,
            emissive: 0xff00ff
        });

        socket.material = this.material;
        arm.material = this.material;
        head.material = this.material;

        // Add the head
        head.scale.multiplyScalar(0.9)
        let headPivotGroup = new THREE.Object3D();
        headPivotGroup.add(head);
        this.headGroup.add(headPivotGroup);

        // Add the spotlight
        this.spotLight = new THREE.SpotLight(0xffffff, 1);
        this.spotLight.angle = 0.244;;
        this.spotLight.penumbra = 0.5;
        this.spotLight.decay = 2;
        this.spotLight.distance = 200;
        this.spotLight.castShadow = true;
        this.spotLight.shadow.mapSize.width = 1024;
        this.spotLight.shadow.mapSize.height = 1024;
        this.spotLight.shadow.camera.near = 10;
        this.spotLight.shadow.camera.far = 200;
        this.spotLight.intensity = 3;

        this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
        //scene.add(this.spotLightHelper);

        this.shadowCameraHelper = new THREE.CameraHelper(this.spotLight.shadow.camera);
        //scene.add(this.shadowCameraHelper);

        let spotLightTarget = new THREE.Object3D();
        this.spotLight.target = spotLightTarget;

        this.spotlightGroup.add(this.spotLight);
        this.spotlightGroup.add(spotLightTarget);
        this.spotLight.position.set(0, -1.4, 0);
        spotLightTarget.position.set(0, -10, 0);

        // Add the light beam
        this.createSpotLightBeam();

        this.headGroup.add(this.spotlightGroup);

        // Add the arm
        this.armGroup.add(this.headGroup);
        this.headGroup.position.set(0, -0.6, 0);
        this.armGroup.add(arm);
        arm.rotation.x = - Math.PI / 2;

        // Add the socket
        this.objectGroup.add(this.armGroup);
        this.objectGroup.add(socket);
        socket.position.set(0, 1.2, 0);

        scene.add(this.objectGroup);
    }

    public getObject(): THREE.Object3D {
        return this.objectGroup;
    }

    public update(timeMillis: number, fixtureIndex: number) {
        // Process the effects
        this.movingHead.effectMappings.forEach(effectMapping => {
            let value = effectMapping.effect.getValueAtMillis(timeMillis, fixtureIndex);

            effectMapping.channels.forEach(channel => {
                switch (channel) {
                    case MovingHeadChannel.colorR: {
                        this.movingHead.colorR = Math.round(value);
                        break;
                    }
                    case MovingHeadChannel.colorG: {
                        this.movingHead.colorG = Math.round(value);
                        break;
                    }
                    case MovingHeadChannel.colorB: {
                        this.movingHead.colorB = Math.round(value);
                        break;
                    }
                    case MovingHeadChannel.pan: {
                        this.movingHead.pan = value;
                        break;
                    }
                    case MovingHeadChannel.tilt: {
                        this.movingHead.tilt = value;
                        break;
                    }
                }
            });
        });

        // Update the position
        this.objectGroup.position.set(this.movingHead.positionX, this.movingHead.positionY, this.movingHead.positionZ);

        // Calculate the y/x rotation in radiants based on pan/tilt (0-255) respecting the max pan/tilt
        this.armGroup.rotation.y = THREE.Math.degToRad(this.movingHead.maxPanDegrees * this.movingHead.pan / 255) - THREE.Math.degToRad(this.movingHead.maxPanDegrees / 2);
        this.headGroup.rotation.x = THREE.Math.degToRad(this.movingHead.maxTiltDegrees * this.movingHead.tilt / 255) - THREE.Math.degToRad(this.movingHead.maxTiltDegrees / 2);

        // Update the angle (only on change, because it's expensive)
        if (this.lastBeamAngleDegrees != this.movingHead.beamAngleDegrees) {
            this.spotLight.angle = THREE.Math.degToRad(this.movingHead.beamAngleDegrees);
            this.createSpotLightBeam();
            this.lastBeamAngleDegrees = this.movingHead.beamAngleDegrees;
        }

        // Update the material
        if(this.lastSelected != this.movingHead.isSelected) {
            if (this.movingHead.isSelected) {
                this.socket.material = this.selectedMaterial;
                this.arm.material = this.selectedMaterial;
                this.head.material = this.selectedMaterial;
            } else {
                this.socket.material = this.material;
                this.arm.material = this.material;
                this.head.material = this.material;
            }

            this.lastSelected = this.movingHead.isSelected;
        }

        // Update the light helpers
        this.spotLightHelper.update();
        this.shadowCameraHelper.update();

        var color = new THREE.Color("rgb(" + this.movingHead.colorR + ", " + this.movingHead.colorG + ", " + this.movingHead.colorB + ")");

        this.spotLight.color = color;
        //this.spotLightBeam.material.color = color;
        this.spotLightBeam.material.uniforms.glowColor.value = color;

        // this.spotLightBeam.material.uniforms.viewVector.value =
        //     new THREE.Vector3().subVectors(this.camera.position, this.spotLightBeam.position);
    }
}
