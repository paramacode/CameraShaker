import { RunService, Workspace } from "@rbxts/services";
import { CameraShakeInstance, CameraShakeState } from "./camera-shake-instance";

export type ShakeCallback = (offset: Vector3, rotation: Vector3, zoom: number) => void;

export class CameraShaker {
	private readonly _renderPriority: number;
	private readonly _bindName: string;
	private readonly _instances: CameraShakeInstance[] = [];

	private static _nextId = 0;

	private _running = false;
	private _destroyed = false;
	private _callback?: ShakeCallback;
	private _originalFOV: number;
	

	constructor(
		renderPriority: number = Enum.RenderPriority.Camera.Value,
		callback?: ShakeCallback,
	) {
		const camera = Workspace.CurrentCamera;
		assert(camera, "[CameraShaker]: Workspace.CurrentCamera not found");

		this._renderPriority = renderPriority;
		this._bindName = `CameraShakerPlus_${CameraShaker._nextId++}`;
		this._callback = callback;
		this._originalFOV = camera.FieldOfView;
	}

	public start() {
		assert(!this._destroyed, "[CameraShaker]: Cannot start a destroyed shaker");

		if (this._running) return;
		this._running = true;

		RunService.BindToRenderStep(this._bindName, this._renderPriority, (deltaTime: number) => this.update(deltaTime));
	}

	public stop() {
		if (!this._running) return;
		this._running = false;

		RunService.UnbindFromRenderStep(this._bindName);
	}

	public destroy() {
		this.stop();
		this._instances.clear();
		this._destroyed = true;
	}

	public update(deltaTime: number) {
		const instances = this._instances;

		let offsetX = 0, offsetY = 0, offsetZ = 0;
		let rotationX = 0, rotationY = 0, rotationZ = 0;
	
		let totalZoom = 0;
		let needsCleanup = false;

		for (const instance of instances) {
			const [offset, rotation, zoom] = instance.update(deltaTime);

			const positionInfluence = instance.positionInfluence;
			const rotationInfluence = instance.rotationInfluence;

			offsetX += offset.X * positionInfluence.X;
			offsetY += offset.Y * positionInfluence.Y;
			offsetZ += offset.Z * positionInfluence.Z;
			rotationX += rotation.X * rotationInfluence.X;
			rotationY += rotation.Y * rotationInfluence.Y;
			rotationZ += rotation.Z * rotationInfluence.Z;

			totalZoom += zoom;

			if (instance.state === CameraShakeState.Inactive && instance.deleteOnInactive) {
				needsCleanup = true;
			}
		}

		if (needsCleanup) {
			for (let i = instances.size() - 1; i >= 0; i--) {
				const instance = instances[i];
				if (instance.state === CameraShakeState.Inactive && instance.deleteOnInactive) {
					instances.unorderedRemove(i);
				}
			}
		}

		const totalOffset = new Vector3(offsetX, offsetY, offsetZ);
		const totalRotation = new Vector3(rotationX, rotationY, rotationZ);

		if (this._callback) {
			this._callback(totalOffset, totalRotation, totalZoom);
		} else {
			this._defaultCallback(totalOffset, totalRotation, totalZoom);
		}
	}

	private _defaultCallback(offset: Vector3, rotation: Vector3, zoom: number) {
		const camera = Workspace.CurrentCamera;
		if (!camera) return;

		camera.CFrame = camera.CFrame
			.mul(new CFrame(offset))
			.mul(CFrame.Angles(math.rad(rotation.X), math.rad(rotation.Y), math.rad(rotation.Z)));

		if (zoom !== 0) {
			camera.FieldOfView = this._originalFOV + zoom;
		}
	}

	public shake(instance: CameraShakeInstance): CameraShakeInstance {
		assert(!this._destroyed, "[CameraShaker]: Cannot shake on a destroyed shaker");
		this._instances.push(instance);
		return instance;
	}

	public shakeOnce(
		magnitude: number,
		roughness: number,
		fadeIn: number = 0,
		fadeOut: number = 0,
		positionInfluence?: Vector3,
		rotationInfluence?: Vector3,
		zoomIntensity?: number,
	): CameraShakeInstance {
		assert(!this._destroyed, "[CameraShaker]: Cannot shakeOnce on a destroyed shaker");
		assert(magnitude >= 0, `[CameraShaker]: magnitude must be >= 0, got ${magnitude}`);
		assert(roughness >= 0, `[CameraShaker]: roughness must be >= 0, got ${roughness}`);
		assert(fadeIn >= 0, `[CameraShaker]: fadeIn must be >= 0, got ${fadeIn}`);
		assert(fadeOut >= 0, `[CameraShaker]: fadeOut must be >= 0, got ${fadeOut}`);
		const instance = new CameraShakeInstance({
			magnitude,
			roughness,
			fadeInDuration: fadeIn,
			fadeOutDuration: fadeOut,
			positionInfluence,
			rotationInfluence,
			zoomIntensity,
		});

		instance.sustain = false;

		if (fadeIn > 0) {
			instance.state = CameraShakeState.FadingIn;
			instance.currentFadeTime = 0;
		} else {
			instance.currentFadeTime = 1;
			instance.state = fadeOut > 0 ? CameraShakeState.FadingOut : CameraShakeState.Inactive;
		}

		return this.shake(instance);
	}

	public shakeSustained(instance: CameraShakeInstance): CameraShakeInstance {
		assert(!this._destroyed, "[CameraShaker]: Cannot shakeSustained on a destroyed shaker");

		instance.startFadeIn(instance.fadeInDuration);
		
		return this.shake(instance);
	}

	public stopAllSustained(fadeOutTime?: number) {
		for (const instance of this._instances) {
			if (instance.state === CameraShakeState.Sustained || instance.state === CameraShakeState.FadingIn) {
				instance.startFadeOut(fadeOutTime ?? instance.fadeOutDuration);
			}
		}
	}
}
