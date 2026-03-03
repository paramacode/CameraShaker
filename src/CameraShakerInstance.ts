export enum CameraShakeState {
	FadingIn = 0,
	FadingOut = 1,
	Sustained = 2,
	Inactive = 3,
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

export class CameraShakeInstance {
	public magnitude: number;
	public roughness: number;
	public positionInfluence: Vector3;
	public rotationInfluence: Vector3;
	public fadeInDuration: number;
	public fadeOutDuration: number;

	public currentFadeTime: number;
	public roughnessModifier = 1;
	public magnitudeModifier = 1;
	public sustain: boolean;
	public tick: number;
	public state = CameraShakeState.Inactive;
	public deleteOnInactive: boolean;

	public zoomIntensity: number;
	public zoomSpeed: number;

	constructor(options: CameraShakeOptions) {
		assert(options.magnitude >= 0, `CameraShakeInstance: magnitude must be >= 0, got ${options.magnitude}`);
		assert(options.roughness >= 0, `CameraShakeInstance: roughness must be >= 0, got ${options.roughness}`);

		const {
			magnitude,
			roughness,
			fadeInDuration = 0,
			fadeOutDuration = 0,
			positionInfluence = new Vector3(0.15, 0.15, 0.15),
			rotationInfluence = new Vector3(1, 1, 1),
			zoomIntensity = 0,
			zoomSpeed = 5,
			deleteOnInactive = true,
		} = options;

		assert(fadeInDuration >= 0, `CameraShakeInstance: fadeInDuration must be >= 0, got ${fadeInDuration}`);
		assert(fadeOutDuration >= 0, `CameraShakeInstance: fadeOutDuration must be >= 0, got ${fadeOutDuration}`);
		assert(zoomIntensity >= 0, `CameraShakeInstance: zoomIntensity must be >= 0, got ${zoomIntensity}`);
		assert(zoomSpeed > 0, `CameraShakeInstance: zoomSpeed must be > 0, got ${zoomSpeed}`);

		this.magnitude = magnitude;
		this.roughness = roughness;
		this.fadeInDuration = fadeInDuration;
		this.fadeOutDuration = fadeOutDuration;
		this.positionInfluence = positionInfluence;
		this.rotationInfluence = rotationInfluence;
		this.zoomIntensity = zoomIntensity;
		this.zoomSpeed = zoomSpeed;
		this.deleteOnInactive = deleteOnInactive;

		this.currentFadeTime = fadeInDuration > 0 ? 0 : 1;
		this.sustain = fadeInDuration > 0;
		this.tick = math.random() * 100000;
	}

	public startFadeIn(fadeTime?: number) {
		if (fadeTime !== undefined) {
			assert(fadeTime >= 0, `CameraShakeInstance: fadeIn time must be >= 0, got ${fadeTime}`);
			this.fadeInDuration = fadeTime;
		}
		this.state = CameraShakeState.FadingIn;
		this.sustain = true;
	}

	public startFadeOut(fadeTime?: number) {
		if (fadeTime !== undefined) {
			assert(fadeTime >= 0, `CameraShakeInstance: fadeOut time must be >= 0, got ${fadeTime}`);
			this.fadeOutDuration = fadeTime;
		}
		this.state = CameraShakeState.FadingOut;
		this.sustain = false;
	}

	public stop() {
		this.state = CameraShakeState.Inactive;
		this.currentFadeTime = 0;
	}

	public update(deltaTime: number): LuaTuple<[Vector3, Vector3, number]> {
		if (this.state === CameraShakeState.Inactive) {
			return $tuple(Vector3.zero, Vector3.zero, 0);
		}

		if (this.state === CameraShakeState.FadingIn) {
			if (this.fadeInDuration > 0) {
				this.currentFadeTime = math.min(1, this.currentFadeTime + deltaTime / this.fadeInDuration);
			} else {
				this.currentFadeTime = 1;
			}
			if (this.currentFadeTime >= 1) {
				this.state = this.sustain ? CameraShakeState.Sustained : CameraShakeState.FadingOut;
			}
		}
		else if (this.state === CameraShakeState.FadingOut) {
			if (this.fadeOutDuration > 0) {
				this.currentFadeTime = math.max(0, this.currentFadeTime - deltaTime / this.fadeOutDuration);
			} else {
				this.currentFadeTime = 0;
			}
			if (this.currentFadeTime <= 0) {
				this.state = CameraShakeState.Inactive;
				return $tuple(Vector3.zero, Vector3.zero, 0);
			}
		}

		const timeFactor = this.tick + deltaTime * this.roughness * this.roughnessModifier;
		this.tick = timeFactor;

		const currentMagnitude = this.magnitude * this.magnitudeModifier * this.currentFadeTime;

		if (currentMagnitude === 0 && this.zoomIntensity === 0) {
			return $tuple(Vector3.zero, Vector3.zero, 0);
		}

		// Position noise (fractional seeds avoid Perlin lattice zero-crossings)
		const noiseX = math.noise(timeFactor, 0.72) * 2;
		const noiseY = math.noise(0.43, timeFactor) * 2;
		const noiseZ = math.noise(timeFactor, timeFactor + 0.57) * 2;

		// Rotation noise: Pitch (X), Yaw (Y), Roll (Z)
		const noisePitch = math.noise(timeFactor + 1000.31, 500.63) * 2;
		const noiseYaw = math.noise(500.17, timeFactor + 2000.49) * 2;
		const noiseRoll = math.noise(0.89, 0.53, timeFactor) * 2;

		const offset = new Vector3(noiseX * currentMagnitude, noiseY * currentMagnitude, noiseZ * currentMagnitude);
		const rotation = new Vector3(noisePitch * currentMagnitude, noiseYaw * currentMagnitude, noiseRoll * currentMagnitude);

		const zoomValue = this.zoomIntensity > 0
			? math.sin(os.clock() * this.zoomSpeed) * this.zoomIntensity * this.currentFadeTime
			: 0;

		return $tuple(offset, rotation, zoomValue);
	}
}
