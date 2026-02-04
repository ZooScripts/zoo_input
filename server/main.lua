--[[
    ZOO INPUT - Server Side
    Get online players list
]]

-- ============================================
-- VERSION CHECK
-- ============================================

local currentVersion = "1.0.0"
local versionCheckUrl = "https://gist.githubusercontent.com/saleemmar/4bc5530df629743dc4836b9ed7f5721c/raw/zoo_input_version.json"

CreateThread(function()
    Wait(3000) -- Wait for server to fully start
    
    PerformHttpRequest(versionCheckUrl, function(err, response, headers)
        if response then
            local data = json.decode(response)
            
            if data and data.version then
                local latestVersion = data.version:gsub("%s+", "")
                
                if currentVersion ~= latestVersion then
                    print("^3══════════════════════════════════════════════^7")
                    print("^3       ZOO_INPUT - UPDATE AVAILABLE!          ^7")
                    print("^3══════════════════════════════════════════════^7")
                    print("^7  Current Version: ^1" .. currentVersion .. "^7")
                    print("^7  Latest Version:  ^2" .. latestVersion .. "^7")
                    print("^7                                              ^7")
                    
                    -- Show update message
                    if data.message then
                        print("^7  📝 ^5" .. data.message .. "^7")
                        print("^7                                              ^7")
                    end
                    
                    -- Show changes list
                    if data.changes and #data.changes > 0 then
                        print("^7  Changes:                                    ^7")
                        for _, change in ipairs(data.changes) do
                            print("^7  • ^6" .. change .. "^7")
                        end
                    end
                    
                    print("^3══════════════════════════════════════════════^7")
                else
                    print("^2[ZOO_INPUT]^7 ✓ You are running the latest version! ^3(v" .. currentVersion .. ")^7")
                end
            end
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
