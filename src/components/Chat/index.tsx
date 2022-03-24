import React, { FC } from 'react';
import gravatar from 'gravatar';
import dayjs from 'dayjs';

import { IChannelChat, IDMChat } from '../../types/types';
import { ChatWrapper } from './style';

interface ChatProps {
  data: IDMChat | IChannelChat;
}

const Chat: FC<ChatProps> = (props) => {
  const { data } = props;
  const user = 'Sender' in data ? data.Sender : data.User;

  return (
    <ChatWrapper>
      <div className='chat-img'>
        <img src={gravatar.url(user.email, { s: '28px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className='chat-text'>
        <div className='chat-user'>
          <b>{user.nickname}</b>
          <span>{dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        <p>{data.content}</p>
      </div>
    </ChatWrapper>
  );
};

export default Chat;
