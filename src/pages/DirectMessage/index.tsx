import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import gravatar from 'gravatar';
import axios from 'axios';

import { DragOver, Container, Header } from './style';
import Workspace from '../../layouts/Workspace';
import { IDM, IUser, ParamType } from '../../types/types';
import fetcher from '../../utils/fetcher';
import ChatList from '../../components/ChatList';
import ChatBox from '../../components/ChatBox';
import useInput from '../../hooks/useInput';

const DirectMessage = () => {
  const [chat, onChangeChat, setChat] = useInput<string>('');

  const { workspace, id } = useParams<ParamType>();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: memberData } = useSWR<IUser>(userData ? `/api/workspaces/${workspace}/users/${id}` : null, fetcher);
  const { data: chatData } = useSWR<IDM>(userData ? `/api/workspaces/${workspace}/dms/${id}/chats` : null, fetcher);

  const onSubmitChat = useCallback(
    async (e: any) => {
      e.preventDefault();

      if (!chat.trim()) return;

      try {
        await axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`, { content: chat }, { withCredentials: true });
        setChat('');
      } catch (e: any) {
        console.log(e.message);
      }
    },
    [chat]
  );

  if (memberData === undefined) {
    return null;
  }

  return (
    <Workspace>
      <Container>
        <Header>
          <img src={gravatar.url(memberData.email, { s: '28px', d: 'retro' })} alt={memberData.nickname} />
          <span>{memberData.nickname}</span>
        </Header>
        <ChatList />
        <ChatBox chat={chat} onChange={onChangeChat} onSubmit={onSubmitChat} />
      </Container>
    </Workspace>
  );
};

export default DirectMessage;
