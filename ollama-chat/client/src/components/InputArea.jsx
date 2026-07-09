import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

const InputArea = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-white/20 bg-gptGray-800 p-4 w-full">
      <div className="max-w-3xl mx-auto relative">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <textarea
            ref={textareaRef}
            rows={1}
            className="w-full bg-gptGray-700 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-gptGray-500 resize-none max-h-[200px] shadow-sm border border-white/10"
            placeholder="Send a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 bottom-2 md:bottom-2.5 p-1.5 rounded-lg transition-colors ${
              !input.trim() || isLoading 
                ? 'text-gray-500 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
        <div className="text-center text-xs text-gptGray-400 mt-2">
          AI can make mistakes. Consider verifying important information.
        </div>
      </div>
    </div>
  );
};

export default InputArea;
