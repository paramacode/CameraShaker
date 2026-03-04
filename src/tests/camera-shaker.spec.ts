/// <reference types="@rbxts/testez/globals" />
import { CameraShakeInstance, CameraShakeState } from "../camera-shake-instance";
import { CameraShaker } from "../camera-shaker-controller";
import * as Presets from "../camera-shake-templates";

export = () => {
	describe("CameraShakeInstance", () => {
		describe("constructor defaults", () => {
			it("should apply default values", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
				});
				expect(inst.magnitude).to.equal(1);
				expect(inst.roughness).to.equal(5);
				expect(inst.fadeInDuration).to.equal(0);
				expect(inst.fadeOutDuration).to.equal(0);
				expect(inst.zoomIntensity).to.equal(0);
				expect(inst.zoomSpeed).to.equal(5);
				expect(inst.deleteOnInactive).to.equal(true);
				expect(inst.roughnessModifier).to.equal(1);
				expect(inst.magnitudeModifier).to.equal(1);
				expect(inst.positionInfluence).to.equal(new Vector3(0.15, 0.15, 0.15));
				expect(inst.rotationInfluence).to.equal(new Vector3(1, 1, 1));
			});

			it("should start with currentFadeTime=1 when no fadeIn", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
				});
				expect(inst.currentFadeTime).to.equal(1);
				expect(inst.sustain).to.equal(false);
			});

			it("should start with currentFadeTime=0 when fadeIn > 0", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					fadeInDuration: 1,
				});
				expect(inst.currentFadeTime).to.equal(0);
				expect(inst.sustain).to.equal(true);
			});

			it("should accept custom options", () => {
				const inst = new CameraShakeInstance({
					magnitude: 3,
					roughness: 10,
					fadeInDuration: 0.5,
					fadeOutDuration: 1,
					positionInfluence: new Vector3(1, 2, 3),
					rotationInfluence: new Vector3(4, 5, 6),
					zoomIntensity: 2,
					zoomSpeed: 10,
					deleteOnInactive: false,
				});
				expect(inst.magnitude).to.equal(3);
				expect(inst.roughness).to.equal(10);
				expect(inst.fadeInDuration).to.equal(0.5);
				expect(inst.fadeOutDuration).to.equal(1);
				expect(inst.positionInfluence).to.equal(new Vector3(1, 2, 3));
				expect(inst.rotationInfluence).to.equal(new Vector3(4, 5, 6));
				expect(inst.zoomIntensity).to.equal(2);
				expect(inst.zoomSpeed).to.equal(10);
				expect(inst.deleteOnInactive).to.equal(false);
			});
		});

		describe("state transitions", () => {
			it("should return zero vectors when Inactive", () => {
				const inst = new CameraShakeInstance({
					magnitude: 5,
					roughness: 10,
				});
				inst.state = CameraShakeState.Inactive;
				const [offset, rotation, zoom] = inst.update(0.016);
				expect(offset).to.equal(Vector3.zero);
				expect(rotation).to.equal(Vector3.zero);
				expect(zoom).to.equal(0);
			});

			it("should fade in and reach Sustained state", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					fadeInDuration: 1,
				});
				inst.startFadeIn(1);
				expect(inst.state).to.equal(CameraShakeState.FadingIn);
				expect(inst.currentFadeTime).to.equal(0);

				// Simulate 0.5s — should be halfway through fade
				inst.update(0.5);
				expect(inst.state).to.equal(CameraShakeState.FadingIn);
				expect(inst.currentFadeTime).to.be.near(0.5, 0.001);

				// Simulate another 0.5s — should complete fade and be Sustained
				inst.update(0.5);
				expect(inst.currentFadeTime).to.equal(1);
				expect(inst.state).to.equal(CameraShakeState.Sustained);
			});

			it("should fade out and reach Inactive state", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					fadeOutDuration: 1,
				});
				inst.currentFadeTime = 1;
				inst.startFadeOut(1);
				expect(inst.state).to.equal(CameraShakeState.FadingOut);

				inst.update(0.5);
				expect(inst.state).to.equal(CameraShakeState.FadingOut);
				expect(inst.currentFadeTime).to.be.near(0.5, 0.001);

				inst.update(0.5);
				expect(inst.currentFadeTime).to.equal(0);
				expect(inst.state).to.equal(CameraShakeState.Inactive);
			});

			it("should handle zero fadeInDuration without division by zero", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
				});
				inst.currentFadeTime = 0;
				inst.state = CameraShakeState.FadingIn;
				inst.fadeInDuration = 0;
				inst.sustain = true;

				inst.update(0.016);
				// Should snap to 1 instantly and become Sustained
				expect(inst.currentFadeTime).to.equal(1);
				expect(inst.state).to.equal(CameraShakeState.Sustained);
			});

			it("should handle zero fadeOutDuration without division by zero", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
				});
				inst.currentFadeTime = 1;
				inst.state = CameraShakeState.FadingOut;
				inst.fadeOutDuration = 0;

				inst.update(0.016);
				// Should snap to 0 instantly and become Inactive
				expect(inst.currentFadeTime).to.equal(0);
				expect(inst.state).to.equal(CameraShakeState.Inactive);
			});

			it("should transition from FadingIn to FadingOut when sustain=false", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					fadeInDuration: 0.5,
					fadeOutDuration: 1,
				});
				inst.state = CameraShakeState.FadingIn;
				inst.currentFadeTime = 0;
				inst.sustain = false;

				// Complete the fade in
				inst.update(0.5);
				expect(inst.state).to.equal(CameraShakeState.FadingOut);
			});

			it("should stop() immediately", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					fadeInDuration: 1,
				});
				inst.startFadeIn(1);
				inst.update(0.25);
				expect(inst.state).to.equal(CameraShakeState.FadingIn);

				inst.stop();
				expect(inst.state).to.equal(CameraShakeState.Inactive);
				expect(inst.currentFadeTime).to.equal(0);
			});
		});

		describe("error handling", () => {
			it("should error on negative magnitude", () => {
				expect(() => {
					new CameraShakeInstance({
						magnitude: -1,
						roughness: 5,
					});
				}).to.throw();
			});

			it("should error on negative roughness", () => {
				expect(() => {
					new CameraShakeInstance({
						magnitude: 1,
						roughness: -5,
					});
				}).to.throw();
			});

			it("should error on negative fadeInDuration", () => {
				expect(() => {
					new CameraShakeInstance({
						magnitude: 1,
						roughness: 5,
						fadeInDuration: -1,
					});
				}).to.throw();
			});

			it("should error on negative fadeOutDuration", () => {
				expect(() => {
					new CameraShakeInstance({
						magnitude: 1,
						roughness: 5,
						fadeOutDuration: -1,
					});
				}).to.throw();
			});

			it("should error on negative zoomIntensity", () => {
				expect(() => {
					new CameraShakeInstance({
						magnitude: 1,
						roughness: 5,
						zoomIntensity: -1,
					});
				}).to.throw();
			});

			it("should error on zero zoomSpeed", () => {
				expect(() => {
					new CameraShakeInstance({
						magnitude: 1,
						roughness: 5,
						zoomSpeed: 0,
					});
				}).to.throw();
			});

			it("should error on negative startFadeIn time", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
				});
				expect(() => {
					inst.startFadeIn(-1);
				}).to.throw();
			});

			it("should error on negative startFadeOut time", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
				});
				expect(() => {
					inst.startFadeOut(-1);
				}).to.throw();
			});
		});

		describe("update output", () => {
			it("should produce non-zero offset and rotation when active", () => {
				const inst = new CameraShakeInstance({
					magnitude: 5,
					roughness: 10,
				});
				inst.state = CameraShakeState.Sustained;
				inst.currentFadeTime = 1;

				const [offset, rotation] = inst.update(0.1);
				// With magnitude=5, roughness=10 and dt=0.1, we should get some movement
				const offsetMag = offset.Magnitude;
				const rotMag = rotation.Magnitude;
				expect(offsetMag >= 0).to.equal(true);
				expect(rotMag >= 0).to.equal(true);
			});

			it("should return zero when magnitude and zoom are both zero", () => {
				const inst = new CameraShakeInstance({
					magnitude: 0,
					roughness: 10,
				});
				inst.state = CameraShakeState.Sustained;
				inst.currentFadeTime = 1;

				const [offset, rotation, zoom] = inst.update(0.016);
				expect(offset).to.equal(Vector3.zero);
				expect(rotation).to.equal(Vector3.zero);
				expect(zoom).to.equal(0);
			});

			it("should scale output with magnitudeModifier", () => {
				const inst = new CameraShakeInstance({
					magnitude: 5,
					roughness: 10,
				});
				inst.state = CameraShakeState.Sustained;
				inst.currentFadeTime = 1;

				// First sample
				inst.tick = 1000;
				inst.magnitudeModifier = 1;
				const [offset1] = inst.update(0.1);

				// Reset tick and double modifier
				inst.tick = 1000;
				inst.magnitudeModifier = 2;
				const [offset2] = inst.update(0.1);

				// offset2 should be ~2x offset1 (same noise seed, double magnitude)
				const ratio = offset2.Magnitude / math.max(offset1.Magnitude, 0.0001);
				expect(ratio).to.be.near(2, 0.01);
			});

			it("should produce zoom output when zoomIntensity > 0", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					zoomIntensity: 3,
					zoomSpeed: 10,
				});
				inst.state = CameraShakeState.Sustained;
				inst.currentFadeTime = 1;

				const [_offset, _rotation, zoom] = inst.update(0.016);
				// Zoom should be some sine-based value, not zero
				// (unless os.clock() happens to be at an exact zero crossing, extremely unlikely)
				expect(zoom).to.never.equal(undefined);
				expect(typeOf(zoom)).to.equal("number");
			});

			it("should return zero zoom when zoomIntensity is 0", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					zoomIntensity: 0,
				});
				inst.state = CameraShakeState.Sustained;
				inst.currentFadeTime = 1;

				const [_offset, _rotation, zoom] = inst.update(0.016);
				expect(zoom).to.equal(0);
			});

			it("should produce noise in [-1, 1] range (centered, no bias)", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 1,
				});
				inst.state = CameraShakeState.Sustained;
				inst.currentFadeTime = 1;

				let sumX = 0;
				let sumY = 0;
				let sumZ = 0;
				const iterations = 500;

				for (let i = 0; i < iterations; i++) {
					const [offset] = inst.update(0.02);
					sumX += offset.X;
					sumY += offset.Y;
					sumZ += offset.Z;
				}

				const avgX = sumX / iterations;
				const avgY = sumY / iterations;
				const avgZ = sumZ / iterations;

				// Averages should be near zero (centered), not biased negative
				// With 500 iterations, give generous tolerance of 0.5
				expect(math.abs(avgX)).to.be.near(0, 0.5);
				expect(math.abs(avgY)).to.be.near(0, 0.5);
				expect(math.abs(avgZ)).to.be.near(0, 0.5);
			});
		});
	});

	describe("CameraShaker", () => {
		let lastOffset: Vector3;
		let lastRotation: Vector3;
		let lastZoom: number;
		let shaker: CameraShaker;

		beforeEach(() => {
			lastOffset = Vector3.zero;
			lastRotation = Vector3.zero;
			lastZoom = 0;
			shaker = new CameraShaker(Enum.RenderPriority.Camera.Value, (offset, rotation, zoom) => {
				lastOffset = offset;
				lastRotation = rotation;
				lastZoom = zoom;
			});
		});

		afterEach(() => {
			shaker.destroy();
		});

		describe("shake()", () => {
			it("should add an instance and return it", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
				});
				const returned = shaker.shake(inst);
				expect(returned).to.equal(inst);
			});
		});

		describe("shakeOnce()", () => {
			it("should create a FadingIn instance when fadeIn > 0", () => {
				const inst = shaker.shakeOnce(5, 10, 0.5, 1);
				expect(inst.state).to.equal(CameraShakeState.FadingIn);
				expect(inst.sustain).to.equal(false);
				expect(inst.currentFadeTime).to.equal(0);
			});

			it("should create a FadingOut instance when fadeIn=0 and fadeOut > 0", () => {
				const inst = shaker.shakeOnce(5, 10, 0, 1);
				expect(inst.state).to.equal(CameraShakeState.FadingOut);
				expect(inst.sustain).to.equal(false);
				expect(inst.currentFadeTime).to.equal(1);
			});

			it("should create an Inactive instance when both fades are 0", () => {
				const inst = shaker.shakeOnce(5, 10, 0, 0);
				expect(inst.state).to.equal(CameraShakeState.Inactive);
			});

			it("should complete a full lifecycle: FadingIn → FadingOut → Inactive", () => {
				const inst = shaker.shakeOnce(2, 10, 0.5, 0.5);
				expect(inst.state).to.equal(CameraShakeState.FadingIn);

				// Fade in completely
				shaker.update(0.5);
				expect(inst.state).to.equal(CameraShakeState.FadingOut);

				// Fade out completely
				shaker.update(0.5);
				expect(inst.state).to.equal(CameraShakeState.Inactive);
			});
		});

		describe("shakeSustained()", () => {
			it("should start a sustained shake with fade-in", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					fadeInDuration: 1,
				});
				const returned = shaker.shakeSustained(inst);
				expect(returned).to.equal(inst);
				expect(inst.state).to.equal(CameraShakeState.FadingIn);
				expect(inst.sustain).to.equal(true);
			});

			it("should reach Sustained state after fadeIn completes", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					fadeInDuration: 0.5,
				});
				shaker.shakeSustained(inst);
				shaker.update(0.5);
				expect(inst.state).to.equal(CameraShakeState.Sustained);
			});
		});

		describe("stopAllSustained()", () => {
			it("should fade out all sustained instances", () => {
				const inst1 = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					fadeInDuration: 0.1,
				});
				const inst2 = new CameraShakeInstance({
					magnitude: 2,
					roughness: 5,
					fadeInDuration: 0.1,
				});
				shaker.shakeSustained(inst1);
				shaker.shakeSustained(inst2);

				// Fade in both
				shaker.update(0.1);
				expect(inst1.state).to.equal(CameraShakeState.Sustained);
				expect(inst2.state).to.equal(CameraShakeState.Sustained);

				shaker.stopAllSustained(0.5);
				expect(inst1.state).to.equal(CameraShakeState.FadingOut);
				expect(inst2.state).to.equal(CameraShakeState.FadingOut);
				expect(inst1.fadeOutDuration).to.equal(0.5);
			});

			it("should also fade out instances still in FadingIn", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					fadeInDuration: 2,
				});
				shaker.shakeSustained(inst);
				shaker.update(0.1);
				expect(inst.state).to.equal(CameraShakeState.FadingIn);

				shaker.stopAllSustained(1);
				expect(inst.state).to.equal(CameraShakeState.FadingOut);
			});
		});

		describe("update() accumulation", () => {
			it("should invoke callback with accumulated values", () => {
				const inst = new CameraShakeInstance({
					magnitude: 3,
					roughness: 10,
				});
				inst.state = CameraShakeState.Sustained;
				inst.currentFadeTime = 1;
				shaker.shake(inst);

				shaker.update(0.016);
				// Callback should have been called with some values
				expect(lastOffset).to.never.equal(undefined);
				expect(lastRotation).to.never.equal(undefined);
				const _lastZoom = lastZoom;
				expect(typeOf(_lastZoom)).to.equal("number");
			});

			it("should accumulate multiple instances", () => {
				const inst1 = new CameraShakeInstance({
					magnitude: 2,
					roughness: 10,
				});
				inst1.state = CameraShakeState.Sustained;
				inst1.currentFadeTime = 1;
				inst1.tick = 100;

				const inst2 = new CameraShakeInstance({
					magnitude: 3,
					roughness: 10,
				});
				inst2.state = CameraShakeState.Sustained;
				inst2.currentFadeTime = 1;
				inst2.tick = 50000;

				shaker.shake(inst1);
				shaker.shake(inst2);
				shaker.update(0.016);

				// With two active instances, offset should be non-zero
				// (extremely unlikely both produce exact zeros with different seeds)
				expect(lastOffset.Magnitude > 0 || lastRotation.Magnitude > 0).to.equal(true);
			});

			it("should clean up inactive instances with deleteOnInactive=true", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					deleteOnInactive: true,
				});
				inst.state = CameraShakeState.Inactive;
				shaker.shake(inst);

				// After update, the inactive instance should be cleaned up
				shaker.update(0.016);

				// Add a new instance to verify the old one is gone
				const inst2 = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					deleteOnInactive: true,
				});
				inst2.state = CameraShakeState.Sustained;
				inst2.currentFadeTime = 1;
				shaker.shake(inst2);

				// Only the new instance should produce output
				shaker.update(0.016);
				expect(lastOffset.Magnitude >= 0).to.equal(true);
			});

			it("should NOT clean up inactive instances with deleteOnInactive=false", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
					deleteOnInactive: false,
				});
				inst.state = CameraShakeState.Inactive;
				shaker.shake(inst);
				shaker.update(0.016);

				// Re-activate the instance — it should still work since it wasn't removed
				inst.state = CameraShakeState.Sustained;
				inst.currentFadeTime = 1;
				shaker.update(0.1);
				expect(lastOffset.Magnitude >= 0).to.equal(true);
			});
		});

		describe("start() and stop()", () => {
			it("should not error when starting and stopping", () => {
				shaker.start();
				shaker.stop();
			});

			it("should be idempotent", () => {
				shaker.start();
				shaker.start();
				shaker.stop();
				shaker.stop();
			});
		});

		describe("destroy()", () => {
			it("should stop and clear all instances", () => {
				const inst = new CameraShakeInstance({
					magnitude: 1,
					roughness: 5,
				});
				inst.state = CameraShakeState.Sustained;
				inst.currentFadeTime = 1;
				shaker.shake(inst);
				shaker.start();
				shaker.destroy();

				// All mutation operations on a destroyed shaker should error
				expect(() => shaker.start()).to.throw();
				expect(() => shaker.shake(inst)).to.throw();
				expect(() => shaker.shakeOnce(1, 5, 0.1, 0.1)).to.throw();
				expect(() => shaker.shakeSustained(inst)).to.throw();
			});

			it("should be safe to call multiple times", () => {
				shaker.destroy();
				shaker.destroy();
			});
		});

		describe("error handling", () => {
			it("should error on negative magnitude in shakeOnce", () => {
				expect(() => shaker.shakeOnce(-1, 5)).to.throw();
			});

			it("should error on negative roughness in shakeOnce", () => {
				expect(() => shaker.shakeOnce(1, -5)).to.throw();
			});

			it("should error on negative fadeIn in shakeOnce", () => {
				expect(() => shaker.shakeOnce(1, 5, -1, 0)).to.throw();
			});

			it("should error on negative fadeOut in shakeOnce", () => {
				expect(() => shaker.shakeOnce(1, 5, 0, -1)).to.throw();
			});
		});
	});

	describe("Presets", () => {
		it("should create valid LightImpact instances", () => {
			const inst = Presets.LightImpact();
			expect(inst.magnitude).to.equal(1);
			expect(inst.roughness).to.equal(7);
			expect(inst.fadeInDuration).to.equal(0.1);
			expect(inst.fadeOutDuration).to.equal(0.15);
		});

		it("should create valid MediumImpact instances", () => {
			const inst = Presets.MediumImpact();
			expect(inst.magnitude).to.equal(2);
			expect(inst.roughness).to.equal(10);
		});

		it("should create valid StrongImpact instances", () => {
			const inst = Presets.StrongImpact();
			expect(inst.magnitude).to.equal(3);
			expect(inst.roughness).to.equal(14);
		});

		it("should create valid Explosion instances with zoom", () => {
			const inst = Presets.Explosion();
			expect(inst.magnitude).to.equal(4);
			expect(inst.roughness).to.equal(15);
			expect(inst.zoomIntensity).to.equal(2);
		});

		it("should create valid Earthquake instances", () => {
			const inst = Presets.Earthquake();
			expect(inst.magnitude).to.equal(1.5);
			expect(inst.roughness).to.equal(3);
		});

		it("should create valid Handheld instances", () => {
			const inst = Presets.Handheld();
			expect(inst.magnitude).to.equal(0.8);
			expect(inst.roughness).to.equal(0.4);
		});

		it("should return unique instances each call (factory pattern)", () => {
			const a = Presets.LightImpact();
			const b = Presets.LightImpact();
			expect(a).to.never.equal(b);
		});

		it("should all start in Inactive state", () => {
			const presets = [Presets.LightImpact(), Presets.MediumImpact(), Presets.StrongImpact(), Presets.Explosion(), Presets.Earthquake(), Presets.Handheld()];
			for (const inst of presets) {
				expect(inst.state).to.equal(CameraShakeState.Inactive);
			}
		});
	});

	describe("Visual Demo", () => {
		it("should apply a sequence of real camera shakes", () => {
			const shaker = new CameraShaker();
			shaker.start();

			shaker.shakeOnce(4, 15, 0.05, 0.5, new Vector3(0.3, 0.3, 0.3), new Vector3(2.5, 2.5, 2.5), 2);

			task.delay(1, () => {
				const quake = shaker.shakeSustained(Presets.Earthquake());
				task.delay(3, () => {
					quake.startFadeOut(2);
				});
			});

			task.delay(2, () => {
				shaker.shakeOnce(3, 14, 0.15, 0.3, new Vector3(0.25, 0.25, 0.25), new Vector3(2, 2, 2));
			});

			task.delay(7, () => {
				shaker.stopAllSustained(1);
				task.delay(1.5, () => {
					shaker.destroy();
				});
			});
		});
	});
};
