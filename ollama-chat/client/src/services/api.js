import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s timeout
});

export const sendMessageStream = async (message, model, signal) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, model }),
    signal
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to connect to backend server');
  }

  return response;
};

export const getHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const clearHistory = async () => {
  const response = await api.delete('/history');
  return response.data;
};

export const getModels = async () => {
  const response = await api.get('/models');
  return response.data;
};

export default api;
