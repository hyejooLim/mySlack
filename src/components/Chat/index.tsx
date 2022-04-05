import React, { FC, useMemo, memo } from 'react';
import { Link, useParams } from 'react-router-dom';
import gravatar from 'gravatar';
import dayjs from 'dayjs';
import regexifyString from 'regexify-string';

import { IChannelChat, IDMChat, ParamType } from '../../types/types';
import { ChatWrapper } from './style';

const BACK_URL = 'http://localhost:3095';

interface ChatProps {
  data: IDMChat | IChannelChat;
}

const Chat: FC<ChatProps> = ({ data }) => {
  const { workspace } = useParams<ParamType>();

  const user = 'Sender' in data ? data.Sender : data.User;

  const content = useMemo(
    () =>
      data.content.startsWith('uploads/') ? (
        <img src={`${BACK_URL}/${data.content}`} style={{ maxWidth: 200, maxHeight: 200 }} />
      ) : (
        regexifyString({
          input: data.content,
          pattern: /\@\[(.+)\]\((\d+)\)|\n/g,
          decorator(match, index) {
            const arr = match.match(/\@\[(.+)\]\((\d+)\)/);

            if (arr) {
              return (
                <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
                  @{arr[1]}
                </Link>
              );
            }

            return <br key={index} />;
          },
        })
      ),
    [workspace, data.content]
  );

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
        <p>{content}</p>
      </div>
    </ChatWrapper>
  );
};

export default memo(Chat);
