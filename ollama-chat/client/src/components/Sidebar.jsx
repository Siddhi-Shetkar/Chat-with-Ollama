import React from 'react';
import { Plus, Trash2, Settings, MessageSquare } from 'lucide-react';

const Sidebar = ({ 
  history, 
  onClearChat, 
  models, 
  selectedModel, 
  setSelectedModel, 
  isConnected 
}) => {
  return (
    <div className="w-64 bg-gptGray-900 flex flex-col h-full hidden md:flex border-r border-white/20">
      <div className="p-2">
        <button 
          onClick={onClearChat}
          className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-gptGray-800 transition-colors border border-white/20 text-sm font-medium"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {history.length > 0 ? (
          <div className="text-xs font-semibold text-gptGray-500 mb-3 px-3 mt-4 uppercase">
            Recent Conversations
          </div>
        ) : null}
        
        {history.filter(m => m.role === 'user').map((msg, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-3 p-3 rounded-md hover:bg-gptGray-800 transition-colors cursor-pointer text-sm truncate text-gray-300"
            title={msg.content}
          >
            <MessageSquare size={16} className="flex-shrink-0" />
            <span className="truncate">{msg.content}</span>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-white/20 flex flex-col gap-2">
        <div className="p-3 text-sm text-gray-300">
          <div className="flex items-center gap-2 mb-2 font-medium">
            <Settings size={16} />
            Settings
          </div>
          
          <div className="mb-2">
            <label className="text-xs text-gptGray-400 block mb-1">Model</label>
            <select 
              className="w-full bg-gptGray-800 text-white rounded p-1.5 text-xs border border-white/20 outline-none focus:border-white/40"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.length > 0 ? (
                models.map(model => (
                  <option key={model.name} value={model.name}>{model.name}</option>
                ))
              ) : (
                <option value="llama3.2:latest">llama3.2:latest</option>
              )}
            </select>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {isConnected ? 'Connected to Ollama' : 'Ollama Disconnected'}
          </div>
        </div>
        
        <button 
          onClick={onClearChat}
          className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-red-500/10 text-red-400 transition-colors text-sm font-medium"
        >
          <Trash2 size={16} />
          Clear Conversations
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
