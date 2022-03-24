import React, { FC, useCallback, useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

import { IChannelChat, IDMChat } from '../../types/types';
import { ChatListZone } from './style';
import Chat from '../Chat';

interface ChatListProps {
  chatData?: IDMChat[] | IChannelChat[];
}

const ChatList: FC<ChatListProps> = ({ chatData }) => {
  const scrollbarRef = useRef<Scrollbars>(null);

  // 스크롤바를 최상단으로 올렸을 때 과거 채팅 로딩
  const onScroll = useCallback(() => {}, []);

  return (
    <ChatListZone>
      <Scrollbars ref={scrollbarRef} onScrollFrame={onScroll}>
        {chatData?.map((chat) => (
          <Chat key={chat.id} data={chat} />
        ))}
      </Scrollbars>
    </ChatListZone>
  );
};

export default ChatList;
