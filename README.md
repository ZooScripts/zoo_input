# Zoo Input

A custom input/dialog system for **RedM** (Red Dead Redemption 2 roleplay framework).

## Features

- 19+ input types
- Western-themed UI (gold & brown)
- Drag-and-drop menu positioning
- Real-time preview callbacks
- VORP framework support

## Installation

1. Download and extract to your `resources` folder
2. Add `ensure zoo_input` to your `server.cfg`
3. Restart your server

## Usage

```lua
local result = exports['zoo_input']:ShowInput({
    header = "Title",
    submitText = "Confirm",
    cancelText = "Cancel",
    inputs = {
        { type = "text", name = "username", text = "Username", isRequired = true },
        { type = "number", name = "amount", text = "Amount" },
        { type = "select", name = "option", text = "Select Option", options = {
            { text = "Option 1", value = "opt1" },
            { text = "Option 2", value = "opt2" }
        }}
    }
})

if result then
    print(result.username)
    print(result.amount)
    print(result.option)
end
```

## Input Types

| Type | Description |
|------|-------------|
| `text` | Text input |
| `password` | Hidden password field |
| `number` | Numeric input |
| `select` | Dropdown menu |
| `radio` | Radio button group |
| `checkbox` | Multi-select checkboxes |
| `slider` | Range slider with preview |
| `players` | Online players dropdown |
| `currency` | Cash/Gold toggle |
| `confirm` | Warning dialog |
| `textarea` | Multi-line text |
| `color` | Color picker |
| `date` | Date picker |
| `time` | Time picker |
| `label` | Display-only text |
| `separator` | Visual divider |
| `image` | Image display |
| `progress` | Progress bar |
| `buttons` | Custom button group |
| `toggle` | On/off switch |
| `stepper` | Plus/minus number |
| `rating` | 5-star rating |

## Exports

### ShowInput
```lua
exports['zoo_input']:ShowInput(data)
```
Opens an input dialog and returns the form data.

### GetPlayers
```lua
exports['zoo_input']:GetPlayers()
```
Returns a list of online players `{id, name}`.

## Slider with Preview

```lua
local result = exports['zoo_input']:ShowInput({
    header = "Character Height",
    inputs = {
        { type = "slider", name = "scale", text = "Height", min = 0.85, max = 1.15, step = 0.01, default = 1.0, preview = true }
    },
    onPreview = function(scale)
        -- Apply preview to character in real-time
        SetPedScale(PlayerPedId(), scale)
    end
})
```

## License

MIT License - Zoo Scripts
