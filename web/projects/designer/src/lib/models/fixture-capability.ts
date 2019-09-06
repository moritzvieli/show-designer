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
    // may be empty. in this case, the channel name points to the wheel
    wheel: any;
    slotNumber: number;
    brightness: string;
    brightnessStart: string;
    brightnessEnd: string;
    comment: string;

    constructor(data?: any) {
        if (!data) {
            return;
        }

        this.type = FixtureCapabilityType[<string>data.type];
        this.angleStart = data.angleStart;
        this.angleEnd = data.angleEnd;
        this.color = data.color;
        if (data.dmxRange) {
            this.dmxRange = data.dmxRange;
        }
        this.wheel = data.wheel;
        this.slotNumber = data.slotNumber;
        this.brightness = data.brightness;
        this.brightnessStart = data.brightnessStart;
        this.brightnessEnd = data.brightnessEnd;
        this.comment = data.comment;
    }

}
