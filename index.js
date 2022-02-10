// require('dotenv').config();

const api = require('./modules/tgBotApi');
const keyboards = require('./modules/keyboards');
const db = require('./modules/database');


async function processBotCommand(entity, message) {
    command = message.text.slice(entity.offset, entity.offset + entity.length);
    [command, bot] = command.split('@');
    // if(bot && bot !== me.username) { return; }
    
    switch(command) {
        case '/help':
            api.sendStandardMessage(message.chat.id, command);
            break;
        case '/edit':
            let userCanEdit = true;

            if(message.chat.type !== "private") {
                const chatMember = await api.callApiMethodAsync('getChatMember', {chat_id: message.chat.id, user_id: message.from.id});
                const allowedStatuses = ['owner', 'administrator'];
                userCanEdit = allowedStatuses.includes(chatMember.status);
            }

            if(userCanEdit) {
                const restOfTheMessage = message.text.slice(entity.offset + entity.length);
                reactions = restOfTheMessage.trim().split(/\s+/);
                reactions = [...new Set(reactions)];    
                chatSettings = db.saveChatSettings(message.chat.id, {defaultReactions: reactions});
            }
            else {
                api.sendStandardMessage(message.chat.id, 'permissionAdmin', message.message_id);
            }

            break;
    }
}

async function processCallbackQuery(callback_query) {
    const {
        id, from, message, data
    } = callback_query;
    const chat_id = message.chat.id;
    const message_id = message.message_id;
    const user_id = from.id;

    const answer = {
        callback_query_id: id,
    };
    api.callApiMethod('answerCallbackQuery', answer);
    
    console.log(`id: ${id}`);
    console.log(`data: ${data}`);

    var reactionsCount = await db.getReactionsCount(chat_id, message_id);
    console.log(reactionsCount);

    var isSameReaction = false;

    var newText = callback_query.data;
    var newReactionCount = db.getReactionCount(chat_id, message_id, newText);

    var oldReaction = await db.getReaction(chat_id, message_id, user_id);
    if(oldReaction !== null) {
        var oldText = oldReaction.text;
        var oldReactionCount = db.getReactionCount(chat_id, message_id, oldText);
        isSameReaction = oldText === newText;
    }

    if(isSameReaction) {
        //
        db.deleteReaction(chat_id, message_id, user_id);
        --oldReactionCount;
    }
    else if(oldReaction !== null) {
        //...
        oldReaction.text = newText;
        oldReaction.save();
        --oldReactionCount;
        ++newReactionCount;
    }
    else {
        //...
        db.saveReaction(chat_id, message_id, user_id, newText);
        ++newReactionCount;
    }
}

async function handleUpdate(update) {
    if('message' in update && 'text' in update.message) {
        message = update.message;
        if('entities' in message) {
            const entities = message.entities;
            const commandEntities = entities.filter((entity) => (entity.type == 'bot_command'));
            
            for(entity of commandEntities) {
                processBotCommand(entity, message);
            }
        }

        return;
    }

    if('message' in update) {
        const message = update.message;
        if(message.from.is_bot) { return; }
    
        settings = await db.getChatSettings(message.chat.id);
        if(settings && (defaultReactions in settings) && settings.defaultReactions.length) {
            keyboard = keyboards.makeInlineKeyboard(settings.defaultReactions);
            api.copyWithKeyboard(message, keyboard);
        }
        else {
            // Prompt admins to add some default reactions
            // api.sendStandardMessage(message.chat.id, 'setDefaults');

            // Use a global default
            db.saveChatSettings(message.chat.id, {defaultReactions: keyboards.defaultButtons});
            keyboard = keyboards.makeInlineKeyboard(keyboards.defaultButtons);
            api.copyWithKeyboard(message, keyboard);
        }

        return;
    }

    if('callback_query' in update) {
        processCallbackQuery(update.callback_query);
        return;
    }
}

async function main() {
    process.on('SIGINT', function () {
        process.exit(2);
    });
    process.on('uncaughtException', function(e) {
        console.log(e.stack);
        process.exit(99);
    });
    process.on('exit', function(code) {
        console.log('Terminating...');
        db.stop();
    });
    
    await db.start();
    api.doLongPolling(handleUpdate);
}


main();