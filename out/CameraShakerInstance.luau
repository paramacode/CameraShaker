-- Compiled with roblox-ts v3.0.0
local CameraShakeState
do
	local _inverse = {}
	CameraShakeState = setmetatable({}, {
		__index = _inverse,
	})
	CameraShakeState.FadingIn = 0
	_inverse[0] = "FadingIn"
	CameraShakeState.FadingOut = 1
	_inverse[1] = "FadingOut"
	CameraShakeState.Sustained = 2
	_inverse[2] = "Sustained"
	CameraShakeState.Inactive = 3
	_inverse[3] = "Inactive"
end
local CameraShakeInstance
do
	CameraShakeInstance = setmetatable({}, {
		__tostring = function()
			return "CameraShakeInstance"
		end,
	})
	CameraShakeInstance.__index = CameraShakeInstance
	function CameraShakeInstance.new(...)
		local self = setmetatable({}, CameraShakeInstance)
		return self:constructor(...) or self
	end
	function CameraShakeInstance:constructor(options)
		self.roughnessModifier = 1
		self.magnitudeModifier = 1
		self.state = CameraShakeState.Inactive
		local _arg0 = options.magnitude >= 0
		local _arg1 = `CameraShakeInstance: magnitude must be >= 0, got {options.magnitude}`
		assert(_arg0, _arg1)
		local _arg0_1 = options.roughness >= 0
		local _arg1_1 = `CameraShakeInstance: roughness must be >= 0, got {options.roughness}`
		assert(_arg0_1, _arg1_1)
		local _binding = options
		local magnitude = _binding.magnitude
		local roughness = _binding.roughness
		local fadeInDuration = _binding.fadeInDuration
		if fadeInDuration == nil then
			fadeInDuration = 0
		end
		local fadeOutDuration = _binding.fadeOutDuration
		if fadeOutDuration == nil then
			fadeOutDuration = 0
		end
		local positionInfluence = _binding.positionInfluence
		if positionInfluence == nil then
			positionInfluence = Vector3.new(0.15, 0.15, 0.15)
		end
		local rotationInfluence = _binding.rotationInfluence
		if rotationInfluence == nil then
			rotationInfluence = Vector3.new(1, 1, 1)
		end
		local zoomIntensity = _binding.zoomIntensity
		if zoomIntensity == nil then
			zoomIntensity = 0
		end
		local zoomSpeed = _binding.zoomSpeed
		if zoomSpeed == nil then
			zoomSpeed = 5
		end
		local deleteOnInactive = _binding.deleteOnInactive
		if deleteOnInactive == nil then
			deleteOnInactive = true
		end
		local _arg0_2 = fadeInDuration >= 0
		local _arg1_2 = `CameraShakeInstance: fadeInDuration must be >= 0, got {fadeInDuration}`
		assert(_arg0_2, _arg1_2)
		local _arg0_3 = fadeOutDuration >= 0
		local _arg1_3 = `CameraShakeInstance: fadeOutDuration must be >= 0, got {fadeOutDuration}`
		assert(_arg0_3, _arg1_3)
		local _arg0_4 = zoomIntensity >= 0
		local _arg1_4 = `CameraShakeInstance: zoomIntensity must be >= 0, got {zoomIntensity}`
		assert(_arg0_4, _arg1_4)
		local _arg0_5 = zoomSpeed > 0
		local _arg1_5 = `CameraShakeInstance: zoomSpeed must be > 0, got {zoomSpeed}`
		assert(_arg0_5, _arg1_5)
		self.magnitude = magnitude
		self.roughness = roughness
		self.fadeInDuration = fadeInDuration
		self.fadeOutDuration = fadeOutDuration
		self.positionInfluence = positionInfluence
		self.rotationInfluence = rotationInfluence
		self.zoomIntensity = zoomIntensity
		self.zoomSpeed = zoomSpeed
		self.deleteOnInactive = deleteOnInactive
		self.currentFadeTime = if fadeInDuration > 0 then 0 else 1
		self.sustain = fadeInDuration > 0
		self.tick = math.random() * 100000
	end
	function CameraShakeInstance:startFadeIn(fadeTime)
		if fadeTime ~= nil then
			local _arg0 = fadeTime >= 0
			local _arg1 = `CameraShakeInstance: fadeIn time must be >= 0, got {fadeTime}`
			assert(_arg0, _arg1)
			self.fadeInDuration = fadeTime
		end
		self.state = CameraShakeState.FadingIn
		self.sustain = true
	end
	function CameraShakeInstance:startFadeOut(fadeTime)
		if fadeTime ~= nil then
			local _arg0 = fadeTime >= 0
			local _arg1 = `CameraShakeInstance: fadeOut time must be >= 0, got {fadeTime}`
			assert(_arg0, _arg1)
			self.fadeOutDuration = fadeTime
		end
		self.state = CameraShakeState.FadingOut
		self.sustain = false
	end
	function CameraShakeInstance:stop()
		self.state = CameraShakeState.Inactive
		self.currentFadeTime = 0
	end
	function CameraShakeInstance:update(deltaTime)
		if self.state == CameraShakeState.Inactive then
			return Vector3.zero, Vector3.zero, 0
		end
		if self.state == CameraShakeState.FadingIn then
			if self.fadeInDuration > 0 then
				self.currentFadeTime = math.min(1, self.currentFadeTime + deltaTime / self.fadeInDuration)
			else
				self.currentFadeTime = 1
			end
			if self.currentFadeTime >= 1 then
				self.state = if self.sustain then CameraShakeState.Sustained else CameraShakeState.FadingOut
			end
		elseif self.state == CameraShakeState.FadingOut then
			if self.fadeOutDuration > 0 then
				self.currentFadeTime = math.max(0, self.currentFadeTime - deltaTime / self.fadeOutDuration)
			else
				self.currentFadeTime = 0
			end
			if self.currentFadeTime <= 0 then
				self.state = CameraShakeState.Inactive
				return Vector3.zero, Vector3.zero, 0
			end
		end
		local timeFactor = self.tick + deltaTime * self.roughness * self.roughnessModifier
		self.tick = timeFactor
		local currentMagnitude = self.magnitude * self.magnitudeModifier * self.currentFadeTime
		if currentMagnitude == 0 and self.zoomIntensity == 0 then
			return Vector3.zero, Vector3.zero, 0
		end
		-- Position noise (fractional seeds avoid Perlin lattice zero-crossings)
		local noiseX = math.noise(timeFactor, 0.72) * 2
		local noiseY = math.noise(0.43, timeFactor) * 2
		local noiseZ = math.noise(timeFactor, timeFactor + 0.57) * 2
		-- Rotation noise: Pitch (X), Yaw (Y), Roll (Z)
		local noisePitch = math.noise(timeFactor + 1000.31, 500.63) * 2
		local noiseYaw = math.noise(500.17, timeFactor + 2000.49) * 2
		local noiseRoll = math.noise(0.89, 0.53, timeFactor) * 2
		local offset = Vector3.new(noiseX * currentMagnitude, noiseY * currentMagnitude, noiseZ * currentMagnitude)
		local rotation = Vector3.new(noisePitch * currentMagnitude, noiseYaw * currentMagnitude, noiseRoll * currentMagnitude)
		local zoomValue = if self.zoomIntensity > 0 then math.sin(os.clock() * self.zoomSpeed) * self.zoomIntensity * self.currentFadeTime else 0
		return offset, rotation, zoomValue
	end
end
return {
	CameraShakeState = CameraShakeState,
	CameraShakeInstance = CameraShakeInstance,
}
