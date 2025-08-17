#!/usr/bin/with-contenv bashio

# Set log level
LOG_LEVEL=$(bashio::config 'log_level')
export LOG_LEVEL

# Set OpenAI API key from config
OPENAI_API_KEY=$(bashio::config 'openai_api_key')
export OPENAI_API_KEY

# Set port from config
PORT=$(bashio::config 'port')
export PORT

bashio::log.info "Starting GPT-5 Voice Proxy..."
bashio::log.info "Port: ${PORT}"
bashio::log.info "Log level: ${LOG_LEVEL}"

# Check if API key is provided
if [ -z "$OPENAI_API_KEY" ]; then
    bashio::log.fatal "OpenAI API key is required! Please configure it in the add-on options."
    exit 1
fi

# Start the Node.js application
cd /app
exec node server.js