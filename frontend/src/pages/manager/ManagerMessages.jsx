import React from 'react';
import ChatView from '../../components/chat/ChatView';

export const ManagerMessages = () => {
  return (
    <div className="w-full h-full p-4 lg:p-6">
      <ChatView title="Messages" />
    </div>
  );
};

export default ManagerMessages;
