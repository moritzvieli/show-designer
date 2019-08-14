import { FixtureCapabilityType, FixtureCapabilityColor } from "../../models/fixture-capability";
import * as THREE from 'three';
import { FixtureService } from "../../services/fixture.service";
import { FixtureChannelValue } from "../../models/fixture-channel-value";
import { CachedFixture } from "../../models/cached-fixture";
import { CachedFixtureCapability } from "../../models/cached-fixture-capability";
import { CachedFixtureChannel } from "../../models/cached-fixture-channel";

export abstract class Fixture3d {

    fixture: CachedFixture;
    fixtureSupportsDimmer: boolean = false;
    fixtureHasColorWheel: boolean = false;

    scene: any;

    colorRed: number;
    colorGreen: number;
    colorBlue: number;

    dimmer: number = 1;

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
                    if (capability.capability.type == FixtureCapabilityType.Intensity) {
                        this.fixtureSupportsDimmer = true;
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
        this.colorRed = 255;
        this.colorGreen = 255;
        this.colorBlue = 255;

        if (!this.fixtureHasColorWheel) {
            this.colorRed = 0;
            this.colorGreen = 0;
            this.colorBlue = 0;
        }

        if (this.fixtureSupportsDimmer) {
            this.dimmer = masterDimmerValue;
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

    destroy() { }

}
