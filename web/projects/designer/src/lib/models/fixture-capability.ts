export enum FixtureCapabilityType {
    NoFunction,
    ShutterStrobe,
    StrobeSpeed,
    StrobeDuration,
    Intensity,
    ColorIntensity,
    ColorPreset,
    ColorTemperature,
    Pan,
    PanContinuous,
    Tilt,
    TiltContinuous,
    PanTiltSpeed,
    WheelSlot,
    WheelShake,
    WheelSlotRotation,
    WheelRotation,
    Effect,
    EffectSpeed,
    EffectDuration,
    EffectParameter,
    SoundSensitivity,
    Focus,
    Zoom,
    Iris,
    IrisEffect,
    Frost,
    FrostEffect,
    Prism,
    PrismRotation,
    BladeInsertion,
    BladeRotation,
    BladeSystemRotation,
    Fog,
    FogOutput,
    FogType,
    BeamAngle,
    Rotation,
    Speed,
    Time,
    Maintenance,
    Generic
}

export enum FixtureCapabilityColor {
    Red,
    Green,
    Blue,
    Cyan,
    Magenta,
    Yellow,
    Amber,
    White,
    'Warm White',
    'Cold White',
    UV,
    Lime,
    Indigo
}

export class FixtureCapability {

    type: FixtureCapabilityType;
    angleStart: string;
    angleEnd: string;
    color: string;
    dmxRange: number[] = [];

    constructor(data?: any) {
        if (!data) {
            return;
        }

        this.type = FixtureCapabilityType[<string>data.type];
        this.angleStart = data.angleEnd;
        this.color = data.color;

        if (data.dmxRange) {
            this.dmxRange = data.dmxRange;
        }
    }

}
