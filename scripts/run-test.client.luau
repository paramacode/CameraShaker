local ReplicatedStorage = game:GetService("ReplicatedStorage")

local CameraShaker = ReplicatedStorage:WaitForChild("CameraShaker")

local TestEZ = require(CameraShaker.include.node_modules["@rbxts"].testez.src)

local results = TestEZ.TestBootstrap:run({
	ReplicatedStorage.CameraShaker.Tests
})

if results.failureCount > 0 then
	error(`Failed an amount of "{results.failureCount}" tests: "{results.errors}"`)
end