import React, { forwardRef, MutableRefObject, useCallback } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

import { IChannelChat, IDMChat } from '../../types/types';
import { ChatListZone, Section, StickyHeader } from './style';
import { ChatType } from '../../utils/makeSections';
import Chat from '../Chat';

interface ChatListProps {
  chatSections: { [key: string]: ChatType[] };
  setSize: (size: number | ((_size: number) => number)) => Promise<ChatType[][] | undefined>;
  isReachingEnd: boolean;
}

const ChatList = forwardRef<Scrollbars, ChatListProps>((props, scrollbarRef) => {
  const { chatSections, setSize, isReachingEnd } = props;

  // 스크롤바를 최상단으로 올렸을 때 과거 채팅 로딩
  const onScroll = useCallback(
    (values) => {
      if (values.scrollTop === 0 && !isReachingEnd) {
        setSize((prevSize) => prevSize + 1).then(() => {
          const current = (scrollbarRef as MutableRefObject<Scrollbars>)?.current;
          // 스크롤바 위치 유지
          if (current) {
            current.scrollTop(current.getScrollHeight() - values.scrollHeight);
          }
        });
      }
    },
    [isReachingEnd, setSize, scrollbarRef]
  );

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
});

export default ChatList;
