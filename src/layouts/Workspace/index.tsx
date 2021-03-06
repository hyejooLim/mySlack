import React, { FC, useCallback, useEffect, useState } from 'react';
import { Navigate, Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import axios from 'axios';
import gravatar from 'gravatar';

import fetcher from '../../utils/fetcher';
import {
  Header,
  RightMenu,
  ProfileImg,
  ProfileModal,
  LogOutButton,
  WorkspaceWrapper,
  Workspaces,
  Channels,
  WorkspaceName,
  MenuScroll,
  Chats,
  AddButton,
  WorkspaceButton,
  WorkspaceModal,
} from './style';
import Menu from '../../components/Menu';
import { ParamType, IChannel, IUser, IWorkspace } from '../../types/types';
import CreateChannelModal from '../../components/CreateChannelModal';
import CreateWorkspaceModal from '../../components/CreateWorkspaceModal';
import InviteToWorkspaceModal from '../../components/InviteToWorkspaceModal';
import ChannelList from '../../components/ChannelList';
import DMList from '../../components/DMList';
import useSocket from '../../hooks/useSocket';

const Workspace: FC = ({ children }) => {
  const [showUserProfileModal, setShowUserProfileModal] = useState<boolean>(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState<boolean>(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState<boolean>(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState<boolean>(false);
  const [showInviteToWorkspaceModal, setShowInviteToWorkspaceModal] = useState<boolean>(false);

  const { workspace } = useParams<ParamType>();

  const { data: userData, mutate } = useSWR<IUser>('/api/users', fetcher, { dedupingInterval: 2000 });
  const { data: channelData } = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher);
  const [socket, disconnect] = useSocket(workspace);

  useEffect(() => {
    if (userData && channelData && socket) {
      socket.emit('login', { id: userData.id, channels: channelData.map((channel) => channel.id) });
    }
  }, [userData, channelData, socket]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [workspace, disconnect]);

  const onLogOut = useCallback(async () => {
    try {
      await axios.post('/api/users/logout', null, { withCredentials: true });
      mutate();
    } catch (e: any) {
      console.log(e.message);
    }
  }, []);

  const onClickUserProfile = useCallback(() => {
    setShowUserProfileModal((prev) => !prev);
  }, []);

  const onCloseUserProfileModal = useCallback((e) => {
    e.stopPropagation();

    setShowUserProfileModal(false);
  }, []);

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);

  const onCloseCreateWorkspaceModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
  }, []);

  const onToggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
  }, []);

  const onClickCreateChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  const onCloseCreateChannelModal = useCallback(() => {
    setShowCreateChannelModal(false);
  }, []);

  const onClickInviteToWorkspace = useCallback(() => {
    setShowInviteToWorkspaceModal(true);
  }, []);

  const onCloseInviteToWorkspaceModal = useCallback(() => {
    setShowInviteToWorkspaceModal(false);
  }, []);

  if (!userData) {
    return <Navigate to={'/login'} />;
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <div onClick={onClickUserProfile}>
            <ProfileImg src={gravatar.url(userData.email, { s: '28px', d: 'retro' })} alt={userData.nickname} />
            {showUserProfileModal && (
              <Menu style={{ right: 0, top: 38 }} onCloseModal={onCloseUserProfileModal}>
                <ProfileModal>
                  <img src={gravatar.url(userData.email, { s: '36px', d: 'retro' })} alt={userData.nickname} />
                  <div>
                    <span className='profile-name'>{userData.nickname}</span>
                    <span className='profile-active'>Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogOut}>????????????</LogOutButton>
              </Menu>
            )}
          </div>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {userData.Workspaces.map((workspace: IWorkspace) => {
            return (
              <Link key={workspace.id} to={`/workspace/${workspace.url}/channel/??????`}>
                <WorkspaceButton>{workspace.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
          {showCreateWorkspaceModal && (
            <CreateWorkspaceModal
              setShowModal={setShowCreateWorkspaceModal}
              onCloseModal={onCloseCreateWorkspaceModal}
            />
          )}
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={onToggleWorkspaceModal}>
            {userData.Workspaces.find((ws) => ws.url === workspace)?.name}
          </WorkspaceName>
          <MenuScroll>
            {showWorkspaceModal && (
              <Menu style={{ top: 100, left: 80 }} onCloseModal={onToggleWorkspaceModal}>
                <WorkspaceModal>
                  <h2>{userData.Workspaces.find((ws) => ws.url === workspace)?.name}</h2>
                  <button onClick={onClickInviteToWorkspace}>????????????????????? ????????? ????????????</button>
                  <button onClick={onClickCreateChannel}>?????? ?????????</button>
                  <button onClick={onLogOut}>????????????</button>
                </WorkspaceModal>
              </Menu>
            )}
            <ChannelList />
            <DMList />
          </MenuScroll>
        </Channels>
        <Chats>{children}</Chats>
      </WorkspaceWrapper>
      {showCreateChannelModal && (
        <CreateChannelModal setShowModal={setShowCreateChannelModal} onCloseModal={onCloseCreateChannelModal} />
      )}
      {showInviteToWorkspaceModal && (
        <InviteToWorkspaceModal
          setShowModal={setShowInviteToWorkspaceModal}
          onCloseModal={onCloseInviteToWorkspaceModal}
        />
      )}
    </div>
  );
};

export default Workspace;
