import { CameraShakeInstance } from "./camera-shake-instance";

export const LightImpact = () =>
	new CameraShakeInstance({
		magnitude: 1,
		roughness: 7,
		fadeInDuration: 0.1,
		fadeOutDuration: 0.15,
		positionInfluence: new Vector3(0.15, 0.15, 0.15),
		rotationInfluence: new Vector3(1, 1, 1),
	});

export const MediumImpact = () =>
	new CameraShakeInstance({
		magnitude: 2,
		roughness: 10,
		fadeInDuration: 0.1,
		fadeOutDuration: 0.2,
		positionInfluence: new Vector3(0.2, 0.2, 0.2),
		rotationInfluence: new Vector3(1.5, 1.5, 1.5),
	});

export const StrongImpact = () =>
	new CameraShakeInstance({
		magnitude: 3,
		roughness: 14,
		fadeInDuration: 0.15,
		fadeOutDuration: 0.3,
		positionInfluence: new Vector3(0.25, 0.25, 0.25),
		rotationInfluence: new Vector3(2, 2, 2),
	});

export const Explosion = () =>
	new CameraShakeInstance({
		magnitude: 4,
		roughness: 15,
		fadeInDuration: 0.05,
		fadeOutDuration: 0.25,
		positionInfluence: new Vector3(0.3, 0.3, 0.3),
		rotationInfluence: new Vector3(2.5, 2.5, 2.5),
		zoomIntensity: 2,
	});

export const Earthquake = () =>
	new CameraShakeInstance({
		magnitude: 1.5,
		roughness: 3,
		fadeInDuration: 2,
		fadeOutDuration: 10,
		positionInfluence: new Vector3(0.2, 0.2, 0.2),
		rotationInfluence: new Vector3(0.5, 0.5, 1.5),
	});

export const Handheld = () =>
	new CameraShakeInstance({
		magnitude: 0.8,
		roughness: 0.4,
		fadeInDuration: 0.5,
		fadeOutDuration: 0,
		positionInfluence: new Vector3(0.05, 0.05, 0.05),
		rotationInfluence: new Vector3(0.3, 0.3, 0.3),
	});
