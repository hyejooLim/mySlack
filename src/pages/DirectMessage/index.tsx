import React, { useRef, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import gravatar from 'gravatar';
import axios from 'axios';
import { Scrollbars } from 'react-custom-scrollbars-2';
import useSWRInfinite from 'swr/infinite';

import { DragOver, Container, Header } from './style';
import Workspace from '../../layouts/Workspace';
import { IDMChat, IUser, ParamType } from '../../types/types';
import fetcher from '../../utils/fetcher';
import ChatList from '../../components/ChatList';
import ChatBox from '../../components/ChatBox';
import useInput from '../../hooks/useInput';
import makeSections from '../../utils/makeSections';
import useSocket from '../../hooks/useSocket';

const DirectMessage = () => {
  const [chat, onChangeChat, setChat] = useInput<string>('');

  const { workspace, id } = useParams<ParamType>();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: memberData } = useSWR<IUser>(userData ? `/api/workspaces/${workspace}/users/${id}` : null, fetcher);
  const {
    data: chatData,
    mutate,
    setSize,
  } = useSWRInfinite<IDMChat[]>(
    (index) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
    fetcher
  );
  const [socket] = useSocket(workspace);

  const isEmpty = chatData?.[0].length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1].length < 20) || false;
  const scrollbarRef = useRef<Scrollbars>(null);

  const onDM = useCallback(
    (data: IDMChat) => {
      // 채팅 상대
      if (data.SenderId === Number(id)) {
        mutate((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 200
            ) {
              scrollbarRef.current.scrollToBottom();
            }
          }
        });
      }
    },
    [id, scrollbarRef.current]
  );

  useEffect(() => {
    socket?.on('dm', onDM);

    return () => {
      socket?.off('dm', onDM);
    };
  }, [socket, onDM]);

  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData, scrollbarRef.current]);

  const onSubmitChat = useCallback(
    async (e: any) => {
      e.preventDefault();

      if (!chat.trim()) return;

      try {
        await axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`, { content: chat }, { withCredentials: true });
        mutate();
        setChat('');
        setTimeout(() => {
          scrollbarRef.current?.scrollToBottom();
        }, 50);
      } catch (e: any) {
        console.log(e.message);
      }
    },
    [chat, workspace, id, scrollbarRef.current]
  );

  const chatSections = makeSections(chatData ? [...chatData].flat().reverse() : []);

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
        <ChatList chatSections={chatSections} ref={scrollbarRef} setSize={setSize} isReachingEnd={isReachingEnd} />
        <ChatBox chat={chat} onChange={onChangeChat} onSubmit={onSubmitChat} />
      </Container>
    </Workspace>
  );
};

export default DirectMessage;
