export declare enum CameraShakeState {
    FadingIn = 0,
    FadingOut = 1,
    Sustained = 2,
    Inactive = 3
}
export interface CameraShakeOptions {
    /** The intensity of the shake. */
    magnitude: number;
    /** The frequency or speed of the shake. */
    roughness: number;
    /** Time in seconds to reach full magnitude. */
    fadeInDuration?: number;
    /** Time in seconds to fade out to zero. */
    fadeOutDuration?: number;
    /** How much this shake affects the camera's position (X, Y, Z). Default (0.15, 0.15, 0.15) */
    positionInfluence?: Vector3;
    /** How much this shake affects the camera's rotation (Pitch, Yaw, Roll). Default (1, 1, 1) */
    rotationInfluence?: Vector3;
    /** Intensity of the FOV zoom effect. Default 0 */
    zoomIntensity?: number;
    /** Speed of the FOV zoom oscillation. Default 5 */
    zoomSpeed?: number;
    /** If true, the instance is automatically removed when it becomes inactive. Default true */
    deleteOnInactive?: boolean;
}
export declare class CameraShakeInstance {
    magnitude: number;
    roughness: number;
    positionInfluence: Vector3;
    rotationInfluence: Vector3;
    fadeInDuration: number;
    fadeOutDuration: number;
    currentFadeTime: number;
    roughnessModifier: number;
    magnitudeModifier: number;
    sustain: boolean;
    tick: number;
    state: CameraShakeState;
    deleteOnInactive: boolean;
    zoomIntensity: number;
    zoomSpeed: number;
    constructor(options: CameraShakeOptions);
    startFadeIn(fadeTime?: number): void;
    startFadeOut(fadeTime?: number): void;
    stop(): void;
    update(deltaTime: number): LuaTuple<[Vector3, Vector3, number]>;
}
