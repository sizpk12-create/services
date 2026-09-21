/**
 * You Want Services - Customer Messages View
 * Phase 1 Architecture
 */

import React, { useState } from 'react';
import { INITIAL_MESSAGES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { Button, Card } from '../../components/common/UIComponents';
import { MessageSquare, Send, Shield } from 'lucide-react';
import { Message } from '../../types/database';

export const CustomerMessagesView: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [newReply, setNewReply] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    const messageObj: Message = {
      id: `msg-${Date.now()}`,
      conversationId: 'conv-101',
      senderId: currentUser?.id || 'demo-usr-customer-1',
      receiverId: 'demo-usr-contractor-1',
      content: newReply,
      read: true,
      isDemo: true,
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, messageObj]);
    setNewReply('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h2>
        <p className="text-xs text-slate-500">
          Direct communication with matched service professionals.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[550px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              MV
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Marcus Vance</p>
              <p className="text-xs text-slate-500">Apex HVAC & Mechanical Services • Verified Pro</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure In-App Chat</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((m) => {
            const isMe = m.senderId === currentUser?.id;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md p-4 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-blue-700 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Send Input Form */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-3">
          <input
            type="text"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Type your message to Marcus Vance (Apex HVAC)..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Button type="submit" variant="primary" size="md" rightIcon={<Send className="w-4 h-4" />}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
