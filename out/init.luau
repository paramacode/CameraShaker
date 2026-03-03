-- Compiled with roblox-ts v3.0.0
local TS = require(script.include.RuntimeLib)
local exports = {}
exports.CameraShaker = TS.import(script, script, "CameraShakerController").CameraShaker
local _CameraShakerInstance = TS.import(script, script, "CameraShakerInstance")
exports.CameraShakeInstance = _CameraShakerInstance.CameraShakeInstance
exports.CameraShakeState = _CameraShakerInstance.CameraShakeState
exports.Presets = TS.import(script, script, "CameraShakerTemplates")
return exports
