import React, { useCallback } from 'react';

import { DragOver, Container, Header } from './style';
import Workspace from '../../layouts/Workspace';
import ChatList from '../../components/ChatList';
import ChatBox from '../../components/ChatBox';
import useInput from '../../hooks/useInput';

const Channel = () => {
  const [chat, onChangeChat, setChat] = useInput<string>('');

  const onSubmitChat = useCallback((e) => {
    e.preventDefault();
    setChat('');
  }, []);

  return (
    <Workspace>
      <Container>
        <Header>Channel</Header>
        <ChatList />
        <ChatBox chat={chat} onChange={onChangeChat} onSubmit={onSubmitChat} />
      </Container>
    </Workspace>
  );
};

export default Channel;
