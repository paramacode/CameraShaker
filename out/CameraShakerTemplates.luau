-- Compiled with roblox-ts v3.0.0
local TS = require(script.Parent.include.RuntimeLib)
local CameraShakeInstance = TS.import(script, script.Parent, "CameraShakerInstance").CameraShakeInstance
local LightImpact = function()
	return CameraShakeInstance.new({
		magnitude = 1,
		roughness = 7,
		fadeInDuration = 0.1,
		fadeOutDuration = 0.15,
		positionInfluence = Vector3.new(0.15, 0.15, 0.15),
		rotationInfluence = Vector3.new(1, 1, 1),
	})
end
local MediumImpact = function()
	return CameraShakeInstance.new({
		magnitude = 2,
		roughness = 10,
		fadeInDuration = 0.1,
		fadeOutDuration = 0.2,
		positionInfluence = Vector3.new(0.2, 0.2, 0.2),
		rotationInfluence = Vector3.new(1.5, 1.5, 1.5),
	})
end
local StrongImpact = function()
	return CameraShakeInstance.new({
		magnitude = 3,
		roughness = 14,
		fadeInDuration = 0.15,
		fadeOutDuration = 0.3,
		positionInfluence = Vector3.new(0.25, 0.25, 0.25),
		rotationInfluence = Vector3.new(2, 2, 2),
	})
end
local Explosion = function()
	return CameraShakeInstance.new({
		magnitude = 4,
		roughness = 15,
		fadeInDuration = 0.05,
		fadeOutDuration = 0.25,
		positionInfluence = Vector3.new(0.3, 0.3, 0.3),
		rotationInfluence = Vector3.new(2.5, 2.5, 2.5),
		zoomIntensity = 2,
	})
end
local Earthquake = function()
	return CameraShakeInstance.new({
		magnitude = 1.5,
		roughness = 3,
		fadeInDuration = 2,
		fadeOutDuration = 10,
		positionInfluence = Vector3.new(0.2, 0.2, 0.2),
		rotationInfluence = Vector3.new(0.5, 0.5, 1.5),
	})
end
local Handheld = function()
	return CameraShakeInstance.new({
		magnitude = 0.8,
		roughness = 0.4,
		fadeInDuration = 0.5,
		fadeOutDuration = 0,
		positionInfluence = Vector3.new(0.05, 0.05, 0.05),
		rotationInfluence = Vector3.new(0.3, 0.3, 0.3),
	})
end
return {
	LightImpact = LightImpact,
	MediumImpact = MediumImpact,
	StrongImpact = StrongImpact,
	Explosion = Explosion,
	Earthquake = Earthquake,
	Handheld = Handheld,
}
