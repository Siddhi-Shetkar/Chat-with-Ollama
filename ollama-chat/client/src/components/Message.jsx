import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { User, Bot, Copy, Check } from 'lucide-react';

const Message = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`py-6 px-4 ${isUser ? 'bg-gptGray-800' : 'bg-gptGray-700'} w-full border-b border-black/10`}>
      <div className="max-w-3xl mx-auto flex gap-4 md:gap-6">
        <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center text-white mt-1">
          {isUser ? (
            <div className="bg-purple-600 w-full h-full flex items-center justify-center rounded-sm">
              <User size={20} />
            </div>
          ) : (
            <div className="bg-emerald-600 w-full h-full flex items-center justify-center rounded-sm">
              <Bot size={20} />
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="font-semibold text-gray-200 text-sm">
            {isUser ? 'You' : 'Ollama AI'}
            {message.timestamp && (
              <span className="text-xs text-gray-400 font-normal ml-2">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          
          <div className="text-gray-300 prose prose-invert max-w-none text-sm md:text-base">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {message.content}
            </ReactMarkdown>
          </div>
          
          {!isUser && (
            <div className="flex mt-2">
              <button 
                onClick={handleCopy}
                className="text-gray-400 hover:text-gray-200 transition-colors"
                title="Copy response"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
