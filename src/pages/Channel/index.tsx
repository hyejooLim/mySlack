import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import Scrollbars from 'react-custom-scrollbars-2';
import axios from 'axios';

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

  const { workspace, channel } = useParams<ParamType>();
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
            }
          }
        });
      }
    },
    [channel, scrollbarRef.current]
  );

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

  useEffect(() => {
    socket?.on('message', onMessage);

    return () => {
      socket?.off('message', onMessage);
    };
  }, [socket, onMessage]);

  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData, scrollbarRef.current]);

  const onClickInviteToChannel = useCallback(() => {
    setShowInviteToChannelModal(true);
  }, []);

  const onCloseInviteToChannelModal = useCallback(() => {
    setShowInviteToChannelModal(false);
  }, []);

  const chatSections = makeSections(chatData ? [...chatData].flat().reverse() : []);

  return (
    <Workspace>
      <Container>
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
        <ChatBox chat={chat} onChange={onChangeChat} onSubmit={onSubmitChat} />
        {showInviteToChannelModal && (
          <InviteToChannelModal
            showModal={showInviteToChannelModal}
            setShowModal={setShowInviteToChannelModal}
            onCloseModal={onCloseInviteToChannelModal}
          />
        )}
      </Container>
    </Workspace>
  );
};

export default Channel;
