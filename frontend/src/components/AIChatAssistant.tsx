'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Plus, Sparkles, Check, Pizza } from 'lucide-react';
import { useCart, Medicine } from '@/context/CartContext';
import { supabase } from '@/lib/supabaseClient';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  suggestedMedicines?: { id: number; name: string }[];
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Assalam-o-Alaikum! 🍕 Main Fatpizza ka Chef Bot helper hoon. Kya khaane ka mood hai? Mujhe batayein (e.g. spicy pizza, cheesy burger, creamy pasta) taake main aap ke liye best food recommend kar sakoon!\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbMedicines, setDbMedicines] = useState<Medicine[]>([]);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  // Scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Load medicines lookup list on mount to allow matching recommended IDs to full medicine details
  useEffect(() => {
    async function loadMedicines() {
      const { data } = await supabase.from('medicines').select('*');
      if (data) {
        setDbMedicines(data);
      }
    }
    loadMedicines();
  }, []);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');

    // Add user message
    const newMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (response.ok) {
        const data = await response.json();
        let aiMessage = data.message || "Apologies, I'm experiencing some difficulties. Please view our main menu page.";
        
        // Parse custom suggested medicines tag [SUGGESTED_MEDICINES: [...]]
        let suggested: { id: number; name: string }[] = [];
        const match = aiMessage.match(/\[SUGGESTED_MEDICINES:\s*(\[.*?\])\]/);
        if (match) {
          try {
            suggested = JSON.parse(match[1]);
            aiMessage = aiMessage.replace(/\[SUGGESTED_MEDICINES:\s*\[.*?\]\]/, '');
          } catch (e) {
            console.error('Failed to parse suggested food JSON', e);
          }
        }

        setMessages([...newMessages, { role: 'assistant', content: aiMessage.trim(), suggestedMedicines: suggested }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: "Mafi chahta hoon, server me kuch masla hai. Please try again later. / معافی چاہتا ہوں، سرور ڈاؤن ہے۔" }]);
      }
    } catch (e) {
      console.error(e);
      setMessages([...newMessages, { role: 'assistant', content: "Internet connection check karein. / انٹرنیٹ کنکشن چیک کریں۔" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggested = (id: number, name: string) => {
    const fullMed = dbMedicines.find(m => m.id === id);
    if (fullMed) {
      addToCart(fullMed, 1);
      setAddedItemName(name);
      setTimeout(() => setAddedItemName(null), 3000);
    }
  };

  const quickSuggestions = [
    { label: 'Cheesy Pizza 🍕', query: 'Mujhe cheesy pepperoni pizza chahiye' },
    { label: 'Crispy Zinger 🍔', query: 'Do we have crispy zinger burgers?' },
    { label: 'Creamy Pasta 🍝', query: 'Chicken cheese creamy pasta order karna hai' },
    { label: 'Sandwiches 🥪', query: 'Show me Club sandwich and Mexican sandwich' },
    { label: 'Pizza Fries 🍟', query: 'What sides do you have like fries?' }
  ];

  return (
    <div className="ai-chat-widget">
      {/* Pulse trigger button */}
      {!isOpen && (
        <button className="ai-chat-trigger" onClick={() => setIsOpen(true)} title="AI Chef Helper" style={{ background: 'var(--primary)', boxShadow: '0 8px 30px rgba(243, 93, 37, 0.4)' }}>
          <MessageCircle size={28} />
          <div className="pulse-ring" style={{ borderColor: 'var(--primary)' }}></div>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel" style={{ border: '2px solid var(--primary)', borderRadius: 'var(--radius-md)' }}>
          {/* Header */}
          <div className="chat-header" style={{ background: '#2e1a12', borderBottom: '3px solid var(--primary)' }}>
            <div className="chat-header-info">
              <div className="avatar" style={{ background: 'var(--primary)' }}>
                <Sparkles size={18} fill="white" />
              </div>
              <div>
                <div className="chat-title" style={{ color: 'white' }}>Fatpizza Chef Assistant</div>
                <div className="chat-status" style={{ color: 'var(--primary)' }}>● Online (Hot & Fresh Delivery)</div>
              </div>
            </div>
            <button className="icon-btn" onClick={() => setIsOpen(false)} style={{ color: 'white', border: 'none', background: 'transparent', width: '30px', height: '30px' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrap`} style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div className={`message ${msg.role}`} style={{
                  background: msg.role === 'user' ? 'var(--primary-bg)' : '#f9f6f0',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{msg.content}</div>
                  
                  {/* Inline Suggested food items */}
                  {msg.role === 'assistant' && msg.suggestedMedicines && msg.suggestedMedicines.length > 0 && (
                    <div style={{ 
                      marginTop: '14px', 
                      paddingTop: '10px', 
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      width: '100%'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Pizza size={12} /> Add to Basket / خریدیں:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {msg.suggestedMedicines.map((med) => {
                          const lookup = dbMedicines.find(d => d.id === med.id);
                          const priceText = lookup ? `Rs. ${lookup.price_pkr}` : 'Check Price';
                          
                          return (
                            <button
                              key={med.id}
                              onClick={() => handleAddSuggested(med.id, med.name)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'white',
                                border: '1px solid var(--border-color)',
                                color: 'var(--primary)',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                transition: 'var(--transition-fast)'
                              }}
                              className="chat-sugg-pill"
                            >
                              <Plus size={12} /> {med.name} ({priceText})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message ai" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chef Helper is thinking...</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                  <span style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></span>
                  <span style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Grid */}
          {messages.length === 1 && (
            <div style={{ 
              padding: '10px 16px', 
              background: '#fcfcfc', 
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Quick Suggestions:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {quickSuggestions.map((sym, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(sym.query)}
                    style={{
                      background: 'white',
                      border: '1px solid var(--border-color)',
                      color: 'var(--foreground)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-pill)',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.color = 'var(--primary)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--foreground)';
                    }}
                  >
                    {sym.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notification Banner when item added from chat */}
          {addedItemName && (
            <div style={{
              background: 'var(--primary)',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 800,
              padding: '8px 16px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              animation: 'fadeIn 0.2s'
            }}>
              <Check size={14} /> Added {addedItemName} to Cart / کارٹ میں شامل!
            </div>
          )}

          {/* Input Area */}
          <div className="chat-input-area" style={{ borderTop: '1px solid var(--border-color)' }}>
            <input
              type="text"
              className="chat-input"
              placeholder="Ask for pizza, burgers, pasta... (e.g. Spicy)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button className="chat-send-btn" onClick={() => handleSend()} disabled={isLoading || !input.trim()} style={{ background: 'var(--primary)' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Quick bouncing animation style */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}
