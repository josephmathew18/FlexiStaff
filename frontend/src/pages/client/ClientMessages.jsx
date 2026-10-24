import React from 'react';
import ChatView from '../../components/chat/ChatView';

export const ClientMessages = () => {
  return (
    <div className="w-full h-full p-4 lg:p-6">
      <ChatView title="Client Direct Messages" />
    </div>
  );
};

export default ClientMessages;
