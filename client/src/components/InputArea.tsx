import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Paperclip, Mic, MicOff, Zap } from 'lucide-react';
import { InputAreaProps } from '../types';

export const InputArea: React.FC<InputAreaProps> = ({
  onSubmit,
  autoMode = false,
  onAutoModeToggle,
  disabled = false,
  placeholder = "Ask or instruct Agent"
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSubmit(message.trim());
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  const canSubmit = message.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-dark-700 bg-surface">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-6 py-3 border-b border-dark-700">
          <div className="flex items-center space-x-2 flex-wrap">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-surface-light px-3 py-1 rounded-lg text-sm"
              >
                <Paperclip size={14} className="text-text-secondary" />
                <span className="text-text-primary truncate max-w-32">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-text-secondary hover:text-red-400 transition-colors duration-200"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="px-6 py-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-4">
          {/* Auto Mode Toggle */}
          <div className="flex flex-col items-center space-y-2">
            <button
              type="button"
              onClick={onAutoModeToggle}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
                ${autoMode ? 'bg-accent' : 'bg-dark-600'}
              `}
              disabled={disabled}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                  ${autoMode ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
            <span className="text-xs text-text-secondary font-medium">
              Auto
            </span>
          </div>

          {/* Input Container */}
          <div className="flex-1 relative">
            <div className="flex items-end bg-surface-light rounded-lg border border-dark-600 focus-within:border-accent transition-colors duration-200">
              {/* File Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 p-3 text-text-secondary hover:text-text-primary transition-colors duration-200"
                disabled={disabled}
              >
                <Upload size={18} />
              </button>

              {/* Text Input */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 bg-transparent border-none outline-none resize-none text-text-primary placeholder-text-muted py-3 pr-3 min-h-[24px] max-h-32"
                rows={1}
              />

              {/* Voice Recording Button */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`
                  flex-shrink-0 p-3 transition-colors duration-200
                  ${isRecording 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-text-secondary hover:text-text-primary'
                  }
                `}
                disabled={disabled}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`
                  flex-shrink-0 p-3 transition-all duration-200
                  ${canSubmit
                    ? 'text-accent hover:text-blue-400 hover:bg-accent/10 rounded-r-lg'
                    : 'text-text-muted cursor-not-allowed'
                  }
                `}
              >
                <Send size={18} />
              </button>
            </div>

            {/* Character Count */}
            {message.length > 0 && (
              <div className="absolute -bottom-6 right-0 text-xs text-text-muted">
                {message.length}/2000
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {autoMode && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-accent/10 text-accent rounded-lg text-xs">
                <Zap size={12} />
                <span>Auto Mode</span>
              </div>
            )}
          </div>
        </form>

        {/* Quick Suggestions */}
        <div className="mt-3 flex items-center space-x-2 flex-wrap">
          <span className="text-xs text-text-muted">Quick actions:</span>
          {[
            'Create new task',
            'Check agent status',
            'Generate report',
            'Start automation'
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setMessage(suggestion)}
              className="text-xs px-2 py-1 bg-surface-light hover:bg-dark-600 text-text-secondary hover:text-text-primary rounded transition-colors duration-200"
              disabled={disabled}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept=".txt,.pdf,.doc,.docx,.json,.csv,.xlsx"
      />
    </div>
  );
};
