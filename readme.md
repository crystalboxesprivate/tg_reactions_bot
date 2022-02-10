This is an incomplete Telegram bot intended as exercise with NodeJS

The bot adds buttons under media messages with emoji or text reactions (now Telegram has reactions as its native feature).

No web framework was used, just `https` and `mongoose` for the database.

### .env variables

BOT_TOKEN
POLLING_TIMEOUT     timeout for long polling (in seconds)
DB_PATH             DB path for MongoDB