import express from "express";
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import OpenAI from "openai";
import dotenv from "dotenv";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { Readable } from "stream";
import fs from "fs";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegPath.path);

dotenv.config();

// Use Home Assistant Supervisor API if available, otherwise use .env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || getHomeAssistantOption('openai_api_key');

function getHomeAssistantOption(key) {
  try {
    const fs = require('fs');
    if (fs.existsSync('/data/options.json')) {
      const options = JSON.parse(fs.readFileSync('/data/options.json', 'utf8'));
      return options[key];
    }
  } catch (error) {
    console.log('Not running in Home Assistant Supervisor environment');
  }
  return null;
}

const PORT = process.env.PORT || 3000;
const app = express();
const wss = new WebSocketServer({ noServer: true });

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Function to convert WebM audio to PCM16 at 24kHz
async function convertToPCM16(inputBuffer, callback) {
  const tempDir = "./temp";
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  const inputFile = path.join(tempDir, `input_${Date.now()}.webm`);
  const outputFile = path.join(tempDir, `output_${Date.now()}.raw`);
  
  try {
    // Write input buffer to temp file
    fs.writeFileSync(inputFile, inputBuffer);
    
    // Convert using ffmpeg
    ffmpeg(inputFile)
      .audioFrequency(24000)
      .audioChannels(1)
      .audioCodec('pcm_s16le')
      .format('s16le')
      .output(outputFile)
      .on('end', () => {
        try {
          const pcm16Buffer = fs.readFileSync(outputFile);
          callback(pcm16Buffer);
          
          // Clean up temp files
          fs.unlinkSync(inputFile);
          fs.unlinkSync(outputFile);
        } catch (error) {
          console.error("Error reading converted audio:", error);
          callback(null);
        }
      })
      .on('error', (error) => {
        console.error("FFmpeg conversion error:", error);
        callback(null);
        
        // Clean up temp files
        try {
          if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
          if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
        } catch (e) {}
      })
      .run();
      
  } catch (error) {
    console.error("Error in convertToPCM16:", error);
    callback(null);
  }
}

// When a WebSocket client connects (HA or test client)
wss.on("connection", async (ws) => {
  console.log("WebSocket client connected");
  let openaiWs = null;
  
  try {
    // Connect to OpenAI Realtime API
    const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
    openaiWs = new WebSocket(url, {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "realtime=v1"
      }
    });

    openaiWs.on("open", () => {
      console.log("Connected to OpenAI Realtime API");
      
      // Send session configuration
      openaiWs.send(JSON.stringify({
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: "You are a helpful voice assistant for Home Assistant. Be conversational, friendly, and concise.",
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1"
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500
          }
        }
      }));

      // Send connection confirmation to client
      ws.send(JSON.stringify({ 
        status: "connected", 
        message: "Connected to OpenAI Realtime API (GPT-4o)",
        timestamp: new Date().toISOString()
      }));
    });

    openaiWs.on("message", (data) => {
      const message = JSON.parse(data.toString());
      console.log("OpenAI message:", message.type);
      
      // Log errors for debugging
      if (message.type === "error") {
        console.error("OpenAI Error:", JSON.stringify(message, null, 2));
      }
      
      // Forward OpenAI messages to client
      ws.send(JSON.stringify({
        type: "openai_message",
        data: message
      }));
    });

    openaiWs.on("error", (error) => {
      console.error("OpenAI WebSocket error:", error);
      ws.send(JSON.stringify({ 
        type: "error", 
        message: "OpenAI connection error: " + error.message 
      }));
    });

    // Handle messages from client
    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        console.log("Client message type:", data.type);
        
        if (data.type === "audio" && openaiWs && openaiWs.readyState === WebSocket.OPEN) {
          console.log(`Received audio format: ${data.format}`);
          const audioBuffer = Buffer.from(data.data, "base64");
          console.log(`Audio buffer size: ${audioBuffer.length} bytes`);
          
          try {
            // Convert WebM to PCM16 at 24kHz
            await convertToPCM16(audioBuffer, (pcm16Buffer) => {
              if (pcm16Buffer && openaiWs.readyState === WebSocket.OPEN) {
                const pcm16Base64 = pcm16Buffer.toString("base64");
                console.log(`Converted to PCM16: ${pcm16Buffer.length} bytes`);
                
                openaiWs.send(JSON.stringify({
                  type: "input_audio_buffer.append",
                  audio: pcm16Base64
                }));
                
                openaiWs.send(JSON.stringify({
                  type: "input_audio_buffer.commit"
                }));
                
                console.log(`Sent ${pcm16Buffer.length} bytes of PCM16 audio to OpenAI`);
              }
            });
          } catch (error) {
            console.error("Audio conversion error:", error);
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "Audio conversion failed: " + error.message 
            }));
          }
        }
      } catch (error) {
        console.error("Error processing client message:", error);
        ws.send(JSON.stringify({ 
          type: "error", 
          message: "Error processing message: " + error.message 
        }));
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      if (openaiWs) {
        openaiWs.close();
      }
    });

  } catch (error) {
    console.error("Error in WebSocket connection:", error);
    ws.send(JSON.stringify({ error: error.message }));
  }
});

const server = app.listen(PORT, () =>
  console.log(`Realtime proxy running on http://localhost:${PORT}`)
);

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});