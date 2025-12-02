import { useState } from 'react';

export interface StatusMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error';
  timestamp: Date;
}

export function useStatusMessages() {
  const [messages, setMessages] = useState<StatusMessage[]>([]);

  const addMessage = (text: string, type: StatusMessage['type'] = 'info') => {
    const newMessage: StatusMessage = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (id: string, patch: Partial<Omit<StatusMessage, 'id'>>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return { messages, addMessage, updateMessage, clearMessages };
}
