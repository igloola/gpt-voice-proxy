# GPT-5 Voice Proxy Add-on

## About

This add-on provides a WebSocket proxy for OpenAI's GPT-4o Realtime API, enabling voice conversations with ChatGPT directly in Home Assistant.

## Installation

1. **Add Repository**: Add this repository to your Home Assistant add-on store
2. **Install Add-on**: Install "GPT-5 Voice Proxy" from the add-on store
3. **Configure**: Set your OpenAI API key in the add-on configuration
4. **Start**: Start the add-on and check the logs

## Configuration

### Add-on Configuration

```yaml
openai_api_key: "sk-proj-your-api-key-here"
port: 3000
log_level: "info"
voice: "alloy"
```

### Configuration Options

- `openai_api_key` (required): Your OpenAI API key with Realtime API access
- `port`: Port for the WebSocket server (default: 3000)
- `log_level`: Logging level (debug, info, warning, error)
- `voice`: OpenAI voice to use (alloy, echo, fable, onyx, nova, shimmer)

### Home Assistant Configuration

Add to your `configuration.yaml`:

```yaml
conversation:
  - platform: proxy
    url: "ws://a0d7b954-gpt5-voice-proxy:3000"

assist_pipeline:
  - conversation_engine: proxy
    conversation_language: en
```

## Usage

1. **Voice Commands**: Use Home Assistant's voice assistant normally
2. **Test Client**: Access the test client at `http://homeassistant.local:3000/test-client.html`
3. **WebSocket API**: Connect directly via WebSocket for custom integrations

## WebSocket API

### Send Audio
```json
{
  "type": "audio",
  "data": "base64_encoded_webm_audio",
  "format": "webm"
}
```

### Receive Response
```json
{
  "type": "openai_message",
  "data": {
    "type": "response.audio.delta",
    "delta": "base64_pcm16_audio"
  }
}
```

## Costs

- **Input**: ~$0.06 per minute of voice input
- **Output**: ~$0.24 per minute of voice output
- **Latency**: ~500ms time-to-first-byte

## Troubleshooting

### Check Logs
Monitor the add-on logs for connection issues or API errors.

### Test Connection
```bash
wscat -c ws://homeassistant.local:3000
```

### API Key Issues
- Ensure your OpenAI API key has Realtime API access
- Check your OpenAI usage limits and billing

## Support

For issues and feature requests, visit the [GitHub repository](https://github.com/yourusername/gpt5-voice-proxy).