Desktop**
- **Header (Top)**
  - Logo: “SteelMatch Pro” (font: Inter, SemiBold, 24px, #111827)
  - Tagline: “AI-matched U.S. steel partners — certified, fast, sustainable.” (16px, #4B5563)

- **Chat Container (Centered, max-width: 640px)**
  - Background: white
  - Border: 1px solid #E5E7EB
  - Border radius: 16px
  - Shadow: 0 4px 12px rgba(0,0,0,0.03)

- **Message Bubbles**
  - **User (right-aligned)**
    - Background: #2563EB (blue-600)
    - Text: white, 14px, padding: 12px 16px
    - Rounded: 18px, bottom-right: 4px
  - **AI (left-aligned)**
    - Background: #F9FAFB
    - Text: #1F2937, 14px, padding: 12px 16px
    - Rounded: 18px, bottom-left: 4px
    - Match indicator: prefix with “🔥”, “🌡️”, or “🧊” based on score

- **Supplier Result Card (inside AI message)**
  ```
  🔥 Midwest Precision Metals (Cleveland, OH)
  – Match: 92/100 | Lead time: 10 days
  – Certs: ISO 9001, AS9100
  – 72% recycled content
  ```

- **Input Bar (Bottom of chat)**
  - Text field: rounded-full, border #D1D5DB, padding 12px 20px
  - Send button: blue-600, white text, rounded-full, 44px width

- **CTA Section (Below chat, only after results)**
  - Background: #EFF6FF
  - Border: 1px solid #BFDBFE
  - Padding: 16px
  - Title: “Found a match?” (16px, bold)
  - Subtitle: “Get intro calls and quotes — free for your first RFQ.” (14px, #374151)
  - Email input + “Schedule Intro Call” button (blue)

- **Footer**
  - “Steel Match 2025 — real-time B2B data on 146M+ companies” (12px, #9CA3AF)

--
### 🎨 Color Palette
- Primary: `#F9641E` (orange)
- Background: `#fefcf6`
- Text: `#111827` (heading), `#4B5563` (body)
- Success: `#10B981`
- Warning: `#F59E0B`

### 🔠 Typography
- Font: **Bebas Neue**  **montserrat** ( Google Fonts)
 - `href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap`
 LOGO: 
.bebas-neue-regular {
  font-family: "Bebas Neue", sans-serif;
  font-weight: 400;
  font-style: normal;
}

- Body: Regular
.montserrat-<uniquifier> {
  font-family: "Montserrat", sans-serif;
  font-optical-sizing: auto;
  font-weight: <weight>;
  font-style: normal;
}


```
```

```javascript
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add custom fonts
      fontFamily: {
        'bebas': ['"Bebas Neue"', 'sans-serif'],
        'montserrat': ['"Montserrat"', 'sans-serif'],
      },
      // Add custom colors from the palette
      colors: {
        primary: '#F9641E',
        'text-heading': '#111827',
        'text-body': '#4B5563',
        success: '#10B981',
        warning: '#F59E0B',
      },
      // Custom shadow from the design
      boxShadow: {
        'subtle': '0 4px 12px rgba(0,0,0,0.03)',
      }
    },
  },
  plugins: [],
}
```

-----

```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <title>SteelMatch Pro</title>
</head>
```
```
css
/* src/index.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #fefcf6; /* Custom background color */
  font-family: "Montserrat", sans-serif; /* Default body font */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

-----

```jsx
// src/App.jsx

import React, { useState, useEffect } from 'react';

// --- Helper Components ---

// SVG Icon for the send button
const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

// Supplier Card component to be embedded in AI messages
const SupplierCard = ({ supplier }) => {
  const getMatchIcon = (score) => {
    if (score > 90) return '🔥'; // Hot match
    if (score > 75) return '🌡️'; // Warm match
    return '🧊'; // Cold match
  };

  return (
    <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg text-md text-gray-800">
      <p className="font-bold">
        {getMatchIcon(supplier.match)} {supplier.name} ({supplier.location})
      </p>
      <ul className="mt-2 space-y-1 text-gray-600 list-inside">
        <li>– Match: <span className="font-semibold">{supplier.match}/100</span> | Lead time: <span className="font-semibold">{supplier.leadTime}</span></li>
        <li>– Certs: <span className="font-semibold">{supplier.certs.join(', ')}</span></li>
        <li>– <span className="font-semibold">{supplier.recycledContent}%</span> recycled content</li>
      </ul>
    </div>
  );
};


// --- Main App Component ---

export default function App() {
  // State to hold the conversation messages, example obj
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: 'Find me a U.S. supplier for 10,000 lbs of 304 stainless steel sheets, AS9100 certified, with a high recycled content. Need it in Ohio by next month.'
    },
    {
      id: 2,
      sender: 'ai',
      text: 'Searching 1,200+ certified U.S. suppliers... Found three top matches based on your criteria:'
    },
    {
      id: 3,
      sender: 'ai',
      supplier: {
        name: 'Midwest Precision Metals',
        location: 'Cleveland, OH',
        match: 92,
        leadTime: '10 days',
        certs: ['ISO 9001', 'AS9100'],
        recycledContent: 72,
      }
    },
    {
      id: 4,
      sender: 'ai',
      supplier: {
        name: 'Allegheny Steel Works',
        location: 'Pittsburgh, PA',
        match: 85,
        leadTime: '14 days',
        certs: ['ISO 9001', 'AS9100'],
        recycledContent: 65,
      }
    },
  ]);

  // State to show the CTA section only after results are displayed
  const [showCTA, setShowCTA] = useState(false);

  // Effect to check if results are present and show the CTA
  useEffect(() => {
    const hasResults = messages.some(msg => msg.supplier);
    if (hasResults) {
      setShowCTA(true);
    }
  }, [messages]);


  return (
    <div className="font-montserrat min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="font-bebas text-2xl font-semibold text-text-heading">
          SteelMatch Pro
        </h1>
        <p className="text-base text-text-body">
          AI-matched U.S. steel partners — certified, fast, sustainable.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center w-full">
        {/* Chat Container */}
        <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-subtle flex flex-col">
          
          {/* Messages Area */}
          <div className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md ${msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-[4px]' 
                  : 'bg-gray-50 text-gray-800 rounded-t-2xl rounded-br-2xl rounded-bl-[4px]'}`}>
                  
                  {msg.text && <p className="text-md px-4 py-3">{msg.text}</p>}
                  
                  {msg.supplier && (
                    <div className="px-4 py-3">
                      <SupplierCard supplier={msg.supplier} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div className="border-t border-gray-200 p-3 md:p-4 bg-white rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Describe your steel requirements..."
                className="flex-grow w-full rounded-full border border-gray-300 px-5 py-3 text-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                className="bg-blue-600 text-white rounded-full w-11 h-11 flex items-center justify-center flex-shrink-0 hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section (Conditional) */}
        {showCTA && (
          <div className="w-full max-w-2xl mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-base text-gray-900">Found a match?</h3>
            <p className="text-md text-gray-700 mt-1">
              Get intro calls and quotes — free for your first RFQ.
            </p>
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow w-full rounded-md border border-gray-300 px-4 py-2 text-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="bg-blue-600 text-white rounded-md px-4 py-2 text-md font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Schedule Intro Call
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 mt-12 py-4">
        Steel Match 2025 — real-time B2B data on 146M+ companies
      </footer>
    </div>
  );
}
```