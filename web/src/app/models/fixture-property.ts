import { FixturePropertyRange } from "./fixture-property-range";

export enum FixturePropertyType {
    pan,
    panFine,
    panInfinite,
    tilt,
    tiltFine,
    tiltInfinite,
    movementSpeed,
    dimmer,
    dimmerFine,
    colorRed,
    colorRedFine,
    colorGreen,
    colorGreenFine,
    colorBlue,
    colorBlueFine,
    colorCyan,
    colorCyanFine,
    colorMagenta,
    colorMagentaFine,
    colorYellow,
    colorYellowFine,
    colorCoolWhite,
    colorCoolWhiteFine,
    colorWarmWhite,
    colorWarmWhiteFine,
    colorAmber,
    colorAmberFine,
    colorUltraviolet,
    colorUltravioletFine,
    colorWheel,
    colorTemperature,
    colorTemperatureFine,
    colorGreenSaturation,
    colorGreenSaturationFine,
    colorXfade,
    colorXfadeFine,
    goboWheel,
    goboIndexing,
    goboIndexingFine,
    goboRotation,
    goboRotationFine,
    goboShake,
    shutterStrobe,
    focus,
    focusFine,
    zoom,
    zoomFine,
    iris,
    irisFine,
    frost,
    frostFine,
    prism,
    prismIndexing,
    prismIndexingFine,
    prismRotation,
    lamp,
    fog,
    command,
    operatingMode,
    custom
}

export enum ApplyBeamsType {
    all,
    ring1, // Most inner ring
    ring2,
    ring3,
    ring4, // Most outer ring
    custom
}

export enum ValueType {
    dmxValue, // The range will be specified with it's exact DMX value
    percentage // The range will be specified with a percentage value
}

export class FixtureProperty {

    type: FixturePropertyType;
    customName: string;

    // Applies only to ranges with sliders
    valueType: ValueType = ValueType.dmxValue;

    // Only apply this property, if the fixture is in one of the following
    // operation modes
    appliesToOperatingModeUuids: string[] = [];

    appliesToBeamsType: ApplyBeamsType = ApplyBeamsType.all;

    // If ApplyBeamsType = custom has been selected
    appliesToBeamsFrom: number;
    applieasToBeamsTo: number;

    // All property ranges
    fixturePropertyRanges: FixturePropertyRange[] = [];

}
