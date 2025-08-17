# Installation Guide for Home Assistant Green

## Method 1: Local Add-on (Recommended for testing)

### Step 1: Copy Files to Home Assistant

1. **Enable SSH** in Home Assistant (Settings → Add-ons → SSH & Web Terminal)
2. **Access via SSH** or use the File Editor add-on
3. **Create add-on directory**:
   ```bash
   mkdir -p /addons/local
   mkdir -p /addons/local/gpt5-voice-proxy
   ```

4. **Copy all files** from your PC to `/addons/local/gpt5-voice-proxy/`:
   - Use SCP, SMB share, or File Editor add-on
   - Copy: `config.yaml`, `Dockerfile`, `server.js`, `package.json`, `test-client.html`, `run.sh`, `DOCS.md`, `CHANGELOG.md`

### Step 2: Install the Local Add-on

1. **Go to Home Assistant** → **Settings** → **Add-ons** → **Add-on Store**
2. **Click ⋮ menu** → **"Check for updates"** or **"Reload"**
3. **Look for "Local add-ons"** section at the bottom
4. **Install "GPT-5 Voice Proxy"** from the local add-ons section

### Step 3: Configure the Add-on

1. **Click on the add-on** → **Configuration tab**
2. **Set your OpenAI API key**:
   ```yaml
   openai_api_key: "sk-proj-your-actual-api-key"
   port: 3000
   log_level: "info"
   voice: "alloy"
   ```
3. **Save** and **Start** the add-on

## Method 2: GitHub Repository

### Step 1: Create GitHub Repository

1. **Create new repository** on GitHub named `gpt5-voice-proxy`
2. **Upload all files** to the repository
3. **Update the URL** in `config.yaml`:
   ```yaml
   url: "https://github.com/yourusername/gpt5-voice-proxy"
   ```

### Step 2: Add to Home Assistant

1. **Home Assistant** → **Settings** → **Add-ons** → **Add-on Store**
2. **⋮ menu** → **"Repositories"**
3. **Add repository**: `https://github.com/yourusername/gpt5-voice-proxy`
4. **Install the add-on** and configure as above

## Step 4: Configure Home Assistant Voice

Add to your `configuration.yaml`:

```yaml
# Enable conversation integration
conversation:

# Configure voice assistant (if using HA voice pipeline)
assist_pipeline:
  - name: "GPT Voice Assistant"
    conversation_engine: "conversation.gpt_proxy"
    language: "en"
    stt_engine: "whisper"
    tts_engine: "tts.openai_tts"
```

## Step 5: Test the Installation

1. **Check add-on logs** for "Realtime proxy running"
2. **Test WebSocket**: Open `http://homeassistant.local:3000/test-client.html`
3. **Try voice commands** in Home Assistant

## Troubleshooting

### Add-on Won't Start
- Check logs for API key errors
- Verify OpenAI API key has Realtime access
- Ensure port 3000 is available

### No Voice Response
- Check network connectivity to OpenAI
- Verify audio format in logs
- Test with the included test client

### WebSocket Connection Failed
- Confirm add-on is running and healthy
- Check firewall settings
- Verify port configuration

## File Structure
```
/addons/gpt5-voice-proxy/
├── config.yaml          # Add-on configuration
├── Dockerfile           # Container build instructions
├── server.js            # Main proxy server
├── package.json         # Node.js dependencies
├── run.sh              # Startup script
├── test-client.html    # Test client
├── DOCS.md             # Documentation
├── CHANGELOG.md        # Version history
└── INSTALL.md          # This file
```

Your GPT-5 Voice Proxy is now ready for Home Assistant! 🏠🎙️