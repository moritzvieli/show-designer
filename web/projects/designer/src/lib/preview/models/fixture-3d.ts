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

    scene: any;

    colorRed: number;
    colorGreen: number;
    colorBlue: number;

    dimmer: number = 255;

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

        // Evaluate, whether this fixture supports a dimmer
        for (let channelFineIndex of this.fixtureService.getChannelsByFixture(fixture)) {
            let channel = channelFineIndex.fixtureChannel;

            if (channel && this.fixtureService.channelHasCapabilityType(channel, FixtureCapabilityType.Intensity)) {
                this.fixtureSupportsDimmer = true;
                break;
            }
        }
    }

    // Apply the properties of the base fixture to the preview
    updatePreview(channelValues: FixtureChannelValue[], masterDimmerValue: number) {
        // Apply default settings
        this.colorRed = 255;
        this.colorGreen = 255;
        this.colorBlue = 255;

        if (this.fixtureSupportsDimmer) {
            this.dimmer = 255 * masterDimmerValue;
        }

        for (let channelValue of channelValues) {
            let capability = this.fixtureService.getCapabilityInValue(channelValue.channelName, channelValue.fixtureTemplateUuid, channelValue.value);

            if (capability) {
                switch (capability.type) {
                    case FixtureCapabilityType.ColorIntensity: {
                        // switch (capabilityValue.color) {
                        //     case FixtureCapabilityColor.Red:
                        //         // Round needed for threejs
                        //         this.colorRed = Math.round(capabilityValue.value);
                        //         break;
                        //     case FixtureCapabilityColor.Green:
                        //         // Round needed for threejs
                        //         this.colorGreen = Math.round(capabilityValue.value);
                        //         break;
                        //     case FixtureCapabilityColor.Blue:
                        //         // Round needed for threejs
                        //         this.colorBlue = Math.round(capabilityValue.value);
                        //         break;
                        // }
                        break;
                    }
                    case FixtureCapabilityType.WheelSlot: {
                        let wheelSlots = this.fixtureService.getWheelSlots(this.fixtureTemplate, capability.wheel || channelValue.channelName, capability.slotNumber);

                        if (wheelSlots) {
                            let colors: string[] = [];
                            // at least one slot has a color
                            let hasColor: boolean = false;

                            for (let slot of wheelSlots) {
                                // calculate the color based on the color wheel slot
                                // TODO support for multiple colors (multiple beams)
                                if (slot.colors.length > 0) {
                                    colors = colors.concat(slot.colors);
                                    hasColor = true;
                                } else {
                                    colors.push('#fff');
                                }
                            }

                            if (hasColor) {
                                let colorsRgb: any[] = [];

                                for (let color of colors) {
                                    colorsRgb.push(this.fixtureService.hexToRgb(color));
                                }

                                let mixedColor = this.fixtureService.mixColors(colorsRgb);
                                this.colorRed = Math.round(mixedColor.r);
                                this.colorGreen = Math.round(mixedColor.g);
                                this.colorBlue = Math.round(mixedColor.b);
                            }
                        }

                        break;
                    }
                    case FixtureCapabilityType.Intensity: {
                        this.dimmer = channelValue.value * masterDimmerValue;
                        break;
                    }
                }
            }
        }
    }

    destroy() { }

}
