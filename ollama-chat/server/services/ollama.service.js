const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';

class OllamaService {
  async sendMessageStream(model, prompt, history = []) {
    try {
      const messages = history.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: prompt
      });

      const startTime = Date.now();
      console.log(`[OllamaService] Sending streaming request to ${OLLAMA_URL}/chat for model: ${model}`);

      const response = await axios.post(`${OLLAMA_URL}/chat`, {
        model: model,
        messages: messages,
        stream: true
      }, { 
        timeout: 60000,
        responseType: 'stream'
      });

      return { stream: response.data, startTime };
    } catch (error) {
      console.error('Error communicating with Ollama:', error.message);
      throw new Error(error.response?.data?.error || 'Failed to connect to Ollama');
    }
  }

  async getModels() {
    try {
      const response = await axios.get(`${OLLAMA_URL}/tags`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Ollama models:', error.message);
      // Fallback models for demo purposes
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        return {
          models: [
            { name: 'llama3.2:latest' },
            { name: 'mistral' },
            { name: 'phi3' }
          ]
        };
      }
      throw new Error('Failed to fetch models from Ollama');
    }
  }

  async preloadModel(model) {
    try {
      console.log(`[OllamaService] Preloading model ${model}...`);
      const startTime = Date.now();
      // Send an empty prompt to load the model into memory
      await axios.post(`${OLLAMA_URL}/generate`, {
        model: model,
        prompt: "",
        stream: false
      }, { timeout: 60000 });
      const endTime = Date.now();
      console.log(`[OllamaService] Preloaded model ${model} successfully in ${endTime - startTime}ms`);
    } catch (error) {
      console.warn(`[OllamaService] Failed to preload model ${model}:`, error.message);
    }
  }
}

module.exports = new OllamaService();
