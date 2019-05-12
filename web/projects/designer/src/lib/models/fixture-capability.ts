export enum FixtureCapabilityType {
    NoFunction = "NoFunction",
    ShutterStrobe = "ShutterStrobe",
    StrobeSpeed = "StrobeSpeed",
    StrobeDuration = "StrobeDuration",
    Intensity = "Intensity",
    ColorIntensity = "ColorIntensity",
    ColorPreset = "ColorPreset",
    ColorTemperature = "ColorTemperature",
    Pan = "Pan",
    PanContinuous = "PanContinuous",
    Tilt = "Tilt",
    TiltContinuous = "TiltContinuous",
    PanTiltSpeed = "PanTiltSpeed",
    WheelSlot = "WheelSlot",
    WheelShake = "WheelShake",
    WheelSlotRotation = "WheelSlotRotation",
    WheelRotation = "WheelRotation",
    Effec = "Effect",
    EffectSpeed = "EffectSpeed",
    EffectDuration = "EffectDuration",
    EffectParameter = "EffectParameter",
    SoundSensitivity = "SoundSensitivity",
    Focus = "Focus",
    Zoom = "Zoom",
    Iris = "Iris",
    IrisEffect = "IrisEffect",
    Frost = "Frost",
    FrostEffect = "FrostEffect",
    Prism = "Prism",
    PrismRotation = "PrismRotation",
    BladeInsertion = "BladeInsertion",
    BladeRotation = "BladeRotation",
    BladeSystemRotation = "BladeSystemRotation",
    Fog = "Fog",
    FogOutput = "FogOutput",
    FogType = "FogType",
    BeamAngle = "BeamAngle",
    Rotation = "Rotation",
    Speed = "Speed",
    Time = "Time",
    Maintenance = "Maintenance",
    Generic = "Generic",
    Effect = "Effect"
}

export enum FixtureCapabilityColor {
    Red = "Red",
    Green = "Green",
    Blue = "Blue",
    Cyan = "Cyan",
    Magenta = "Magenta",
    Yellow = "Yellow",
    Amber = "Amber",
    White = "White",
    'Warm White' = "Warm White",
    'Cold White' = "Cold White",
    UV = "UV",
    Lime = "Lime",
    Indigo = "Indigo"
}

export class FixtureCapability {

    type: FixtureCapabilityType;
    angleStart: string;
    angleEnd: string;
    color: FixtureCapabilityColor;
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
