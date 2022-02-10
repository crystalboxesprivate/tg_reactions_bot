require('dotenv').config();

const dbPath = process.env.DB_PATH;

const mongoose = require('mongoose');


mongoose.connection.on('open', (event) => {
    console.log('DB connected.');
});
mongoose.connection.on('reconnected', (event) => {
    console.log('DB reconnected.');
});
mongoose.connection.on('reconnectFailed', (event) => {
    console.log('DB reconnect failed.');
});
mongoose.connection.on('disconnecting', (event) => {
    console.log('Closing DB connection...');
});
mongoose.connection.on('close', (event) => {
    console.log('DB connection closed.');
});

async function start() {
    try{
        const options = { keepAlive: true, keepAliveInitialDelay: 300000 };
        await mongoose.connect(dbPath, options);
    }
    catch(error) {
        console.log('Database error (connection):');
        console.log(error);
    }
}

function stop() {
    mongoose.connection.close();
}

function initSchema() {
    try{
        const reactionSchema = new mongoose.Schema({
            chat_id: Number,
            message_id: Number,
            user_id: Number,
            text: String,
        });
        const Reaction = mongoose.model('Reaction', reactionSchema);

        const chatSettingsSchema = new mongoose.Schema({
            chat_id: Number,
            defaultReactions: [String],
        });
        const ChatSettings = mongoose.model('ChatSettings', chatSettingsSchema);

        return {
            Reaction,
            ChatSettings,
        };
    }
    catch(error) {
        console.log('Database error (mongodb schema):');
        console.log(error);
        throw error;
    }
}

function saveReaction(chat_id, message_id, user_id, text) {
    const reaction = new Reaction({
        chat_id: chat_id, 
        message_id: message_id, 
        user_id: user_id, 
        text: text,
    });

    return reaction.save();
}

async function getReaction(chat_id, message_id, user_id) {
    return await Reaction.findOne({
        chat_id: chat_id,
        message_id: message_id,
        user_id: user_id
    }).exec();
}

async function getReactionCount(chat_id, message_id, text) {
    return await Reaction.countDocuments({
        chat_id: chat_id,
        message_id: message_id,
        text: text
    }).exec();
}

async function getReactions(chat_id, message_id) {
    return await Reaction.find({
        chat_id: chat_id,
        message_id: message_id,
    }).exec();
}

async function getReactionsCount(chat_id, message_id) {
    return await Reaction.aggregate([
        {
            $group: {_id: '$text', count: {$sum: 1}}
        }
    ]).exec();
}

async function deleteReaction(chat_id, message_id, user_id) {
    return await Reaction.deleteOne({
        chat_id: chat_id,
        message_id: message_id,
        user_id: user_id
    }).exec();
}

function saveChatSettings(chat_id, settings) {
    ChatSettings.findOneAndUpdate(
        {chat_id: chat_id},
        settings,
        {upsert: true, new: true},
        (err, chatSettings) => {
            console.log(err);
            // console.log(chatSettings);
        }
    );
}

async function getChatSettings(chat_id)
{
    return await ChatSettings.findOne(
        {chat_id: chat_id},
    ).exec();
}

const {
    Reaction,
    ChatSettings
} = initSchema();

module.exports = {
    start: start,
    stop: stop,
    saveReaction: saveReaction,
    deleteReaction: deleteReaction,
    getReaction: getReaction,
    getReactionCount: getReactionCount,
    getReactions: getReactions,
    getReactionsCount: getReactionsCount,
    saveChatSettings: saveChatSettings,
    getChatSettings: getChatSettings,
};