# Dependencies

Lock file should be commited to the repository. Lock file contains actual resolved version of the dependency and it's important to commit it to be able to restore to exactly the same versions of node packages

## Use yarn classic (instead of npm) and commit yarn.lock

It usually handles dependencies much better than npm (and in some cases it's faster)

## Code structure


### src folder

Use `src/` folder to keep the code inside it. Similar to `C` projects, it's easier to distinguish application source code from scripts and configuration files

## Choice of libraries

`mongoose` is pretty good for building business logic with serialisable entities with defined models, however for a project this small it's simpler and more practical to go with a regular `mongodb` driver.

### https

While it's cool that `https` node library is shown, but it's more practical to use fetch (since node16) or axios. However for a learning project it's cool

# Code style

Use `eslint` with presets for coding style validation. JS is very non-restrictive on syntax and it's required to use linter by default :shrugs:


## jsdoc

Use jsdoc everywhere to make the code look like PRO. For the most part, anyone who would read it, won't understand it unfortunately. But with high documentation coverage you can point that dumbass at documentation, when they say they can't make sense of this code

```diff
+ /**
+  * Sends a message to chat? Idk it seems so
+  * @param {string} chat_id id of the telegram chat 
+  * @param {string} messageKey probably something related to message
+  * @param {string | undefined} reply_to probably optional user id 
+  */
function sendStandardMessage(chat_id, messageKey, reply_to=undefined) {
    sendTextMessage(chat_id, presetMessages.get(messageKey), reply_to);
}
```

Note that jsdoc is compatible with typescript types, and vscode natively understands those

## Field assignments

Use shorter code for object field definitions (when the field name is the same as the variable):

```diff
module.exports = {
+    callApiMethodAsync,
+    callApiMethod,
-    callApiMethodAsync: callApiMethodAsync,
-    callApiMethod: callApiMethod,
    // ...
}
```

## Commented code

Remove the commented code. Just delete it, GIT will have your old code in previous commits.
No one will understand what it is about and why you left it. You could at least add a description why it is important to leave it:

```diff
- // async function doIfAdmin(chat_id, user_id, callback) {
- //     const params = {
- //         chat_id: chat_id,
- //         user_id: user_id
- //     }
```

## Global configuration

Create something like config js with a single dotenv call, and then import that config instead of using `process.env`. everywhere

```diff
- require('dotenv').config();
+ const config = require('./config');

- const pollingTimeout = +process.env.POLLING_TIMEOUT;
+ const pollingTimeout = config.pollingTimeout;
- const apiurl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/`;
+ const apiurl = `https://api.telegram.org/bot${config.botToken}/`;
```

## Logging

Use something advanced like `winston` instead of console.log. This instantly adds a PRO-level to your code and you'll have the control over what and how logs would propagate to your streams, rather than throwing unformatted messages to stdout.\

Logs are huge, If you stream json messages, you can easily do aggregations, extract metrics and do application visibility with no problem. Super useful for production apps.

## Variables

Just don't use `var`s it's oldschool. No-one is doing this. `let`/`const` all the way

```diff
function makeInlineKeyboard(buttons, maxColumns = MAX_COLUMNS) {
-    var keyboard = [];
-    var totalButtons = buttons.length;
-    var i = 0;
+    let keyboard = [];
+    let totalButtons = buttons.length;
+    let i = 0;

    while(i < totalButtons) {
```

## Dead code

```diff
- class Keyboard {
-     buttons = [];
-     layout = [[]];
-     maxColumns = 1;
```

just remove the dead code. It's useless and no one wants to read it 

## Use of async style

Some functions are async, but they don't need to be async. E.g.

```
- async function callApiMethodAsync(methodName, methodParams={}) {
+ function callApiMethodAsync(methodName, methodParams={}) {
    return new Promise(function (resolve, reject) {
      /// ...
```

No reason for making this async

### `https.request` should be just promisified and used instead of duplicating code with `req.on("data"...

Make something like [https://medium.com/@gevorggalstyan/how-to-promisify-node-js-http-https-requests-76a5a58ed90c](https://medium.com/@gevorggalstyan/how-to-promisify-node-js-http-https-requests-76a5a58ed90c) and use with `await`s

### Callbacks objects

```
    const {
        after = ()=>{},
        handler = (result)=>{},
        onApiError = (responseObject)=>{},
        onResError = (e)=>{},
        onReqError = (e)=>{},
    } = callbacks;
```

^^^ is really interesting but don't do stuff like this. Use `async`/`await` and `try`/`catch` to handle errors.

# Long Polling code

It's better to use more straightforward infinite loop implementation;

```
while (true) {
  try {
    const updates = await getUpdates(...)
    // ...
  } catch (e) {
    // ...
  }

}
```
