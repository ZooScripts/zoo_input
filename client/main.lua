local properties = nil
local previewCallback = nil

RegisterNUICallback("buttonSubmit", function(data, cb)
    PlaySoundFrontend("SELECT", "RDRO_Character_Creator_Sounds", true, 0)
    SetNuiFocus(false)
    previewCallback = nil
    properties:resolve(data.data)
    properties = nil
    cb("ok")
end)

RegisterNUICallback("closeMenu", function(_, cb)
    PlaySoundFrontend("BACK", "RDRO_Character_Creator_Sounds", true, 0)
    SetNuiFocus(false)
    previewCallback = nil
    properties:resolve(nil)
    properties = nil
    cb("ok")
end)

-- Preview callback for slider (real-time scale preview)
RegisterNUICallback("previewScale", function(data, cb)
    if previewCallback and data.scale then
        previewCallback(tonumber(data.scale))
    end
    cb("ok")
end)

-- Toggle light callback
RegisterNUICallback("toggleLight", function(data, cb)
    TriggerEvent("zoo_input:toggleLight", data.enabled)
    cb("ok")
end)

local function ShowInput(data)
    Wait(150)
    if not data then return end
    if properties then return end

    properties = promise.new()
    
    -- Store preview callback if provided
    previewCallback = data.onPreview or nil

    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "OPEN_MENU",
        data = data
    })

    return Citizen.Await(properties)
end

exports("ShowInput", ShowInput)

-- Get online players list (for Admin UI)
local function GetPlayers()
    local players = {}
    
    -- Request players from server
    local p = promise.new()
    
    TriggerServerEvent('zoo_input:getPlayers')
    
    RegisterNetEvent('zoo_input:playersList', function(list)
        p:resolve(list)
    end)
    
    -- Timeout after 2 seconds
    SetTimeout(2000, function()
        if p then p:resolve({}) end
    end)
    
    return Citizen.Await(p)
end

exports("GetPlayers", GetPlayers)

-- Test command with slider
RegisterCommand('testinput', function()
    local dialog = exports['zoo_input']:ShowInput({
        header = 'Zoo Input',
        submitText = "Confirm",
        inputs = {
            { type = 'text', name = 'playername', text = 'Player Name', isRequired = true },
            { type = 'slider', name = 'scale', text = 'Character Height', min = 0.85, max = 1.15, step = 0.01, default = 1.0, preview = true },
            { type = 'select', name = 'currency', text = 'Currency', options = {
                { text = 'Cash', value = 'cash' },
                { text = 'Gold', value = 'gold' },
            }}
        },
        onPreview = function(scale)
            print("Preview scale: " .. scale)
            -- Here you can apply preview to character
        end
    })
    
    if dialog then
        print("Result: " .. json.encode(dialog))
    else
        print("Cancelled")
    end
end, false)

-- Test command with players list
RegisterCommand('testplayers', function()
    -- Request players from server first
    TriggerServerEvent('zoo_input:getPlayers')
end, false)

RegisterNetEvent('zoo_input:playersList', function(players)
    local dialog = exports['zoo_input']:ShowInput({
        header = 'Admin Panel',
        submitText = "Execute",
        inputs = {
            { type = 'players', name = 'targetPlayer', players = players },
            { type = 'select', name = 'action', text = 'Action', options = {
                { text = 'Set Scale', value = 'setScale' },
                { text = 'Ban', value = 'ban' },
                { text = 'Kick', value = 'kick' },
            }}
        }
    })
    
    if dialog then
        print("Selected Player: " .. dialog.targetPlayer)
        print("Action: " .. dialog.action)
    end
end)
