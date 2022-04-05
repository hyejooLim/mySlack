import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import Scrollbars from 'react-custom-scrollbars-2';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { DragOver, Container, Header } from './style';
import Workspace from '../../layouts/Workspace';
import ChatList from '../../components/ChatList';
import ChatBox from '../../components/ChatBox';
import useInput from '../../hooks/useInput';
import { IChannelChat, IUser, ParamType } from '../../types/types';
import fetcher from '../../utils/fetcher';
import makeSections from '../../utils/makeSections';
import InviteToChannelModal from '../../components/InviteToChannelModal';
import useSocket from '../../hooks/useSocket';

const Channel = () => {
  const [chat, onChangeChat, setChat] = useInput<string>('');
  const [showInviteToChannelModal, setShowInviteToChannelModal] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const { workspace, channel, id } = useParams<ParamType>();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: channelMemberData } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher
  );
  const {
    data: chatData,
    mutate,
    setSize,
  } = useSWRInfinite<IChannelChat[]>(
    (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
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

  const onMessage = useCallback(
    (data: IChannelChat) => {
      if (data.Channel.name === channel) {
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
    [channel, scrollbarRef.current]
  );

  useEffect(() => {
    socket?.on('message', onMessage);

    return () => {
      socket?.off('message', onMessage);
    };
  }, [socket, onMessage]);

  useEffect(() => {
    localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
  }, [workspace, channel]);

  const onSubmitChat = useCallback(
    async (e: any) => {
      e.preventDefault();

      if (!chat.trim()) return;

      try {
        await axios.post(
          `/api/workspaces/${workspace}/channels/${channel}/chats`,
          { content: chat },
          { withCredentials: true }
        );
        localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
        mutate();
        setChat('');
        setTimeout(() => {
          scrollbarRef.current?.scrollToBottom();
        }, 50);
      } catch (e: any) {
        console.log(e.message);
      }
    },
    [chat, workspace, channel, scrollbarRef.current]
  );

  const onClickInviteToChannel = useCallback(() => {
    setShowInviteToChannelModal(true);
  }, []);

  const onCloseInviteToChannelModal = useCallback(() => {
    setShowInviteToChannelModal(false);
  }, []);

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

      axios.post(`/api/workspaces/${workspace}/channels/${channel}/images`, formData).then(() => {
        localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
        mutate();
        setDragOver(false);
        setTimeout(() => {
          scrollbarRef.current?.scrollToBottom();
        }, 50);
      });
    },
    [workspace, channel, scrollbarRef.current]
  );

  const chatSections = makeSections(chatData ? [...chatData].flat().reverse() : []);

  return (
    <Workspace>
      <Container onDragOver={onDragOver} onDrop={onDrop}>
        <Header>
          <span># {channel}</span>
          <div className='header-right'>
            <span>{channelMemberData?.length}</span>
            <button
              onClick={onClickInviteToChannel}
              className='c-button-unstyled p-ia__view_header__button'
              aria-label='Add people to #react-native'
              data-sk='tooltip_parent'
              type='button'
            >
              <i className='c-icon p-ia__view_header__button_icon c-icon--add-user' aria-hidden='true' />
            </button>
          </div>
        </Header>
        <ChatList chatSections={chatSections} ref={scrollbarRef} setSize={setSize} isReachingEnd={isReachingEnd} />
        <ChatBox chat={chat} onChange={onChangeChat} onSubmit={onSubmitChat} placeholder='메시지를 입력하세요.' />
        {showInviteToChannelModal && (
          <InviteToChannelModal
            showModal={showInviteToChannelModal}
            setShowModal={setShowInviteToChannelModal}
            onCloseModal={onCloseInviteToChannelModal}
          />
        )}
        {dragOver && <DragOver>Uploading...</DragOver>}
        <ToastContainer />
      </Container>
    </Workspace>
  );
};

export default Channel;
