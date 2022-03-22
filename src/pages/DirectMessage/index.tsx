import React from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import gravatar from 'gravatar';

import { DragOver, Container, Header } from './style';
import Workspace from '../../layouts/Workspace';
import { IUser, ParamType } from '../../types/types';
import fetcher from '../../utils/fetcher';
import ChatList from '../../components/ChatList';
import ChatBox from '../../components/ChatBox';

const DirectMessage = () => {
  const { workspace, id } = useParams<ParamType>();
  const { data: memberData } = useSWR<IUser>(`/api/workspaces/${workspace}/users/${id}`, fetcher);

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
        <ChatBox />
      </Container>
    </Workspace>
  );
};

export default DirectMessage;
