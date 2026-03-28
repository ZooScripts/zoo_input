--[[
    ZOO INPUT - Server Side
    Get online players list
]]

-- ============================================
-- VERSION CHECK
-- ============================================

local currentVersion = GetResourceMetadata(GetCurrentResourceName(), 'version', 0)
local resourceName = "zoo_input"
local versionCheckUrl = "https://gist.githubusercontent.com/ZooScripts/e8c9541e74419b545b814e55a36b9e34/raw/zoo_input_version.json?t=" .. os.time()

CreateThread(function()
    Wait(2000)
    PerformHttpRequest(versionCheckUrl, function(err, response, headers)
        if err ~= 200 or not response then return end

        local data = json.decode(response)
        if not data or not data.version then return end

        local latest = data.version:gsub("%s+", "")

        if currentVersion == latest then
            print("^2[" .. resourceName .. "] You are running the latest version: v" .. currentVersion)
        else
            print("┌───────────────────────────────────────────────────┐")
            print("")
            print(resourceName .. ":  ^3Update found : ^1Version v" .. latest)
            print("^7Download it on https://keymaster.fivem.net/asset-grants")
            print("")
            if data.updateFiles then
                print(" ^3Update files:")
                for _, f in ipairs(data.updateFiles) do
                    print("^5 * " .. f)
                end
                print("")
            end
            print("")
            print("└──────────────── ^6zoo-scripts.tebex.io ^7────────────────┘")
        end
    end, "GET")
end)

-- ============================================
-- PLAYERS LIST
-- ============================================

RegisterNetEvent('zoo_input:getPlayers', function()
    local src = source
    local players = {}
    
    -- Get all players
    local allPlayers = GetPlayers()
    
    for _, playerId in ipairs(allPlayers) do
        local playerName = GetPlayerName(playerId)
        if playerName then
            table.insert(players, {
                id = tonumber(playerId),
                name = playerName
            })
        end
    end
    
    -- Sort by ID
    table.sort(players, function(a, b) return a.id < b.id end)
    
    -- Send to client
    TriggerClientEvent('zoo_input:playersList', src, players)
end)

-- Get players with character names (for VORP)
RegisterNetEvent('zoo_input:getPlayersVorp', function()
    local src = source
    local players = {}
    
    local allPlayers = GetPlayers()
    
    for _, playerId in ipairs(allPlayers) do
        local playerName = GetPlayerName(playerId)
        local characterName = playerName -- Default to player name
        
        -- Try to get VORP character name
        pcall(function()
            local Character = exports.vorp_core:getCore().getUser(tonumber(playerId)).getUsedCharacter
            if Character then
                local char = Character
                characterName = char.firstname .. " " .. char.lastname
            end
        end)
        
        if playerName then
            table.insert(players, {
                id = tonumber(playerId),
                name = characterName,
                steamName = playerName
            })
        end
    end
    
    -- Sort by ID
    table.sort(players, function(a, b) return a.id < b.id end)
    
    TriggerClientEvent('zoo_input:playersList', src, players)
end)
