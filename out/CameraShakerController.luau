-- Compiled with roblox-ts v3.0.0
local TS = require(script.Parent.include.RuntimeLib)
local _services = TS.import(script, script.Parent, "include", "node_modules", "@rbxts", "services")
local RunService = _services.RunService
local Workspace = _services.Workspace
local _CameraShakerInstance = TS.import(script, script.Parent, "CameraShakerInstance")
local CameraShakeInstance = _CameraShakerInstance.CameraShakeInstance
local CameraShakeState = _CameraShakerInstance.CameraShakeState
local CameraShaker
do
	CameraShaker = setmetatable({}, {
		__tostring = function()
			return "CameraShaker"
		end,
	})
	CameraShaker.__index = CameraShaker
	function CameraShaker.new(...)
		local self = setmetatable({}, CameraShaker)
		return self:constructor(...) or self
	end
	function CameraShaker:constructor(renderPriority, callback)
		if renderPriority == nil then
			renderPriority = Enum.RenderPriority.Camera.Value
		end
		self._running = false
		self._destroyed = false
		self._instances = {}
		local camera = Workspace.CurrentCamera
		assert(camera, "CameraShaker: Workspace.CurrentCamera not found")
		self._renderPriority = renderPriority
		local _original = CameraShaker._nextId
		CameraShaker._nextId += 1
		self._bindName = `CameraShakerPlus_{_original}`
		self._callback = callback
		self._originalFOV = camera.FieldOfView
	end
	function CameraShaker:start()
		local _arg0 = not self._destroyed
		assert(_arg0, "CameraShaker: Cannot start a destroyed shaker")
		if self._running then
			return nil
		end
		self._running = true
		RunService:BindToRenderStep(self._bindName, self._renderPriority, function(dt)
			self:update(dt)
		end)
	end
	function CameraShaker:stop()
		if not self._running then
			return nil
		end
		self._running = false
		RunService:UnbindFromRenderStep(self._bindName)
	end
	function CameraShaker:destroy()
		self:stop()
		table.clear(self._instances)
		self._destroyed = true
	end
	function CameraShaker:update(deltaTime)
		local instances = self._instances
		local ox = 0
		local oy = 0
		local oz = 0
		local rx = 0
		local ry = 0
		local rz = 0
		local totalZoom = 0
		local needsCleanup = false
		for _, instance in instances do
			local offset, rotation, zoom = instance:update(deltaTime)
			local posInf = instance.positionInfluence
			local rotInf = instance.rotationInfluence
			ox += offset.X * posInf.X
			oy += offset.Y * posInf.Y
			oz += offset.Z * posInf.Z
			rx += rotation.X * rotInf.X
			ry += rotation.Y * rotInf.Y
			rz += rotation.Z * rotInf.Z
			totalZoom += zoom
			if instance.state == CameraShakeState.Inactive and instance.deleteOnInactive then
				needsCleanup = true
			end
		end
		if needsCleanup then
			for i = #instances - 1, 0, -1 do
				local inst = instances[i + 1]
				if inst.state == CameraShakeState.Inactive and inst.deleteOnInactive then
					local _i = i
					-- ▼ Array.unorderedRemove ▼
					local _index = _i + 1
					local _length = #instances
					local _value = instances[_index]
					if _value ~= nil then
						instances[_index] = instances[_length]
						instances[_length] = nil
					end
					-- ▲ Array.unorderedRemove ▲
				end
			end
		end
		local totalOffset = Vector3.new(ox, oy, oz)
		local totalRotation = Vector3.new(rx, ry, rz)
		if self._callback then
			self._callback(totalOffset, totalRotation, totalZoom)
		else
			self:_defaultCallback(totalOffset, totalRotation, totalZoom)
		end
	end
	function CameraShaker:_defaultCallback(offset, rotation, zoom)
		local camera = Workspace.CurrentCamera
		if not camera then
			return nil
		end
		local _cFrame = camera.CFrame
		local _cFrame_1 = CFrame.new(offset)
		local _arg0 = CFrame.Angles(math.rad(rotation.X), math.rad(rotation.Y), math.rad(rotation.Z))
		camera.CFrame = _cFrame * _cFrame_1 * _arg0
		if zoom ~= 0 then
			camera.FieldOfView = self._originalFOV + zoom
		end
	end
	function CameraShaker:shake(instance)
		local _arg0 = not self._destroyed
		assert(_arg0, "CameraShaker: Cannot shake on a destroyed shaker")
		local __instances = self._instances
		local _instance = instance
		table.insert(__instances, _instance)
		return instance
	end
	function CameraShaker:shakeOnce(magnitude, roughness, fadeIn, fadeOut, positionInfluence, rotationInfluence, zoomIntensity)
		if fadeIn == nil then
			fadeIn = 0
		end
		if fadeOut == nil then
			fadeOut = 0
		end
		local _arg0 = not self._destroyed
		assert(_arg0, "CameraShaker: Cannot shakeOnce on a destroyed shaker")
		local _arg0_1 = magnitude >= 0
		local _arg1 = `CameraShaker: magnitude must be >= 0, got {magnitude}`
		assert(_arg0_1, _arg1)
		local _arg0_2 = roughness >= 0
		local _arg1_1 = `CameraShaker: roughness must be >= 0, got {roughness}`
		assert(_arg0_2, _arg1_1)
		local _arg0_3 = fadeIn >= 0
		local _arg1_2 = `CameraShaker: fadeIn must be >= 0, got {fadeIn}`
		assert(_arg0_3, _arg1_2)
		local _arg0_4 = fadeOut >= 0
		local _arg1_3 = `CameraShaker: fadeOut must be >= 0, got {fadeOut}`
		assert(_arg0_4, _arg1_3)
		local instance = CameraShakeInstance.new({
			magnitude = magnitude,
			roughness = roughness,
			fadeInDuration = fadeIn,
			fadeOutDuration = fadeOut,
			positionInfluence = positionInfluence,
			rotationInfluence = rotationInfluence,
			zoomIntensity = zoomIntensity,
		})
		instance.sustain = false
		if fadeIn > 0 then
			instance.state = CameraShakeState.FadingIn
			instance.currentFadeTime = 0
		else
			instance.currentFadeTime = 1
			instance.state = if fadeOut > 0 then CameraShakeState.FadingOut else CameraShakeState.Inactive
		end
		return self:shake(instance)
	end
	function CameraShaker:shakeSustained(instance)
		local _arg0 = not self._destroyed
		assert(_arg0, "CameraShaker: Cannot shakeSustained on a destroyed shaker")
		instance:startFadeIn(instance.fadeInDuration)
		return self:shake(instance)
	end
	function CameraShaker:stopAllSustained(fadeOutTime)
		for _, instance in self._instances do
			if instance.state == CameraShakeState.Sustained or instance.state == CameraShakeState.FadingIn then
				local _condition = fadeOutTime
				if _condition == nil then
					_condition = instance.fadeOutDuration
				end
				instance:startFadeOut(_condition)
			end
		end
	end
	CameraShaker._nextId = 0
end
return {
	CameraShaker = CameraShaker,
}
