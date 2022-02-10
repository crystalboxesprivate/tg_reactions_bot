require('dotenv').config();

const MAX_COLUMNS = 8;
const emojiThumbsUp = '\ud83d\udc4d';
const emojiThumbsDown = '\ud83d\udc4e';
const defaultButtons = [emojiThumbsUp, emojiThumbsDown];

class Button {
    static make(text) {
        return new Button(text);
    }

    constructor(text, count = undefined) {
        this.text = text;
        this.callback_data = text;
    }
}

function makeInlineKeyboard(buttons, maxColumns = MAX_COLUMNS) {
    buttons = buttons.map(Button.make);

    var keyboard = [];
    var totalButtons = buttons.length;
    var i = 0;

    while(i < totalButtons) {
        keyboard.push(buttons.slice(i, i + maxColumns));
        i += maxColumns;
    }

    return {inline_keyboard: keyboard};
}

function makeDefaultKeyboard(maxColumns = MAX_COLUMNS) {;
    return makeInlineKeyboard(defaultButtons, maxColumns);
}

class Keyboard {
    buttons = [];
    layout = [[]];
    maxColumns = 1;

    makeLayout(buttons) {
        buttons = [...new Set(buttons)];
        buttons = buttons.map(Button.make);

        var i = 0;
        while(i < totalButtons) {
            layout.push(buttons.slice(i, i + this.maxColumns));
            i += this.maxColumns;
        }

        return layout;
    }

    constructor(buttons, maxColumns = MAX_COLUMNS) {
        this.buttons = buttons;
        this.maxColumns = maxColumns;
        this.layout = this.makeLayout(buttons);
    }

    toApi() {
        return {inline_keyboard: this.layout};
    }

    update(newReaction, oldReaction = undefined) {
        
    }
}

module.exports = {
    defaultButtons: defaultButtons,
    makeInlineKeyboard: makeInlineKeyboard,
    makeDefaultKeyboard: makeDefaultKeyboard,
}