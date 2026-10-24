import React from 'react';
import ChatView from '../../components/chat/ChatView';

export const PartnerMessages = () => {
  return (
    <div className="w-full h-full p-4 lg:p-6">
      <ChatView title="Partner Company Messages" />
    </div>
  );
};

export default PartnerMessages;
