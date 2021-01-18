import { FixtureCapabilityType, FixtureCapabilityColor } from "../../models/fixture-capability";
import * as THREE from 'three';
import { FixtureService } from "../../services/fixture.service";
import { FixtureChannelValue } from "../../models/fixture-channel-value";
import { CachedFixture } from "../../models/cached-fixture";
import { CachedFixtureCapability } from "../../models/cached-fixture-capability";
import { CachedFixtureChannel } from "../../models/cached-fixture-channel";
import { Positioning } from '../../models/fixture';

export abstract class Fixture3d {

    fixture: CachedFixture;
    fixtureHasDimmer: boolean = false;
    fixtureHasColorWheel: boolean = false;
    fixtureHasColor: boolean = false;

    scene: any;

    colorRed: number;
    colorGreen: number;
    colorBlue: number;

    dimmer: number = 0;

    isSelected: boolean = false;
    isLoaded: boolean = false;

    protected selectedMaterial: THREE.MeshLambertMaterial;

    constructor(
        public fixtureService: FixtureService,
        fixture: CachedFixture,
        scene: any
    ) {
        this.fixture = fixture;
        this.scene = scene;

        // TODO Don't create it for each fixture but pass it from the preview service
        this.selectedMaterial = new THREE.MeshLambertMaterial({
            color: 0xff00ff,
            emissive: 0xff00ff
        });

        // evaluate, various capabilities of this fixture
        for (let cachedChannel of this.fixture.channels) {
            if (cachedChannel.channel) {
                for (let capability of cachedChannel.capabilities) {
                    switch (capability.capability.type) {
                        case FixtureCapabilityType.Intensity:
                            this.fixtureHasDimmer = true;
                            break;
                        case FixtureCapabilityType.ColorIntensity:
                            this.fixtureHasColor = true;
                            break;
                    }
                }

                if (cachedChannel.colorWheel) {
                    this.fixtureHasColorWheel = true;
                }
            }
        }
    }

    protected getCapabilityInValue(channel: CachedFixtureChannel, value: number): CachedFixtureCapability {
        for (let capability of channel.capabilities) {
            if (capability.capability.dmxRange.length == 0 || (value >= capability.capability.dmxRange[0] && value <= capability.capability.dmxRange[1])) {
                return capability;
            }
        }

        return undefined;
    }

    // Apply the properties of the base fixture to the preview
    updatePreview(channelValues: FixtureChannelValue[], masterDimmerValue: number) {
        // Apply default settings
        if (this.fixtureHasDimmer) {
            this.dimmer = 0;
        } else {
            this.dimmer = 1;
        }

        this.colorRed = 255;
        this.colorGreen = 255;
        this.colorBlue = 255;

        if (!this.fixtureHasColorWheel && this.fixtureHasColor) {
            this.colorRed = 0;
            this.colorGreen = 0;
            this.colorBlue = 0;
        }

        for (let channelValue of channelValues) {
            let channel = this.fixtureService.getChannelByName(this.fixture, channelValue.channelName);
            let capability = this.getCapabilityInValue(channel, channelValue.value);

            if (capability) {
                switch (capability.capability.type) {
                    case FixtureCapabilityType.Intensity: {
                        let valuePercentage: number;
                        if (capability.capability.dmxRange.length > 0) {
                            valuePercentage = (channelValue.value - capability.capability.dmxRange[0]) / ((capability.capability.dmxRange[1] - capability.capability.dmxRange[0]));
                        } else {
                            valuePercentage = channelValue.value / channel.maxValue;
                        }
                        this.dimmer = valuePercentage * masterDimmerValue;
                        break;
                    }
                    case FixtureCapabilityType.ColorIntensity: {
                        let valuePercentage = 255 * channelValue.value / channel.maxValue;
                        switch (capability.capability.color) {
                            case FixtureCapabilityColor.Red:
                                // Round needed for threejs
                                this.colorRed = Math.round(valuePercentage);
                                break;
                            case FixtureCapabilityColor.Green:
                                // Round needed for threejs
                                this.colorGreen = Math.round(valuePercentage);
                                break;
                            case FixtureCapabilityColor.Blue:
                                // Round needed for threejs
                                this.colorBlue = Math.round(valuePercentage);
                                break;
                        }
                        break;
                    }
                    case FixtureCapabilityType.WheelSlot: {
                        let mixedColor = this.fixtureService.getMixedWheelSlotColor(capability.wheel, capability.capability.slotNumber);
                        if (mixedColor) {
                            this.colorRed = Math.round(mixedColor.red);
                            this.colorGreen = Math.round(mixedColor.green);
                            this.colorBlue = Math.round(mixedColor.blue);
                        }
                        break;
                    }
                }
            }
        }
    }

    updatePosition(object: THREE.Object3D) {
        // Update the position
        switch (this.fixture.fixture.positioning) {
            case Positioning.topFront: {
                object.rotation.x = THREE.Math.degToRad(0);
                object.position.set(this.fixture.fixture.positionX, this.fixture.fixture.positionY - 13, this.fixture.fixture.positionZ);
                break;
            }
            case Positioning.bottomFront: {
                object.rotation.x = THREE.Math.degToRad(180);
                object.position.set(this.fixture.fixture.positionX, this.fixture.fixture.positionY + 13, this.fixture.fixture.positionZ);
                break;
            }
            case Positioning.topBack: {
                object.rotation.x = THREE.Math.degToRad(0);
                object.position.set(this.fixture.fixture.positionX, this.fixture.fixture.positionY - 13, this.fixture.fixture.positionZ);
                break;
            }
            case Positioning.bottomBack: {
                object.rotation.x = THREE.Math.degToRad(180);
                object.position.set(this.fixture.fixture.positionX, this.fixture.fixture.positionY + 13, this.fixture.fixture.positionZ);
                break;
            }
            case Positioning.manual: {
                object.position.set(this.fixture.fixture.positionX, this.fixture.fixture.positionY, this.fixture.fixture.positionZ);
                object.rotation.x = THREE.Math.degToRad(this.fixture.fixture.rotationX);
                object.rotation.y = THREE.Math.degToRad(this.fixture.fixture.rotationY);
                object.rotation.z = THREE.Math.degToRad(this.fixture.fixture.rotationZ);
                break;
            }
        }
    }

    destroy() {
        this.selectedMaterial.dispose();
    }

}
