import { CameraShakeInstance } from "./CameraShakerInstance";
export type ShakeCallback = (offset: Vector3, rotation: Vector3, zoom: number) => void;
export declare class CameraShaker {
    private static _nextId;
    private _running;
    private _destroyed;
    private readonly _renderPriority;
    private readonly _bindName;
    private readonly _instances;
    private _callback?;
    private _originalFOV;
    constructor(renderPriority?: number, callback?: ShakeCallback);
    start(): void;
    stop(): void;
    destroy(): void;
    update(deltaTime: number): void;
    private _defaultCallback;
    shake(instance: CameraShakeInstance): CameraShakeInstance;
    shakeOnce(magnitude: number, roughness: number, fadeIn?: number, fadeOut?: number, positionInfluence?: Vector3, rotationInfluence?: Vector3, zoomIntensity?: number): CameraShakeInstance;
    shakeSustained(instance: CameraShakeInstance): CameraShakeInstance;
    stopAllSustained(fadeOutTime?: number): void;
}
