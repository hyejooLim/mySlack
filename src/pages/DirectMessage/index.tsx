import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import gravatar from 'gravatar';
import axios from 'axios';
import { Scrollbars } from 'react-custom-scrollbars-2';
import useSWRInfinite from 'swr/infinite';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [dragOver, setDragOver] = useState<boolean>(false);

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

  useEffect(() => {
    setTimeout(() => {
      scrollbarRef.current?.scrollToBottom();
    }, 50);
  }, [scrollbarRef.current]);

  const onDM = useCallback(
    (data: IDMChat) => {
      // 채팅 상대
      if (data.SenderId === Number(id)) {
        localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
        
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
            } else {
              toast.success('새 메시지가 도착했습니다.', {
                autoClose: 3000,
                position: toast.POSITION.BOTTOM_LEFT,
                onClick() {
                  scrollbarRef.current?.scrollToBottom();
                },
              });
            }
          }
        });
      }
    },
    [id, workspace, scrollbarRef.current]
  );

  useEffect(() => {
    socket?.on('dm', onDM);

    return () => {
      socket?.off('dm', onDM);
    };
  }, [socket, onDM]);

  useEffect(() => {
    localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
  }, [workspace, id]);

  const onSubmitChat = useCallback(
    async (e: any) => {
      e.preventDefault();

      if (!chat.trim()) return;

      try {
        await axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`, { content: chat }, { withCredentials: true });
        localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
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

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();

      const formData = new FormData();
      if (e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          if (e.dataTransfer.items[i].kind === 'file') {
            let file = e.dataTransfer.items[i].getAsFile();
            formData.append('image', file);
          }
        }
      } else {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          formData.append('image', e.dataTransfer.files[i]);
        }
      }

      axios.post(`/api/workspaces/${workspace}/dms/${id}/images`, formData).then(() => {
        localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
        mutate();
        setDragOver(false);
        setTimeout(() => {
          scrollbarRef.current?.scrollToBottom();
        }, 50);
      });
    },
    [workspace, id, scrollbarRef.current]
  );

  const chatSections = makeSections(chatData ? [...chatData].flat().reverse() : []);

  if (memberData === undefined) {
    return null;
  }

  return (
    <Workspace>
      <Container onDragOver={onDragOver} onDrop={onDrop}>
        <Header>
          <img src={gravatar.url(memberData.email, { s: '28px', d: 'retro' })} alt={memberData.nickname} />
          <span>{memberData.nickname}</span>
        </Header>
        <ChatList chatSections={chatSections} ref={scrollbarRef} setSize={setSize} isReachingEnd={isReachingEnd} />
        <ChatBox chat={chat} onChange={onChangeChat} onSubmit={onSubmitChat} placeholder='메시지를 입력하세요.' />
        {dragOver && <DragOver>Uploading...</DragOver>}
        <ToastContainer />
      </Container>
    </Workspace>
  );
};

export default DirectMessage;
