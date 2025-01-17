require('dotenv').config();

//limitation by Telegram; more in a row won't be shown
const MAX_COLUMNS = 8;

class Button {
    static make(text) {
        return new Button(text, text);
    }

    static makeWithCount(text, count) {
        var callback_data = text;
        if(count > 0) {
            text += ' ' + count;
        }
        return new Button(text, callback_data);
    }

    constructor(text, callback_data = undefined) {
        this.text = text;
        this.callback_data = callback_data;
    }
}

function makeInlineKeyboard(buttons, maxColumns = MAX_COLUMNS) {
    var keyboard = [];
    var totalButtons = buttons.length;
    var i = 0;

    while(i < totalButtons) {
        keyboard.push(buttons.slice(i, i + maxColumns));
        i += maxColumns;
    }

    return {inline_keyboard: keyboard};
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
    Button: Button,
    makeInlineKeyboard: makeInlineKeyboard,
}