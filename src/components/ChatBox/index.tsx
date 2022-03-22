import React, { useCallback } from 'react';
import useInput from '../../hooks/useInput';

import { ChatBoxZone, Form, MentionsTextarea, SendButton, Toolbox } from './style';

const ChatBox = () => {
  const [chat, onChangeChat, setChat] = useInput<string>('');

  const onSubmitChat = useCallback((e) => {
    e.preventDafault();
  }, []);

  return (
    <ChatBoxZone>
      <Form onSubmit={onSubmitChat}>
        <MentionsTextarea></MentionsTextarea>
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
