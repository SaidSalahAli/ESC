// src/pages/Chatbot.jsx
import React, { useRef, useState, useEffect } from 'react';
import './Chatbot.css';

export default function Chatbot() {
  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([{ id: 'bot-1', text: 'Hi! How can I help you today?', sender: 'bot' }]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // scroll to bottom whenever messages change
    const el = chatWindowRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function appendMessage(text, sender) {
    setMessages((prev) => [...prev, { id: `${sender}-${Date.now()}`, text, sender }]);
  }

  async function fetchBotReply(messageText) {
    appendMessage('Thinking...', 'bot');
    setSending(true);
    try {
      const res = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });

      // remove last "Thinking..." bot message
      setMessages((prev) => prev.filter((m, i) => !(m.sender === 'bot' && m.text === 'Thinking...' && i === prev.length - 1)));

      if (!res.ok) {
        appendMessage('Sorry, I could not get a response.', 'bot');
        setSending(false);
        return;
      }

      const data = await res.json();
      if (data && data.response) {
        appendMessage(data.response, 'bot');
      } else {
        appendMessage('Sorry, I could not get a response.', 'bot');
      }
    } catch (err) {
      // remove thinking and show error
      setMessages((prev) => prev.filter((m) => !(m.sender === 'bot' && m.text === 'Thinking...')));
      appendMessage('Sorry, there was an error connecting to the chatbot.', 'bot');
    } finally {
      setSending(false);
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    appendMessage(text, 'user');
    setInput('');
    fetchBotReply(text);
    // focus input after send
    if (inputRef.current) inputRef.current.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chatbot-container" style={{ minHeight: '100vh' }}>
      <div
        className="chat-window"
        id="chatWindow"
        ref={chatWindowRef}
        aria-live="polite"
        role="log"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <div className="chatbot-header">ESC Fit Club Chatbot</div>

        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          {messages.map((m) => (
            <div key={m.id} className={`chat-message ${m.sender === 'user' ? 'user' : 'bot'}`} style={{ marginBottom: '0.7rem' }}>
              {m.text}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-input-row" style={{ borderTop: '1px solid #eee' }}>
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{ resize: 'none' }}
        />
        <button className="send-btn" id="sendBtn" onClick={handleSend} disabled={sending} aria-disabled={sending}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
