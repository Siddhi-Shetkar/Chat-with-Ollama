import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, MessageSquare, AlertCircle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Message from './components/Message';
import InputArea from './components/InputArea';
import { sendMessageStream, getHistory, clearHistory, getModels } from './services/api';

function App() {
  const [history, setHistory] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  const fetchInitialData = async () => {
    try {
      const [historyData, modelsData] = await Promise.all([
        getHistory(),
        getModels().catch(err => {
          console.error("Failed to fetch models", err);
          setIsConnected(false);
          return { models: [{ name: 'llama3.2:latest' }] }; // fallback
        })
      ]);
      
      setHistory(historyData.history || []);
      
      const availableModels = modelsData.models || [];
      setModels(availableModels);
      
      if (availableModels.length > 0) {
        setSelectedModel(availableModels[0].name);
      } else {
        setSelectedModel('llama3.2:latest'); // Fallback so we can trigger the "model not found" error
      }
      setIsConnected(true);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to connect to backend server.');
      setIsConnected(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content) => {
    if (!content.trim() || isLoading) return;
    
    if (!selectedModel) {
      setError("Please select a model first.");
      return;
    }

    // Cancel any pending request if a new one starts
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage = { role: 'user', content, timestamp: new Date() };
    setHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    const startTime = performance.now();
    console.log(`[Frontend] Sending request for model: ${selectedModel}`);

    try {
      const response = await sendMessageStream(content, selectedModel, abortControllerRef.current.signal);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      setHistory(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);

      let assistantMessageIndex;
      setHistory(prev => {
        assistantMessageIndex = prev.length - 1;
        return prev;
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          const endTime = performance.now();
          console.log(`[Frontend] Stream completed in ${(endTime - startTime).toFixed(2)}ms`);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n').filter(Boolean);
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.error) throw new Error(data.error);
              
              setHistory(prev => {
                const newHistory = [...prev];
                newHistory[assistantMessageIndex] = {
                  ...newHistory[assistantMessageIndex],
                  content: newHistory[assistantMessageIndex].content + data.content
                };
                return newHistory;
              });
            } catch (e) {
              if (e.message !== 'Unexpected end of JSON input' && !dataStr.includes('Unexpected')) {
                console.error('Stream parsing error:', e);
              }
            }
          }
        }
      }

      setIsConnected(true);
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        console.log('[Frontend] Request was aborted');
        return;
      }
      console.error('Error sending message:', err);
      setError(err.response?.data?.error || err.message || 'Failed to get response from AI');
      // Remove the optimistic user message if we want, or keep it. Let's keep it and show error.
      setHistory(prev => [...prev, { role: 'assistant', content: `**Error:** ${err.response?.data?.error || err.message || 'Failed to get response. Is Ollama running?'}`, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear all conversations?')) {
      try {
        await clearHistory();
        setHistory([]);
      } catch (err) {
        console.error('Error clearing history:', err);
        setError('Failed to clear chat history');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gptGray-800 text-gray-100 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:flex`}>
        <Sidebar 
          history={history} 
          onClearChat={handleClearChat} 
          models={models}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          isConnected={isConnected}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-white/20 bg-gptGray-800 sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-gptGray-700 text-gray-300"
          >
            <Menu size={20} />
          </button>
          <div className="font-semibold text-gray-200 text-sm">Ollama Chat</div>
          <button 
            onClick={handleClearChat}
            className="p-2 -mr-2 rounded-md hover:bg-gptGray-700 text-gray-300"
          >
            <MessageSquare size={20} />
          </button>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="absolute top-16 md:top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center gap-2 text-sm max-w-[90%] w-max">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 hover:text-red-200">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto w-full">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gptGray-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/10">
                <MessageSquare size={32} className="text-gray-400" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">How can I help you today?</h1>
              <p className="text-gptGray-400 max-w-md text-sm">
                Connects to your local Ollama instance. Select a model from the sidebar and start chatting.
              </p>
            </div>
          ) : (
            <div className="w-full">
              {history.map((msg, idx) => (
                <Message key={idx} message={msg} />
              ))}
              
              {isLoading && (
                <div className="py-6 px-4 bg-gptGray-700 w-full border-b border-black/10">
                  <div className="max-w-3xl mx-auto flex gap-4 md:gap-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-emerald-600 flex items-center justify-center text-white mt-1">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default App;
