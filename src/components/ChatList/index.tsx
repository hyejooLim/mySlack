import React, { FC, useCallback, useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

import { IDMChat } from '../../types/types';
import { ChatListZone, Section, StickyHeader } from './style';
import Chat from '../Chat';

interface ChatListProps {
  chatSections: { [key: string]: IDMChat[] };
}

const ChatList: FC<ChatListProps> = ({ chatSections }) => {
  const scrollbarRef = useRef<Scrollbars>(null);

  // 스크롤바를 최상단으로 올렸을 때 과거 채팅 로딩
  const onScroll = useCallback(() => {}, []);

  return (
    <ChatListZone>
      <Scrollbars ref={scrollbarRef} onScrollFrame={onScroll}>
        {Object.entries(chatSections).map(([date, chats]) => (
          <Section key={date} className={`section-${date}`}>
            <StickyHeader>
              <button>{date}</button>
            </StickyHeader>
            {chats?.map((chat) => (
              <Chat key={chat.id} data={chat} />
            ))}
          </Section>
        ))}
      </Scrollbars>
    </ChatListZone>
  );
};

export default ChatList;
