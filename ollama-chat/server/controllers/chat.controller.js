const ollamaService = require('../services/ollama.service');

// In-memory store for chat history
// For a production app, this would be a database like MongoDB or PostgreSQL
// keyed by session ID or user ID
let chatHistory = [];

exports.sendMessage = async (req, res) => {
  const startBackendTime = Date.now();
  console.log(`[Backend] Received message request...`);

  const { message, model } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!model) {
    return res.status(400).json({ error: 'Model is required' });
  }

  try {
    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Ensure responses are not buffered by proxies
    res.flushHeaders();

    // Call Ollama Service to get the stream
    const { stream, startTime: ollamaStartTime } = await ollamaService.sendMessageStream(model, message, chatHistory);

    // Save user message to history
    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    chatHistory.push(userMessage);

    let fullContent = '';

    stream.on('data', chunk => {
      const chunkStr = chunk.toString();
      console.log(`[Backend] Raw Ollama chunk: ${chunkStr}`);
      const lines = chunkStr.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            fullContent += parsed.message.content;
            // Send SSE data
            res.write(`data: ${JSON.stringify({ content: parsed.message.content })}\n\n`);
          }
        } catch (e) {
          // Ignore partial JSON chunks (can happen if split in middle, though NDJSON usually has 1 JSON per line)
        }
      }
    });

    stream.on('end', () => {
      const endBackendTime = Date.now();
      console.log(`[OllamaService] Received full streaming response in ${endBackendTime - ollamaStartTime}ms`);
      console.log(`[Backend] Total processing time: ${endBackendTime - startBackendTime}ms`);
      
      const aiMessage = { role: 'assistant', content: fullContent, timestamp: new Date() };
      chatHistory.push(aiMessage);
      
      res.write('data: [DONE]\n\n');
      res.end();
    });

    stream.on('error', (err) => {
      console.error('[Backend] Stream error:', err.message);
      res.write(`data: ${JSON.stringify({ error: 'Stream error: ' + err.message })}\n\n`);
      res.end();
    });

  } catch (error) {
    const endBackendTime = Date.now();
    console.error(`[Backend] Error in sendMessage after ${endBackendTime - startBackendTime}ms:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to process message' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
};

exports.getHistory = (req, res) => {
  res.json({ history: chatHistory });
};

exports.clearHistory = (req, res) => {
  chatHistory = [];
  res.json({ message: 'Chat history cleared successfully' });
};

exports.getModels = async (req, res) => {
  try {
    const models = await ollamaService.getModels();
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch models' });
  }
};
