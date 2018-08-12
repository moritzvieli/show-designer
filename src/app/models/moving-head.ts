import { Fixture } from './fixture';
import * as THREE from 'three';

export class MovingHead implements Fixture {
    private headGroup: THREE.Object3D = new THREE.Object3D();
    private armGroup: THREE.Object3D = new THREE.Object3D();
    private objectGroup: THREE.Object3D = new THREE.Object3D();
    private spotLight: THREE.SpotLight;
    private spotLightHelper: THREE.SpotLightHelper;
    private shadowCameraHelper: THREE.CameraHelper;

    pan: number = 0;
    tilt: number = 0;

    positionX: number = 0;
    positionY: number = 0;
    positionZ: number = 0;

    // TODO add color, gobo, etc.

    constructor(scene: THREE.scene, socket: THREE.Mesh, arm: THREE.Mesh, head: THREE.Mesh) {
        // TODO
        let path = './assets/textures/SwedishRoyalCastle/';
        let format = '.jpg';
        let urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];

        var reflectionCube = new THREE.CubeTextureLoader().load(urls);

        let material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.07,
            metalness: 1,
            envMap: reflectionCube,
            envMapIntensity: 1.4
        });

        socket.material = material;
        arm.material = material;
        head.material = material;

        // Add the head
        head.scale.multiplyScalar(0.9)
        let headPivotGroup = new THREE.Object3D();
        headPivotGroup.add(head);
        this.headGroup.add(headPivotGroup);

        // Add the spotlight
        let spotlightGroup = new THREE.Object3D();

        this.spotLight = new THREE.SpotLight(0xffffff, 1);
        this.spotLight.angle = 0.13; //Math.PI / 4;
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

        spotlightGroup.add(this.spotLight);
        spotlightGroup.add(spotLightTarget);
        this.spotLight.position.set(0, -1.4, 0);
        spotLightTarget.position.set(0, -10, 0);

        // Add the light beam
        let geometry = new THREE.CylinderGeometry(0.1, 10, 100, 32 * 2, 20, true);

        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -geometry.parameters.height / 2, 0));
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

        let vertexShader = [
            'varying vec3 vNormal;',
            'varying vec3 vWorldPosition;',

            'void main(){',
            '// compute intensity',
            'vNormal		= normalize( normalMatrix * normal );',

            'vec4 worldPosition	= modelMatrix * vec4( position, 1.0 );',
            'vWorldPosition		= worldPosition.xyz;',

            '// set gl_Position',
            'gl_Position	= projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}',
        ].join('\n');

        let fragmentShader = [
            'varying vec3		vNormal;',
            'varying vec3		vWorldPosition;',

            'uniform vec3		lightColor;',

            'uniform vec3		spotPosition;',

            'uniform float		attenuation;',
            'uniform float		anglePower;',

            'void main(){',
            'float intensity;',

            //////////////////////////////////////////////////////////
            // distance attenuation					//
            //////////////////////////////////////////////////////////
            'intensity	= distance(vWorldPosition, spotPosition)/attenuation;',
            'intensity	= 1.0 - clamp(intensity, 0.0, 1.0);',

            //////////////////////////////////////////////////////////
            // intensity on angle					//
            //////////////////////////////////////////////////////////
            'vec3 normal	= vec3(vNormal.x, vNormal.y, abs(vNormal.z));',
            'float angleIntensity	= pow( dot(normal, vec3(0.0, 0.0, 1.0)), anglePower );',
            'intensity	= intensity * angleIntensity;',
            // 'gl_FragColor	= vec4( lightColor, intensity );',

            //////////////////////////////////////////////////////////
            // final color						//
            //////////////////////////////////////////////////////////

            // set the final color
            'gl_FragColor	= vec4( lightColor, intensity);',
            '}',
        ].join('\n');

        let spotLightBeamMaterial = new THREE.ShaderMaterial({
            uniforms: {
                attenuation: {
                    type: "f",
                    value: 20.0
                },
                anglePower: {
                    type: "f",
                    value: 1
                },
                spotPosition: {
                    type: "v3",
                    value: new THREE.Vector3(0, 0, 0)
                },
                lightColor: {
                    type: "c",
                    value: new THREE.Color('cyan')
                },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.DoubleSide,
            blending	: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });
        spotLightBeamMaterial.uniforms.lightColor.value.set('white')

        let spotLightBeam: THREE.Mesh;
        spotLightBeam = new THREE.Mesh(geometry, spotLightBeamMaterial);
        spotLightBeam.position.copy(this.spotLight.position);
        spotLightBeam.position.set(0, -0.02, 0);

        spotlightGroup.add(spotLightBeam);
        spotLightBeam.rotation.x = Math.PI / 2;

        //spotlightGroup.rotation.x = Math.PI / 2;

        this.headGroup.add(spotlightGroup);
        //spotlightGroup.position.set(0, -15, 0);

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

    public update() {
        this.objectGroup.position.set(this.positionX, this.positionY, this.positionZ);
        this.armGroup.rotation.y = this.pan;
        this.headGroup.rotation.x = this.tilt + 0;

        this.spotLightHelper.update();
        this.shadowCameraHelper.update();
    }
}
