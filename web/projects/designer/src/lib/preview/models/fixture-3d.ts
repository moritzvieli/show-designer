import { FixtureTemplate } from "../../models/fixture-template";
import { Fixture } from "../../models/fixture";
import { FixtureCapabilityValue } from "../../models/fixture-capability-value";
import { FixtureCapabilityType, FixtureCapabilityColor } from "../../models/fixture-capability";
import * as THREE from 'three';
import { FixtureService } from "../../services/fixture.service";
import { FixtureChannelValue } from "../../models/fixture-channel-value";

export abstract class Fixture3d {

    fixture: Fixture;
    fixtureTemplate: FixtureTemplate;
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
        fixture: Fixture,
        scene: any
    ) {
        this.fixture = fixture;
        this.fixtureTemplate = fixtureService.getTemplateByUuid(fixture.fixtureTemplateUuid);
        this.scene = scene;

        // TODO Don't create it for each fixture but pass it from the preview service
        this.selectedMaterial = new THREE.MeshLambertMaterial({
            color: 0xff00ff,
            emissive: 0xff00ff
        });

        // evaluate, various capabilities of this fixture
        for (let channelFineIndex of this.fixtureService.getChannelsByFixture(fixture)) {
            let channel = channelFineIndex.fixtureChannel;

            if (channel) {
                let capabilities = this.fixtureService.getCapabilitiesByChannel(channel);

                if (channel && this.fixtureService.channelHasCapabilityType(channel, FixtureCapabilityType.Intensity)) {
                    this.fixtureSupportsDimmer = true;
                }

                for (let capability of capabilities) {
                    if (capability.type == FixtureCapabilityType.WheelSlot) {
                        let wheel = this.fixtureService.getWheelByName(this.fixtureTemplate, capability.wheel || channelFineIndex.channelName);
                        let wheelSlots = this.fixtureService.getWheelSlots(wheel, capability.slotNumber);
                        for (let slot of wheelSlots) {
                            if (slot.colors.length > 0) {
                                this.fixtureHasColorWheel = true;
                            }
                        }
                    }
                }
            }
        }
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
            let capability = this.fixtureService.getCapabilityInValue(channelValue.channelName, channelValue.fixtureTemplateUuid, channelValue.value);

            if (capability) {
                switch (capability.type) {
                    case FixtureCapabilityType.Intensity: {
                        let valuePercentage: number;
                        if (capability.dmxRange.length > 0) {
                            valuePercentage = (channelValue.value - capability.dmxRange[0]) / ((capability.dmxRange[1] - capability.dmxRange[0]));
                        } else {
                            valuePercentage = channelValue.value / this.fixtureService.getMaxValueByChannel(this.fixtureService.getChannelByName(channelValue.channelName, this.fixture).fixtureChannel);
                        }
                        this.dimmer = valuePercentage * masterDimmerValue;
                        break;
                    }
                    case FixtureCapabilityType.ColorIntensity: {
                        let valuePercentage = 255 * channelValue.value / this.fixtureService.getMaxValueByChannel(this.fixtureService.getChannelByName(channelValue.channelName, this.fixture).fixtureChannel);
                        switch (capability.color) {
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
                        let wheel = this.fixtureService.getWheelByName(this.fixtureTemplate, capability.wheel || channelValue.channelName);
                        let mixedColor = this.fixtureService.getMixedWheelSlotColor(wheel, capability.slotNumber);

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
