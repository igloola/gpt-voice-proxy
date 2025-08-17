# GPT-5 Voice Proxy for Home Assistant

A WebSocket proxy that enables voice conversations with OpenAI's GPT-4o Realtime API in Home Assistant.

## Features

- 🎙️ **Real-time voice conversations** with GPT-4o
- 🔄 **Audio format conversion** (WebM/Opus → PCM16)
- 🏠 **Home Assistant integration** ready
- 🌐 **WebSocket API** for easy integration
- 🎵 **Streaming audio** with low latency

## Quick Start

1. **Get OpenAI API Key**: Visit [platform.openai.com](https://platform.openai.com/api-keys)
2. **Install Add-on**: Add this repository to Home Assistant
3. **Configure**: Set your OpenAI API key in the add-on options
4. **Test**: Use the included test client at `http://localhost:3000/test-client.html`

## Home Assistant Configuration

Add to your `configuration.yaml`:

```yaml
voice_assistant:
  url: "ws://localhost:3000"
  platform: "openai_realtime"
```

## API Usage

Connect via WebSocket to `ws://localhost:3000` and send:

```json
{
  "type": "audio",
  "data": "base64_encoded_audio",
  "format": "webm"
}
```

Receive GPT responses as:

```json
{
  "type": "openai_message",
  "data": {
    "type": "response.audio.delta",
    "delta": "base64_pcm16_audio"
  }
}
```

## Requirements

- OpenAI API key with Realtime API access
- Home Assistant OS or supervised installation
- Network access to OpenAI's API

## Support

- **Costs**: ~$0.06/min input, $0.24/min output
- **Latency**: ~500ms time-to-first-byte
- **Format**: Mono PCM16 at 24kHz
- **Models**: GPT-4o Realtime (GPT-5 coming soon)