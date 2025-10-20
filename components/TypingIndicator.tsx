import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-3">
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:120ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:240ms]" />
      <span className="sr-only">Matching suppliers</span>
    </div>
  );
}

export default TypingIndicator;

