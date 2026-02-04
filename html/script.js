let formInputs = {};
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

const OpenMenu = (data) => {
    if (!data) return;
    
    // Set menu size
    $(".main-wrapper").removeClass("size-small size-normal size-large");
    let sizeClass = "size-normal";
    if (data.size === "large") sizeClass = "size-large";
    if (data.size === "small") sizeClass = "size-small";
    $(".main-wrapper").addClass(sizeClass);
    
    $(".main-wrapper").fadeIn(250);
    
    let form = `
        <form id="zoo-input-form">
            <div class="header" id="drag-handle">
                <span class="header-title">${data.header || "Menu"}</span>
                <button type="button" class="close-btn" onclick="CancelMenu()">✕</button>
            </div>
            <div class="divider"></div>
            <div class="form-content">
    `;
    
    data.inputs.forEach(item => {
        switch(item.type) {
            case "text": form += renderTextInput(item); break;
            case "password": form += renderPasswordInput(item); break;
            case "number": form += renderNumberInput(item); break;
            case "select": form += renderSelectInput(item); break;
            case "radio": form += renderRadioInput(item); break;
            case "checkbox": form += renderCheckboxInput(item); break;
            case "slider": form += renderSliderInput(item); break;
            case "players": form += renderPlayersInput(item); break;
            case "currency": form += renderCurrencyInput(item); break;
            case "confirm": form += renderConfirmInput(item); break;
            // NEW TYPES
            case "textarea": form += renderTextareaInput(item); break;
            case "color": form += renderColorInput(item); break;
            case "date": form += renderDateInput(item); break;
            case "time": form += renderTimeInput(item); break;
            case "label": form += renderLabelInput(item); break;
            case "separator": form += renderSeparator(item); break;
            case "image": form += renderImageInput(item); break;
            case "progress": form += renderProgressInput(item); break;
            case "buttons": form += renderButtonsInput(item); break;
            case "toggle": form += renderToggleInput(item); break;
            case "stepper": form += renderStepperInput(item); break;
            case "rating": form += renderRatingInput(item); break;
            case "labelToggle": form += renderLabelToggleInput(item); break;
            // ADMIN MENU TYPES
            case "menubuttons": form += renderMenuButtonsInput(item); break;
            case "playerlist": form += renderPlayerListInput(item); break;
            case "actiongrid": form += renderActionGridInput(item); break;
            case "playerinfo": form += renderPlayerInfoInput(item); break;
            case "presets": form += renderPresetsInput(item); break;
        }
    });
    
    // Build footer - hide confirm button if submitText is empty
    let footerHtml = `
            </div>
            <div class="divider"></div>
            <div class="footer">
                <button type="button" class="btn btn-cancel" onclick="CancelMenu()">${data.cancelText || "Cancel"}</button>
    `;
    
    if (data.submitText && data.submitText !== "") {
        footerHtml += `<button type="submit" class="btn btn-confirm">${data.submitText}</button>`;
    }
    
    footerHtml += `
            </div>
        </form>
    `;
    
    form += footerHtml;
    
    $(".main-wrapper").html(form);
    
    $("#zoo-input-form").on("change", function(e) {
        if ($(e.target).attr("type") == "checkbox") {
            formInputs[$(e.target).attr("value")] = $(e.target).is(":checked") ? "true" : "false";
        } else {
            formInputs[$(e.target).attr("name")] = $(e.target).val();
        }
    });
    
    $("#zoo-input-form").on("submit", async function(e) {
        e.preventDefault();
        await $.post(`https://${GetParentResourceName()}/buttonSubmit`, JSON.stringify({ data: formInputs }));
        CloseMenu();
    });
};

// ============================================
// INPUT RENDERERS
// ============================================

const renderTextInput = (item) => {
    formInputs[item.name] = item.default || "";
    return `<div class="input-group"><div class="input-wrapper"><input placeholder="${item.text}" type="text" class="form-control" name="${item.name}" ${item.default ? `value="${item.default}"` : ""} ${item.isRequired ? "required" : ""}/></div></div>`;
};

const renderPasswordInput = (item) => {
    formInputs[item.name] = item.default || "";
    return `<div class="input-group"><div class="input-wrapper"><input placeholder="${item.text}" type="password" class="form-control" name="${item.name}" ${item.isRequired ? "required" : ""}/></div></div>`;
};

const renderNumberInput = (item) => {
    formInputs[item.name] = item.default || "";
    return `<div class="input-group"><div class="input-wrapper"><input placeholder="${item.text}" type="text" inputmode="decimal" class="form-control number-input" name="${item.name}" ${item.default ? `value="${item.default}"` : ""} ${item.isRequired ? "required" : ""}/></div></div>`;
};

const renderSelectInput = (item) => {
    formInputs[item.name] = item.options[0].value;
    let opts = item.options.map(o => `<option value="${o.value}" ${item.default == o.value ? "selected" : ""}>${o.text}</option>`).join("");
    return `<div class="input-group"><div class="select-wrapper"><select class="form-select" name="${item.name}">${opts}</select></div></div>`;
};

const renderRadioInput = (item) => {
    formInputs[item.name] = item.options[0].value;
    let radios = item.options.map((o, i) => `<label class="radio-item"><input type="radio" name="${item.name}" value="${o.value}" ${i == 0 ? "checked" : ""}><span>${o.text}</span></label>`).join("");
    return `<div class="input-group"><div class="radio-group">${radios}</div></div>`;
};

const renderCheckboxInput = (item) => {
    let checks = item.options.map(o => {
        formInputs[o.value] = o.checked ? "true" : "false";
        return `<label class="checkbox-item"><input type="checkbox" name="${item.name}" value="${o.value}" ${o.checked ? "checked" : ""}><span>${o.text}</span></label>`;
    }).join("");
    return `<div class="input-group"><div class="checkbox-group">${checks}</div></div>`;
};

// ============================================
// SLIDER INPUT (NEW)
// ============================================

const renderSliderInput = (item) => {
    const min = item.min || 0;
    const max = item.max || 100;
    const step = item.step || 0.01;
    const defaultVal = item.default || ((min + max) / 2);
    
    formInputs[item.name] = defaultVal.toString();
    
    return `
        <div class="input-group slider-group">
            <div class="slider-label">
                <span class="slider-text">${item.text}</span>
                <span class="slider-value" id="slider-val-${item.name}">${defaultVal}</span>
            </div>
            <div class="slider-wrapper">
                <input type="range" 
                    class="form-slider" 
                    name="${item.name}" 
                    min="${min}" 
                    max="${max}" 
                    step="${step}" 
                    value="${defaultVal}"
                    oninput="updateSlider(this, '${item.name}', ${item.preview || false})"
                />
                <div class="slider-range">
                    <span>${min}</span>
                    <span>${max}</span>
                </div>
            </div>
        </div>
    `;
};;

// Debounce for preview (prevents crash from too many requests)
let previewTimeout = null;

// Update slider value display and send preview
const updateSlider = (slider, name, sendPreview) => {
    const value = parseFloat(slider.value).toFixed(2);
    $(`#slider-val-${name}`).text(value);
    formInputs[name] = value;
    
    // Sync presets with slider
    syncPresetsWithSlider(parseFloat(value));
    
    // Send preview to game with debounce (prevents crash)
    if (sendPreview) {
        clearTimeout(previewTimeout);
        previewTimeout = setTimeout(() => {
            $.post(`https://${GetParentResourceName()}/previewScale`, JSON.stringify({ scale: value }));
        }, 100);
    }
};

// Sync presets buttons with slider value
const syncPresetsWithSlider = (sliderValue) => {
    let closestPreset = null;
    let closestDiff = Infinity;
    
    $('.preset-btn').each(function() {
        const presetValue = parseFloat($(this).attr('onclick').match(/'([0-9.]+)'/)?.[1] || 0);
        const diff = Math.abs(presetValue - sliderValue);
        
        if (diff < closestDiff) {
            closestDiff = diff;
            closestPreset = $(this);
        }
    });
    
    // Highlight closest preset (within 0.03 tolerance)
    $('.preset-btn').removeClass('selected');
    if (closestPreset && closestDiff <= 0.03) {
        closestPreset.addClass('selected');
    }
};

// ============================================
// PLAYERS LIST INPUT (NEW)
// ============================================

const renderPlayersInput = (item) => {
    // item.players = [{id: 1, name: "John Doe"}, ...]
    const players = item.players || [];
    
    if (players.length === 0) {
        formInputs[item.name] = "";
        return `<div class="input-group"><div class="input-wrapper no-players"><span>No players online</span></div></div>`;
    }
    
    formInputs[item.name] = players[0].id.toString();
    
    let opts = players.map(p => 
        `<option value="${p.id}">[${p.id}] ${p.name}</option>`
    ).join("");
    
    return `
        <div class="input-group">
            <div class="select-wrapper players-select">
                <select class="form-select" name="${item.name}">
                    ${opts}
                </select>
            </div>
        </div>
    `;
};

// ============================================
// CURRENCY INPUT (CASH/GOLD - BUTTONS ONLY)
// ============================================

const renderCurrencyInput = (item) => {
    const cashAmount = item.cashAmount || 0;
    const goldAmount = item.goldAmount || 0;
    
    formInputs[item.name] = 'cash';
    
    return `
        <div class="input-group">
            <div class="currency-group">
                <label class="currency-item currency-cash selected" data-value="cash" onclick="selectCurrency(this, '${item.name}')">
                    <img src="img/icon_cash.png" alt="Cash" class="currency-icon"/>
                    <span class="currency-amount">$${cashAmount}</span>
                </label>
                <label class="currency-item currency-gold" data-value="gold" onclick="selectCurrency(this, '${item.name}')">
                    <img src="img/icon_gold.png" alt="Gold" class="currency-icon"/>
                    <span class="currency-amount">${goldAmount}</span>
                </label>
            </div>
            <input type="hidden" name="${item.name}" value="cash"/>
        </div>
    `;
};

// Select currency function
const selectCurrency = (element, name) => {
    // Remove selected from all
    $(element).closest('.currency-group').find('.currency-item').removeClass('selected');
    // Add selected to clicked
    $(element).addClass('selected');
    // Update hidden input
    const value = $(element).data('value');
    $(`input[name="${name}"]`).val(value);
    formInputs[name] = value;
};

// ============================================
// CONFIRM DIALOG (with icon and warnings)
// ============================================

const renderConfirmInput = (item) => {
    // item.icon, item.title, item.description, item.warnings[]
    const icon = item.icon || '⚠️';
    const title = item.title || 'Confirm';
    const description = item.description || '';
    const warnings = item.warnings || [];
    
    let warningsHtml = '';
    if (warnings.length > 0) {
        warningsHtml = warnings.map(w => `<div class="confirm-warning">• ${w}</div>`).join('');
    }
    
    return `
        <div class="input-group confirm-group">
            <div class="confirm-icon">${icon}</div>
            <div class="confirm-title">${title}</div>
            ${description ? `<div class="confirm-description">${description}</div>` : ''}
            ${warningsHtml ? `<div class="confirm-warnings">${warningsHtml}</div>` : ''}
        </div>
    `;
};

// ============================================
// TEXTAREA INPUT
// ============================================

const renderTextareaInput = (item) => {
    formInputs[item.name] = item.default || "";
    const rows = item.rows || 4;
    const maxLength = item.maxLength ? `maxlength="${item.maxLength}"` : '';
    const placeholder = item.placeholder || item.text || '';
    return `
        <div class="input-group">
            ${item.label ? `<label class="input-label">${item.label}</label>` : ''}
            <div class="textarea-wrapper">
                <textarea class="form-textarea" name="${item.name}" rows="${rows}" 
                    placeholder="${placeholder}" ${maxLength}
                    ${item.isRequired ? "required" : ""}>${item.default || ""}</textarea>
            </div>
        </div>
    `;
};

// ============================================
// COLOR INPUT
// ============================================

const renderColorInput = (item) => {
    const defaultColor = item.default || "#c9a84c";
    formInputs[item.name] = defaultColor;
    return `
        <div class="input-group">
            ${item.label ? `<label class="input-label">${item.label}</label>` : ''}
            <div class="color-wrapper">
                <span class="color-text">${item.text || 'Color'}</span>
                <input type="color" class="form-color" name="${item.name}" value="${defaultColor}"/>
                <span class="color-value" id="color-val-${item.name}">${defaultColor}</span>
            </div>
        </div>
    `;
};

// Update color value display
$(document).on("input", ".form-color", function() {
    const name = $(this).attr("name");
    const value = $(this).val();
    $(`#color-val-${name}`).text(value);
    formInputs[name] = value;
});

// ============================================
// DATE INPUT
// ============================================

const renderDateInput = (item) => {
    formInputs[item.name] = item.default || "";
    return `
        <div class="input-group">
            <div class="input-wrapper">
                <input type="date" class="form-control form-date" name="${item.name}" 
                    ${item.default ? `value="${item.default}"` : ""}
                    ${item.min ? `min="${item.min}"` : ""}
                    ${item.max ? `max="${item.max}"` : ""}
                    ${item.isRequired ? "required" : ""}/>
            </div>
        </div>
    `;
};

// ============================================
// TIME INPUT
// ============================================

const renderTimeInput = (item) => {
    formInputs[item.name] = item.default || "";
    return `
        <div class="input-group">
            <div class="input-wrapper">
                <input type="time" class="form-control form-time" name="${item.name}" 
                    ${item.default ? `value="${item.default}"` : ""}
                    ${item.isRequired ? "required" : ""}/>
            </div>
        </div>
    `;
};

// ============================================
// LABEL (Display text only)
// ============================================

const renderLabelInput = (item) => {
    const align = item.align || 'center';
    const size = item.size || 'normal';
    return `
        <div class="input-group label-group label-${align} label-${size}">
            ${item.icon ? `<span class="label-icon">${item.icon}</span>` : ''}
            <span class="label-text">${item.text}</span>
            ${item.subtext ? `<span class="label-subtext">${item.subtext}</span>` : ''}
        </div>
    `;
};

// ============================================
// SEPARATOR (Divider line)
// ============================================

const renderSeparator = (item) => {
    return `
        <div class="input-group separator-group">
            ${item.text ? `<span class="separator-text">${item.text}</span>` : '<div class="separator-line"></div>'}
        </div>
    `;
};

// ============================================
// IMAGE DISPLAY
// ============================================

const renderImageInput = (item) => {
    const width = item.width || '100%';
    const height = item.height || 'auto';
    return `
        <div class="input-group image-group">
            <img src="${item.src}" alt="${item.alt || ''}" 
                style="width: ${width}; height: ${height}; object-fit: contain; border-radius: 5px;"/>
            ${item.caption ? `<span class="image-caption">${item.caption}</span>` : ''}
        </div>
    `;
};

// ============================================
// PROGRESS BAR
// ============================================

const renderProgressInput = (item) => {
    const value = item.value || 0;
    const max = item.max || 100;
    const percent = Math.round((value / max) * 100);
    return `
        <div class="input-group progress-group">
            ${item.label ? `<label class="input-label">${item.label}</label>` : ''}
            <div class="progress-wrapper">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
                <span class="progress-text">${item.text || `${percent}%`}</span>
            </div>
        </div>
    `;
};

// ============================================
// CUSTOM BUTTONS
// ============================================

const renderButtonsInput = (item) => {
    // item.buttons = [{text, value, style}]
    const buttons = item.buttons || [];
    formInputs[item.name] = '';
    
    let buttonsHtml = buttons.map(btn => {
        const style = btn.style || 'default';
        return `<button type="button" class="custom-btn custom-btn-${style}" 
            onclick="selectButton('${item.name}', '${btn.value}')">${btn.text}</button>`;
    }).join('');
    
    return `
        <div class="input-group buttons-group">
            <div class="buttons-wrapper">
                ${buttonsHtml}
            </div>
            <input type="hidden" name="${item.name}" value=""/>
        </div>
    `;
};

const selectButton = (name, value) => {
    formInputs[name] = value;
    $(`.buttons-group input[name="${name}"]`).val(value);
    // Highlight selected
    $(`.buttons-group .custom-btn`).removeClass('selected');
    event.target.classList.add('selected');
};

// ============================================
// TOGGLE SWITCH
// ============================================

const renderToggleInput = (item) => {
    const checked = item.default || false;
    formInputs[item.name] = checked ? "true" : "false";
    
    return `
        <div class="input-group toggle-group">
            <span class="toggle-label">${item.text || ''}</span>
            <label class="toggle-switch">
                <input type="checkbox" name="${item.name}" ${checked ? 'checked' : ''} 
                    onchange="formInputs['${item.name}'] = this.checked ? 'true' : 'false'"/>
                <span class="toggle-slider"></span>
            </label>
        </div>
    `;
};

// ============================================
// LABEL WITH TOGGLE (Label + Icon Toggle Button)
// ============================================

const renderLabelToggleInput = (item) => {
    const checked = item.default !== false;  // Default ON
    const iconOn = item.iconOn || '💡';
    const iconOff = item.iconOff || '🔦';
    
    formInputs[item.name] = checked ? "true" : "false";
    
    return `
        <div class="input-group label-toggle-group">
            <span class="label-toggle-text">${item.text || ''}</span>
            <button type="button" class="label-toggle-btn ${checked ? 'active' : ''}" 
                id="label-toggle-${item.name}"
                onclick="toggleLabelButton('${item.name}', '${iconOn}', '${iconOff}')">
                ${checked ? iconOn : iconOff}
            </button>
        </div>
    `;
};

const toggleLabelButton = (name, iconOn, iconOff) => {
    const btn = document.getElementById('label-toggle-' + name);
    const isActive = btn.classList.contains('active');
    
    if (isActive) {
        btn.classList.remove('active');
        btn.innerHTML = iconOff;
        formInputs[name] = "false";
    } else {
        btn.classList.add('active');
        btn.innerHTML = iconOn;
        formInputs[name] = "true";
    }
    
    // Send toggle event to game
    $.post(`https://${GetParentResourceName()}/toggleLight`, JSON.stringify({ enabled: !isActive }));
};

// ============================================
// NUMBER STEPPER (+/-)
// ============================================

const renderStepperInput = (item) => {
    const min = item.min || 0;
    const max = item.max || 100;
    const step = item.step || 1;
    const defaultVal = item.default || min;
    
    formInputs[item.name] = defaultVal.toString();
    
    return `
        <div class="input-group stepper-group">
            <span class="stepper-label">${item.text || ''}</span>
            <div class="stepper-wrapper">
                <button type="button" class="stepper-btn stepper-minus" 
                    onclick="stepValue('${item.name}', ${-step}, ${min}, ${max})">−</button>
                <span class="stepper-value" id="stepper-val-${item.name}">${defaultVal}</span>
                <button type="button" class="stepper-btn stepper-plus" 
                    onclick="stepValue('${item.name}', ${step}, ${min}, ${max})">+</button>
            </div>
            <input type="hidden" name="${item.name}" value="${defaultVal}"/>
        </div>
    `;
};

const stepValue = (name, change, min, max) => {
    let current = parseFloat(formInputs[name]) || 0;
    let newVal = Math.max(min, Math.min(max, current + change));
    // Round to avoid floating point issues
    newVal = Math.round(newVal * 100) / 100;
    formInputs[name] = newVal.toString();
    $(`#stepper-val-${name}`).text(newVal);
    $(`input[name="${name}"]`).val(newVal);
};

// ============================================
// STAR RATING
// ============================================

const renderRatingInput = (item) => {
    const max = item.max || 5;
    const defaultVal = item.default || 0;
    formInputs[item.name] = defaultVal.toString();
    
    let stars = '';
    for (let i = 1; i <= max; i++) {
        const filled = i <= defaultVal ? 'filled' : '';
        stars += `<span class="rating-star ${filled}" data-value="${i}" 
            onclick="setRating('${item.name}', ${i}, ${max})">★</span>`;
    }
    
    return `
        <div class="input-group rating-group">
            ${item.text ? `<span class="rating-label">${item.text}</span>` : ''}
            <div class="rating-wrapper" id="rating-${item.name}">
                ${stars}
            </div>
            <input type="hidden" name="${item.name}" value="${defaultVal}"/>
        </div>
    `;
};

const setRating = (name, value, max) => {
    formInputs[name] = value.toString();
    $(`input[name="${name}"]`).val(value);
    
    // Update stars visual
    $(`#rating-${name} .rating-star`).each(function(index) {
        if (index < value) {
            $(this).addClass('filled');
        } else {
            $(this).removeClass('filled');
        }
    });
};

// ============================================
// NUMBER INPUT FILTER
// ============================================

$(document).on("input", ".number-input", function() {
    this.value = this.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
});

// ============================================
// CLOSE & CANCEL
// ============================================

const CloseMenu = () => {
    $(".main-wrapper").fadeOut(150, function() {
        $(this).css({ left: "2%", top: "50%", transform: "translateY(-50%)" });
    });
    formInputs = {};
};

const CancelMenu = () => {
    $.post(`https://${GetParentResourceName()}/closeMenu`);
    CloseMenu();
};

// ============================================
// EVENT LISTENERS
// ============================================

window.addEventListener("message", e => {
    if (e.data.action === "OPEN_MENU") OpenMenu(e.data.data);
    if (e.data.action === "CLOSE_MENU") CloseMenu();
});

document.onkeyup = e => { if (e.key === "Escape") CancelMenu(); };

// ============================================
// DRAGGABLE
// ============================================

$(document).on("mousedown", "#drag-handle", function(e) {
    if ($(e.target).hasClass("close-btn")) return;
    isDragging = true;
    const wrapper = $(".main-wrapper");
    const offset = wrapper.offset();
    dragOffset = { x: e.clientX - offset.left, y: e.clientY - offset.top };
    wrapper.css("cursor", "grabbing");
});

$(document).on("mousemove", function(e) {
    if (!isDragging) return;
    const wrapper = $(".main-wrapper");
    const x = Math.max(0, Math.min(e.clientX - dragOffset.x, $(window).width() - wrapper.outerWidth()));
    const y = Math.max(0, Math.min(e.clientY - dragOffset.y, $(window).height() - wrapper.outerHeight()));
    wrapper.css({ left: x + "px", top: y + "px", transform: "none" });
});

$(document).on("mouseup", () => {
    if (isDragging) {
        isDragging = false;
        $(".main-wrapper").css("cursor", "default");
    }
});

// ============================================
// MENU BUTTONS (3 Big Buttons for Admin Main Menu)
// ============================================

const renderMenuButtonsInput = (item) => {
    const buttons = item.buttons || [];
    formInputs[item.name] = '';
    
    let buttonsHtml = buttons.map(btn => {
        return `
            <div class="menu-btn" onclick="selectMenuButton('${item.name}', '${btn.value}')">
                <span class="menu-btn-icon">${btn.icon || '📋'}</span>
                <div class="menu-btn-text">
                    <span class="menu-btn-label">${btn.label}</span>
                    <span class="menu-btn-desc">${btn.desc || ''}</span>
                </div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="input-group menubuttons-group">
            ${buttonsHtml}
            <input type="hidden" name="${item.name}" value=""/>
        </div>
    `;
};

const selectMenuButton = (name, value) => {
    formInputs[name] = value;
    $(`input[name="${name}"]`).val(value);
    // Auto submit
    setTimeout(() => {
        $("#zoo-input-form").submit();
    }, 150);
};

// ============================================
// PLAYER LIST (Clickable Player Cards)
// ============================================

const renderPlayerListInput = (item) => {
    const players = item.players || [];
    formInputs[item.name] = '';
    
    if (players.length === 0) {
        return `
            <div class="input-group playerlist-group">
                <div class="no-players">No players found</div>
            </div>
        `;
    }
    
    let playersHtml = players.map(p => {
        const statusIcon = p.banned ? '🔴' : (p.online !== false ? '🟢' : '⚫');
        const statusText = p.banned ? 'BANNED' : (p.scale ? p.scale.toFixed(2) : '1.00');
        const bannedClass = p.banned ? 'banned' : '';
        
        return `
            <div class="player-card ${bannedClass}" onclick="selectPlayer('${item.name}', '${p.id}')">
                <span class="player-id">[${p.id}]</span>
                <span class="player-name">${p.firstname || ''} ${p.lastname || ''}</span>
                <span class="player-status">${statusIcon} ${statusText}</span>
            </div>
        `;
    }).join('');
    
    return `
        <div class="input-group playerlist-group">
            <div class="players-scroll">
                ${playersHtml}
            </div>
            <input type="hidden" name="${item.name}" value=""/>
        </div>
    `;
};

const selectPlayer = (name, playerId) => {
    formInputs[name] = playerId;
    $(`input[name="${name}"]`).val(playerId);
    $('.player-card').removeClass('selected');
    event.currentTarget.classList.add('selected');
    // Auto submit
    setTimeout(() => {
        $("#zoo-input-form").submit();
    }, 150);
};

// ============================================
// ACTION GRID (6 Action Buttons)
// ============================================

const renderActionGridInput = (item) => {
    const actions = item.actions || [];
    formInputs[item.name] = '';
    
    let actionsHtml = actions.map(a => {
        return `
            <div class="action-btn" onclick="selectAction('${item.name}', '${a.value}')">
                <span class="action-icon">${a.icon || '⚡'}</span>
                <span class="action-label">${a.label}</span>
            </div>
        `;
    }).join('');
    
    return `
        <div class="input-group actiongrid-group">
            <div class="action-grid">
                ${actionsHtml}
            </div>
            <input type="hidden" name="${item.name}" value=""/>
        </div>
    `;
};

const selectAction = (name, value) => {
    formInputs[name] = value;
    $(`input[name="${name}"]`).val(value);
    $('.action-btn').removeClass('selected');
    event.currentTarget.classList.add('selected');
    // Auto submit
    setTimeout(() => {
        $("#zoo-input-form").submit();
    }, 150);
};

// ============================================
// PLAYER INFO (Display Player Details)
// ============================================

const renderPlayerInfoInput = (item) => {
    const player = item.player || {};
    const statusIcon = player.banned ? '🔴' : '🟢';
    const statusText = player.banned ? 'BANNED' : 'Active';
    
    return `
        <div class="input-group playerinfo-group">
            <div class="player-info-box">
                <div class="info-row">
                    <span class="info-label">Player ID:</span>
                    <span class="info-value">${player.id || '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${player.firstname || ''} ${player.lastname || ''}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Scale:</span>
                    <span class="info-value">${player.scale ? player.scale.toFixed(2) : '1.00'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value">${statusIcon} ${statusText}</span>
                </div>
            </div>
        </div>
    `;
};

// ============================================
// PRESETS (6 Height Preset Buttons)
// ============================================

const renderPresetsInput = (item) => {
    const presets = item.presets || [];
    const sliderName = item.sliderName || 'scale';
    const sendPreview = item.preview !== false;
    
    formInputs[item.name] = '';
    
    let presetsHtml = presets.map(p => {
        return `
            <div class="preset-btn" onclick="selectPreset('${item.name}', '${p.value}', '${sliderName}', ${sendPreview})">
                <span class="preset-label">${p.label}</span>
            </div>
        `;
    }).join('');
    
    return `
        <div class="input-group presets-group">
            <div class="presets-grid">
                ${presetsHtml}
            </div>
            <input type="hidden" name="${item.name}" value=""/>
        </div>
    `;
};

const selectPreset = (name, value, sliderName, sendPreview) => {
    formInputs[name] = value;
    $(`input[name="${name}"]`).val(value);
    
    // Update slider if exists
    const slider = $(`input[name="${sliderName}"]`);
    if (slider.length) {
        slider.val(value);
        $(`#slider-val-${sliderName}`).text(parseFloat(value).toFixed(2));
        formInputs[sliderName] = value;
    }
    
    // Highlight selected
    $('.preset-btn').removeClass('selected');
    event.currentTarget.classList.add('selected');
    
    // Send preview
    if (sendPreview) {
        $.post(`https://${GetParentResourceName()}/previewScale`, JSON.stringify({ scale: value }));
    }
};
