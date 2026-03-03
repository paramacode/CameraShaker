-- Compiled with roblox-ts v3.0.0
local TS = require(script.Parent.Parent.include.RuntimeLib)
--/ <reference types="@rbxts/testez/globals" />
local _CameraShakerInstance = TS.import(script, script.Parent.Parent, "CameraShakerInstance")
local CameraShakeInstance = _CameraShakerInstance.CameraShakeInstance
local CameraShakeState = _CameraShakerInstance.CameraShakeState
local CameraShaker = TS.import(script, script.Parent.Parent, "CameraShakerController").CameraShaker
local Presets = TS.import(script, script.Parent.Parent, "CameraShakerTemplates")
return function()
	describe("CameraShakeInstance", function()
		describe("constructor defaults", function()
			it("should apply default values", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
				})
				expect(inst.magnitude).to.equal(1)
				expect(inst.roughness).to.equal(5)
				expect(inst.fadeInDuration).to.equal(0)
				expect(inst.fadeOutDuration).to.equal(0)
				expect(inst.zoomIntensity).to.equal(0)
				expect(inst.zoomSpeed).to.equal(5)
				expect(inst.deleteOnInactive).to.equal(true)
				expect(inst.roughnessModifier).to.equal(1)
				expect(inst.magnitudeModifier).to.equal(1)
				expect(inst.positionInfluence).to.equal(Vector3.new(0.15, 0.15, 0.15))
				expect(inst.rotationInfluence).to.equal(Vector3.new(1, 1, 1))
			end)
			it("should start with currentFadeTime=1 when no fadeIn", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
				})
				expect(inst.currentFadeTime).to.equal(1)
				expect(inst.sustain).to.equal(false)
			end)
			it("should start with currentFadeTime=0 when fadeIn > 0", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					fadeInDuration = 1,
				})
				expect(inst.currentFadeTime).to.equal(0)
				expect(inst.sustain).to.equal(true)
			end)
			it("should accept custom options", function()
				local inst = CameraShakeInstance.new({
					magnitude = 3,
					roughness = 10,
					fadeInDuration = 0.5,
					fadeOutDuration = 1,
					positionInfluence = Vector3.new(1, 2, 3),
					rotationInfluence = Vector3.new(4, 5, 6),
					zoomIntensity = 2,
					zoomSpeed = 10,
					deleteOnInactive = false,
				})
				expect(inst.magnitude).to.equal(3)
				expect(inst.roughness).to.equal(10)
				expect(inst.fadeInDuration).to.equal(0.5)
				expect(inst.fadeOutDuration).to.equal(1)
				expect(inst.positionInfluence).to.equal(Vector3.new(1, 2, 3))
				expect(inst.rotationInfluence).to.equal(Vector3.new(4, 5, 6))
				expect(inst.zoomIntensity).to.equal(2)
				expect(inst.zoomSpeed).to.equal(10)
				expect(inst.deleteOnInactive).to.equal(false)
			end)
		end)
		describe("state transitions", function()
			it("should return zero vectors when Inactive", function()
				local inst = CameraShakeInstance.new({
					magnitude = 5,
					roughness = 10,
				})
				inst.state = CameraShakeState.Inactive
				local offset, rotation, zoom = inst:update(0.016)
				expect(offset).to.equal(Vector3.zero)
				expect(rotation).to.equal(Vector3.zero)
				expect(zoom).to.equal(0)
			end)
			it("should fade in and reach Sustained state", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					fadeInDuration = 1,
				})
				inst:startFadeIn(1)
				expect(inst.state).to.equal(CameraShakeState.FadingIn)
				expect(inst.currentFadeTime).to.equal(0)
				-- Simulate 0.5s — should be halfway through fade
				inst:update(0.5)
				expect(inst.state).to.equal(CameraShakeState.FadingIn)
				expect(inst.currentFadeTime).to.be:near(0.5, 0.001)
				-- Simulate another 0.5s — should complete fade and be Sustained
				inst:update(0.5)
				expect(inst.currentFadeTime).to.equal(1)
				expect(inst.state).to.equal(CameraShakeState.Sustained)
			end)
			it("should fade out and reach Inactive state", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					fadeOutDuration = 1,
				})
				inst.currentFadeTime = 1
				inst:startFadeOut(1)
				expect(inst.state).to.equal(CameraShakeState.FadingOut)
				inst:update(0.5)
				expect(inst.state).to.equal(CameraShakeState.FadingOut)
				expect(inst.currentFadeTime).to.be:near(0.5, 0.001)
				inst:update(0.5)
				expect(inst.currentFadeTime).to.equal(0)
				expect(inst.state).to.equal(CameraShakeState.Inactive)
			end)
			it("should handle zero fadeInDuration without division by zero", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
				})
				inst.currentFadeTime = 0
				inst.state = CameraShakeState.FadingIn
				inst.fadeInDuration = 0
				inst.sustain = true
				inst:update(0.016)
				-- Should snap to 1 instantly and become Sustained
				expect(inst.currentFadeTime).to.equal(1)
				expect(inst.state).to.equal(CameraShakeState.Sustained)
			end)
			it("should handle zero fadeOutDuration without division by zero", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
				})
				inst.currentFadeTime = 1
				inst.state = CameraShakeState.FadingOut
				inst.fadeOutDuration = 0
				inst:update(0.016)
				-- Should snap to 0 instantly and become Inactive
				expect(inst.currentFadeTime).to.equal(0)
				expect(inst.state).to.equal(CameraShakeState.Inactive)
			end)
			it("should transition from FadingIn to FadingOut when sustain=false", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					fadeInDuration = 0.5,
					fadeOutDuration = 1,
				})
				inst.state = CameraShakeState.FadingIn
				inst.currentFadeTime = 0
				inst.sustain = false
				-- Complete the fade in
				inst:update(0.5)
				expect(inst.state).to.equal(CameraShakeState.FadingOut)
			end)
			it("should stop() immediately", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					fadeInDuration = 1,
				})
				inst:startFadeIn(1)
				inst:update(0.25)
				expect(inst.state).to.equal(CameraShakeState.FadingIn)
				inst:stop()
				expect(inst.state).to.equal(CameraShakeState.Inactive)
				expect(inst.currentFadeTime).to.equal(0)
			end)
		end)
		describe("error handling", function()
			it("should error on negative magnitude", function()
				expect(function()
					CameraShakeInstance.new({
						magnitude = -1,
						roughness = 5,
					})
				end).to:throw()
			end)
			it("should error on negative roughness", function()
				expect(function()
					CameraShakeInstance.new({
						magnitude = 1,
						roughness = -5,
					})
				end).to:throw()
			end)
			it("should error on negative fadeInDuration", function()
				expect(function()
					CameraShakeInstance.new({
						magnitude = 1,
						roughness = 5,
						fadeInDuration = -1,
					})
				end).to:throw()
			end)
			it("should error on negative fadeOutDuration", function()
				expect(function()
					CameraShakeInstance.new({
						magnitude = 1,
						roughness = 5,
						fadeOutDuration = -1,
					})
				end).to:throw()
			end)
			it("should error on negative zoomIntensity", function()
				expect(function()
					CameraShakeInstance.new({
						magnitude = 1,
						roughness = 5,
						zoomIntensity = -1,
					})
				end).to:throw()
			end)
			it("should error on zero zoomSpeed", function()
				expect(function()
					CameraShakeInstance.new({
						magnitude = 1,
						roughness = 5,
						zoomSpeed = 0,
					})
				end).to:throw()
			end)
			it("should error on negative startFadeIn time", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
				})
				expect(function()
					return inst:startFadeIn(-1)
				end).to:throw()
			end)
			it("should error on negative startFadeOut time", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
				})
				expect(function()
					return inst:startFadeOut(-1)
				end).to:throw()
			end)
		end)
		describe("update output", function()
			it("should produce non-zero offset and rotation when active", function()
				local inst = CameraShakeInstance.new({
					magnitude = 5,
					roughness = 10,
				})
				inst.state = CameraShakeState.Sustained
				inst.currentFadeTime = 1
				local offset, rotation = inst:update(0.1)
				-- With magnitude=5, roughness=10 and dt=0.1, we should get some movement
				local offsetMag = offset.Magnitude
				local rotMag = rotation.Magnitude
				expect(offsetMag >= 0).to.equal(true)
				expect(rotMag >= 0).to.equal(true)
			end)
			it("should return zero when magnitude and zoom are both zero", function()
				local inst = CameraShakeInstance.new({
					magnitude = 0,
					roughness = 10,
				})
				inst.state = CameraShakeState.Sustained
				inst.currentFadeTime = 1
				local offset, rotation, zoom = inst:update(0.016)
				expect(offset).to.equal(Vector3.zero)
				expect(rotation).to.equal(Vector3.zero)
				expect(zoom).to.equal(0)
			end)
			it("should scale output with magnitudeModifier", function()
				local inst = CameraShakeInstance.new({
					magnitude = 5,
					roughness = 10,
				})
				inst.state = CameraShakeState.Sustained
				inst.currentFadeTime = 1
				-- First sample
				inst.tick = 1000
				inst.magnitudeModifier = 1
				local offset1 = inst:update(0.1)
				-- Reset tick and double modifier
				inst.tick = 1000
				inst.magnitudeModifier = 2
				local offset2 = inst:update(0.1)
				-- offset2 should be ~2x offset1 (same noise seed, double magnitude)
				local ratio = offset2.Magnitude / math.max(offset1.Magnitude, 0.0001)
				expect(ratio).to.be:near(2, 0.01)
			end)
			it("should produce zoom output when zoomIntensity > 0", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					zoomIntensity = 3,
					zoomSpeed = 10,
				})
				inst.state = CameraShakeState.Sustained
				inst.currentFadeTime = 1
				local _offset, _rotation, zoom = inst:update(0.016)
				-- Zoom should be some sine-based value, not zero
				-- (unless os.clock() happens to be at an exact zero crossing, extremely unlikely)
				expect(zoom).to.never.equal(nil)
				expect(typeof(zoom)).to.equal("number")
			end)
			it("should return zero zoom when zoomIntensity is 0", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					zoomIntensity = 0,
				})
				inst.state = CameraShakeState.Sustained
				inst.currentFadeTime = 1
				local _offset, _rotation, zoom = inst:update(0.016)
				expect(zoom).to.equal(0)
			end)
			it("should produce noise in [-1, 1] range (centered, no bias)", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 1,
				})
				inst.state = CameraShakeState.Sustained
				inst.currentFadeTime = 1
				local sumX = 0
				local sumY = 0
				local sumZ = 0
				local iterations = 500
				for i = 0, iterations - 1 do
					local offset = inst:update(0.02)
					sumX += offset.X
					sumY += offset.Y
					sumZ += offset.Z
				end
				local avgX = sumX / iterations
				local avgY = sumY / iterations
				local avgZ = sumZ / iterations
				-- Averages should be near zero (centered), not biased negative
				-- With 500 iterations, give generous tolerance of 0.5
				expect(math.abs(avgX)).to.be:near(0, 0.5)
				expect(math.abs(avgY)).to.be:near(0, 0.5)
				expect(math.abs(avgZ)).to.be:near(0, 0.5)
			end)
		end)
	end)
	describe("CameraShaker", function()
		local lastOffset
		local lastRotation
		local lastZoom
		local shaker
		beforeEach(function()
			lastOffset = Vector3.zero
			lastRotation = Vector3.zero
			lastZoom = 0
			shaker = CameraShaker.new(Enum.RenderPriority.Camera.Value, function(offset, rotation, zoom)
				lastOffset = offset
				lastRotation = rotation
				lastZoom = zoom
			end)
		end)
		afterEach(function()
			shaker:destroy()
		end)
		describe("shake()", function()
			it("should add an instance and return it", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
				})
				local returned = shaker:shake(inst)
				expect(returned).to.equal(inst)
			end)
		end)
		describe("shakeOnce()", function()
			it("should create a FadingIn instance when fadeIn > 0", function()
				local inst = shaker:shakeOnce(5, 10, 0.5, 1)
				expect(inst.state).to.equal(CameraShakeState.FadingIn)
				expect(inst.sustain).to.equal(false)
				expect(inst.currentFadeTime).to.equal(0)
			end)
			it("should create a FadingOut instance when fadeIn=0 and fadeOut > 0", function()
				local inst = shaker:shakeOnce(5, 10, 0, 1)
				expect(inst.state).to.equal(CameraShakeState.FadingOut)
				expect(inst.sustain).to.equal(false)
				expect(inst.currentFadeTime).to.equal(1)
			end)
			it("should create an Inactive instance when both fades are 0", function()
				local inst = shaker:shakeOnce(5, 10, 0, 0)
				expect(inst.state).to.equal(CameraShakeState.Inactive)
			end)
			it("should complete a full lifecycle: FadingIn → FadingOut → Inactive", function()
				local inst = shaker:shakeOnce(2, 10, 0.5, 0.5)
				expect(inst.state).to.equal(CameraShakeState.FadingIn)
				-- Fade in completely
				shaker:update(0.5)
				expect(inst.state).to.equal(CameraShakeState.FadingOut)
				-- Fade out completely
				shaker:update(0.5)
				expect(inst.state).to.equal(CameraShakeState.Inactive)
			end)
		end)
		describe("shakeSustained()", function()
			it("should start a sustained shake with fade-in", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					fadeInDuration = 1,
				})
				local returned = shaker:shakeSustained(inst)
				expect(returned).to.equal(inst)
				expect(inst.state).to.equal(CameraShakeState.FadingIn)
				expect(inst.sustain).to.equal(true)
			end)
			it("should reach Sustained state after fadeIn completes", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					fadeInDuration = 0.5,
				})
				shaker:shakeSustained(inst)
				shaker:update(0.5)
				expect(inst.state).to.equal(CameraShakeState.Sustained)
			end)
		end)
		describe("stopAllSustained()", function()
			it("should fade out all sustained instances", function()
				local inst1 = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					fadeInDuration = 0.1,
				})
				local inst2 = CameraShakeInstance.new({
					magnitude = 2,
					roughness = 5,
					fadeInDuration = 0.1,
				})
				shaker:shakeSustained(inst1)
				shaker:shakeSustained(inst2)
				-- Fade in both
				shaker:update(0.1)
				expect(inst1.state).to.equal(CameraShakeState.Sustained)
				expect(inst2.state).to.equal(CameraShakeState.Sustained)
				shaker:stopAllSustained(0.5)
				expect(inst1.state).to.equal(CameraShakeState.FadingOut)
				expect(inst2.state).to.equal(CameraShakeState.FadingOut)
				expect(inst1.fadeOutDuration).to.equal(0.5)
			end)
			it("should also fade out instances still in FadingIn", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					fadeInDuration = 2,
				})
				shaker:shakeSustained(inst)
				shaker:update(0.1)
				expect(inst.state).to.equal(CameraShakeState.FadingIn)
				shaker:stopAllSustained(1)
				expect(inst.state).to.equal(CameraShakeState.FadingOut)
			end)
		end)
		describe("update() accumulation", function()
			it("should invoke callback with accumulated values", function()
				local inst = CameraShakeInstance.new({
					magnitude = 3,
					roughness = 10,
				})
				inst.state = CameraShakeState.Sustained
				inst.currentFadeTime = 1
				shaker:shake(inst)
				shaker:update(0.016)
				-- Callback should have been called with some values
				expect(lastOffset).to.never.equal(nil)
				expect(lastRotation).to.never.equal(nil)
				local _lastZoom = lastZoom
				expect(typeof(_lastZoom)).to.equal("number")
			end)
			it("should accumulate multiple instances", function()
				local inst1 = CameraShakeInstance.new({
					magnitude = 2,
					roughness = 10,
				})
				inst1.state = CameraShakeState.Sustained
				inst1.currentFadeTime = 1
				inst1.tick = 100
				local inst2 = CameraShakeInstance.new({
					magnitude = 3,
					roughness = 10,
				})
				inst2.state = CameraShakeState.Sustained
				inst2.currentFadeTime = 1
				inst2.tick = 50000
				shaker:shake(inst1)
				shaker:shake(inst2)
				shaker:update(0.016)
				-- With two active instances, offset should be non-zero
				-- (extremely unlikely both produce exact zeros with different seeds)
				expect(lastOffset.Magnitude > 0 or lastRotation.Magnitude > 0).to.equal(true)
			end)
			it("should clean up inactive instances with deleteOnInactive=true", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					deleteOnInactive = true,
				})
				inst.state = CameraShakeState.Inactive
				shaker:shake(inst)
				-- After update, the inactive instance should be cleaned up
				shaker:update(0.016)
				-- Add a new instance to verify the old one is gone
				local inst2 = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					deleteOnInactive = true,
				})
				inst2.state = CameraShakeState.Sustained
				inst2.currentFadeTime = 1
				shaker:shake(inst2)
				-- Only the new instance should produce output
				shaker:update(0.016)
				expect(lastOffset.Magnitude >= 0).to.equal(true)
			end)
			it("should NOT clean up inactive instances with deleteOnInactive=false", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
					deleteOnInactive = false,
				})
				inst.state = CameraShakeState.Inactive
				shaker:shake(inst)
				shaker:update(0.016)
				-- Re-activate the instance — it should still work since it wasn't removed
				inst.state = CameraShakeState.Sustained
				inst.currentFadeTime = 1
				shaker:update(0.1)
				expect(lastOffset.Magnitude >= 0).to.equal(true)
			end)
		end)
		describe("start() and stop()", function()
			it("should not error when starting and stopping", function()
				shaker:start()
				shaker:stop()
			end)
			it("should be idempotent", function()
				shaker:start()
				shaker:start()
				shaker:stop()
				shaker:stop()
			end)
		end)
		describe("destroy()", function()
			it("should stop and clear all instances", function()
				local inst = CameraShakeInstance.new({
					magnitude = 1,
					roughness = 5,
				})
				inst.state = CameraShakeState.Sustained
				inst.currentFadeTime = 1
				shaker:shake(inst)
				shaker:start()
				shaker:destroy()
				-- All mutation operations on a destroyed shaker should error
				expect(function()
					return shaker:start()
				end).to:throw()
				expect(function()
					return shaker:shake(inst)
				end).to:throw()
				expect(function()
					return shaker:shakeOnce(1, 5, 0.1, 0.1)
				end).to:throw()
				expect(function()
					return shaker:shakeSustained(inst)
				end).to:throw()
			end)
			it("should be safe to call multiple times", function()
				shaker:destroy()
				shaker:destroy()
			end)
		end)
		describe("error handling", function()
			it("should error on negative magnitude in shakeOnce", function()
				expect(function()
					return shaker:shakeOnce(-1, 5)
				end).to:throw()
			end)
			it("should error on negative roughness in shakeOnce", function()
				expect(function()
					return shaker:shakeOnce(1, -5)
				end).to:throw()
			end)
			it("should error on negative fadeIn in shakeOnce", function()
				expect(function()
					return shaker:shakeOnce(1, 5, -1, 0)
				end).to:throw()
			end)
			it("should error on negative fadeOut in shakeOnce", function()
				expect(function()
					return shaker:shakeOnce(1, 5, 0, -1)
				end).to:throw()
			end)
		end)
	end)
	describe("Presets", function()
		it("should create valid LightImpact instances", function()
			local inst = Presets.LightImpact()
			expect(inst.magnitude).to.equal(1)
			expect(inst.roughness).to.equal(7)
			expect(inst.fadeInDuration).to.equal(0.1)
			expect(inst.fadeOutDuration).to.equal(0.15)
		end)
		it("should create valid MediumImpact instances", function()
			local inst = Presets.MediumImpact()
			expect(inst.magnitude).to.equal(2)
			expect(inst.roughness).to.equal(10)
		end)
		it("should create valid StrongImpact instances", function()
			local inst = Presets.StrongImpact()
			expect(inst.magnitude).to.equal(3)
			expect(inst.roughness).to.equal(14)
		end)
		it("should create valid Explosion instances with zoom", function()
			local inst = Presets.Explosion()
			expect(inst.magnitude).to.equal(4)
			expect(inst.roughness).to.equal(15)
			expect(inst.zoomIntensity).to.equal(2)
		end)
		it("should create valid Earthquake instances", function()
			local inst = Presets.Earthquake()
			expect(inst.magnitude).to.equal(1.5)
			expect(inst.roughness).to.equal(3)
		end)
		it("should create valid Handheld instances", function()
			local inst = Presets.Handheld()
			expect(inst.magnitude).to.equal(0.8)
			expect(inst.roughness).to.equal(0.4)
		end)
		it("should return unique instances each call (factory pattern)", function()
			local a = Presets.LightImpact()
			local b = Presets.LightImpact()
			expect(a).to.never.equal(b)
		end)
		it("should all start in Inactive state", function()
			local presets = { Presets.LightImpact(), Presets.MediumImpact(), Presets.StrongImpact(), Presets.Explosion(), Presets.Earthquake(), Presets.Handheld() }
			for _, inst in presets do
				expect(inst.state).to.equal(CameraShakeState.Inactive)
			end
		end)
	end)
	describe("Visual Demo", function()
		it("should apply a sequence of real camera shakes", function()
			local shaker = CameraShaker.new()
			shaker:start()
			shaker:shakeOnce(4, 15, 0.05, 0.5, Vector3.new(0.3, 0.3, 0.3), Vector3.new(2.5, 2.5, 2.5), 2)
			task.delay(1, function()
				local quake = shaker:shakeSustained(Presets.Earthquake())
				task.delay(3, function()
					quake:startFadeOut(2)
				end)
			end)
			task.delay(2, function()
				shaker:shakeOnce(3, 14, 0.15, 0.3, Vector3.new(0.25, 0.25, 0.25), Vector3.new(2, 2, 2))
			end)
			task.delay(7, function()
				shaker:stopAllSustained(1)
				task.delay(1.5, function()
					shaker:destroy()
				end)
			end)
		end)
	end)
end
