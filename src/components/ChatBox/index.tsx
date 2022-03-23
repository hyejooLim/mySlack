import React, { FC, FormEventHandler, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Mention } from 'react-mentions';
import useSWR from 'swr';

import { ChatBoxZone, Form, MentionsTextarea, SendButton, Toolbox } from './style';
import fetcher from '../../utils/fetcher';
import { IUser, ParamType } from '../../types/types';

interface ChatBoxProps {
  chat: string;
  onChange: (e: any) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  placeholder?: string;
}

const ChatBox: FC<ChatBoxProps> = (props) => {
  const { workspace } = useParams<ParamType>();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: memberData } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);

  const { chat, onChange, onSubmit, placeholder } = props;

  const onKeyDownChat = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        onSubmit(e);
      }
    },
    [onSubmit]
  );

  return (
    <ChatBoxZone>
      <Form onSubmit={onSubmit}>
        <MentionsTextarea
          id='editor-chat'
          value={chat}
          onChange={onChange}
          placeholder={placeholder}
          onKeyDown={onKeyDownChat}
        >
          <Mention
            trigger='@'
            data={memberData?.map((member) => ({ id: member.id, display: member.nickname })) || []}
          />
        </MentionsTextarea>
        <Toolbox>
          <SendButton
            className={
              'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send' +
              (chat?.trim() ? '' : ' c-texty_input__button--disabled')
            }
            data-qa='texty_send_button'
            aria-label='Send message'
            data-sk='tooltip_parent'
            type='submit'
            disabled={!chat?.trim()}
          >
            <i className='c-icon c-icon--paperplane-filled' aria-hidden='true' />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatBoxZone>
  );
};

export default ChatBox;
