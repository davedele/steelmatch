import React from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  clarificationHint?: string | null;
  variant?: 'light' | 'dark';
  leftAccessory?: React.ReactNode;
}

export function ChatInput({
  onSend,
  disabled = false,
  clarificationHint,
  variant = 'light',
  leftAccessory,
}: ChatInputProps) {
  const [value, setValue] = React.useState('');

  function submit() {
    if (disabled) return;
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue('');
  }

  return (
    <div
      className={`flex items-center gap-2 ${
        variant === 'dark' ? 'bg-[#111111] border border-white/10 rounded-full px-3 py-2' : ''
      }`}
    >
      {leftAccessory ? <div className="flex-shrink-0 text-gray-400">{leftAccessory}</div> : null}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => (e.key === 'Enter' ? submit() : undefined)}
        placeholder={clarificationHint || 'Describe your steel requirements...'}
        className={`flex-grow w-full text-md focus:outline-none transition ${
          variant === 'dark'
            ? 'bg-transparent text-white placeholder:text-gray-500 py-2'
            : 'rounded-full border border-gray-300 px-5 py-3 focus:ring-2 focus:ring-primary focus:border-transparent'
        }`}
        aria-label="RFQ input"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={submit}
        className={`rounded-full w-11 h-11 flex items-center justify-center flex-shrink-0 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
          variant === 'dark' ? 'focus:ring-offset-0' : 'focus:ring-offset-2'
        } ${
          disabled
            ? 'bg-primary/60 cursor-not-allowed'
            : 'bg-primary hover:bg-primary/90 active:bg-primary/95'
        }`}
        aria-label="Send"
        disabled={disabled}
      >
        <Send size={18} />
      </button>
    </div>
  );
}

export default ChatInput;
